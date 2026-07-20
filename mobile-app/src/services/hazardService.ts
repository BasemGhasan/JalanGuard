/**
 * Hazard reporting service — real Supabase reads/writes, no mock data.
 *
 * Responsibilities:
 *   - Upload captured photos to the `hazard-images` Storage bucket.
 *   - Insert a hazard row (RLS requires `reported_by = auth.uid()`; the DB
 *     trigger auto-tags administrative boundaries from lat/long).
 *   - Fetch the signed-in user's own reports (History) and a derived activity feed.
 *
 * See the `hazard-submission-voting-schema` note: uploads MUST live under a
 * `<uid>/…` path or the Storage RLS policy rejects them.
 */
import { File } from 'expo-file-system';

import { supabase } from './supabase';
import { toFriendlyError } from '../utils/errors';
import { prettyDefectTypes } from '../utils/hazardDisplay';
import type { Hazard, NewHazardInput, ActivityItem } from '../types';

const BUCKET = 'hazard-images';

/** Uploads one local photo, returning its public URL. Path: `<uid>/<ts>-<n>.jpg`. */
async function uploadImage(userId: string, uri: string, index: number): Promise<string> {
  const bytes = await new File(uri).bytes();
  const path = `${userId}/${Date.now()}-${index}.jpg`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Uploads all photos then inserts the hazard row. Images are uploaded first so a
 * storage failure aborts before we create a report with missing media.
 *
 * @returns the created hazard row.
 */
export async function submitHazardReport(
  input: NewHazardInput,
  imageUris: string[],
): Promise<Hazard> {
  try {
    const imageUrls = input.imageUrls.length
      ? input.imageUrls
      : await Promise.all(imageUris.map((uri, i) => uploadImage(input.reportedBy, uri, i)));

    const { data, error } = await supabase
      .from('hazards')
      .insert({
        defect_type: input.defectType,
        defect_types: input.defectTypes.length ? input.defectTypes : [input.defectType],
        severity: input.severity,
        confidence: input.confidence,
        latitude: input.latitude,
        longitude: input.longitude,
        description: input.description,
        image_urls: imageUrls,
        reported_by: input.reportedBy,
        reporter_name: input.reporterName,
        status: 'active',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Hazard;
  } catch (error) {
    throw toFriendlyError(error, 'Could not submit your report. Please try again.');
  }
}

/** The signed-in user's own reports, newest first (History screen). */
export async function getMyReports(userId: string): Promise<Hazard[]> {
  try {
    const { data, error } = await supabase
      .from('hazards')
      .select('*')
      .eq('reported_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Hazard[] | null) ?? [];
  } catch (error) {
    throw toFriendlyError(error, 'Could not load your reports.');
  }
}

/**
 * Marks one of the user's own reports as fixed.
 *
 * RLS ("hazards owner update") restricts this to rows the caller reported, so
 * the `eq('reported_by')` here is belt-and-braces rather than the actual
 * guard — it also keeps the failure mode as "0 rows updated" instead of a
 * policy violation if called with someone else's id.
 */
export async function markReportFixed(hazardId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('hazards')
      .update({ status: 'fixed' })
      .eq('id', hazardId)
      .eq('reported_by', userId);
    if (error) throw error;
  } catch (error) {
    throw toFriendlyError(error, 'Could not update this report.');
  }
}

/**
 * Permanently deletes one of the user's own reports.
 *
 * Votes cascade with the hazard (hazard_votes.hazard_id ON DELETE CASCADE).
 * The uploaded photos are deliberately left in storage: they are keyed by user
 * id and cleaning them up would need a separate storage sweep, which is out of
 * scope for a row delete.
 */
export async function deleteMyReport(hazardId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('hazards')
      .delete()
      .eq('id', hazardId)
      .eq('reported_by', userId);
    if (error) throw error;
  } catch (error) {
    throw toFriendlyError(error, 'Could not delete this report.');
  }
}

/**
 * Loads a single hazard by id, or null if it no longer exists.
 *
 * Used when opening a notification: the outbox only stores the hazard id, and
 * the report may have been resolved or deleted since — so we read it fresh
 * rather than trusting a snapshot taken when the notification was queued.
 */
export async function getHazardById(hazardId: string): Promise<Hazard | null> {
  try {
    const { data, error } = await supabase
      .from('hazards')
      .select('*')
      .eq('id', hazardId)
      .maybeSingle();

    if (error) throw error;
    return (data as Hazard | null) ?? null;
  } catch (error) {
    throw toFriendlyError(error, 'Could not load this hazard.');
  }
}

/** Count of the user's reports (for stats), cheap head query. */
export async function getMyReportCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('hazards')
    .select('id', { count: 'exact', head: true })
    .eq('reported_by', userId);
  if (error) throw error;
  return count ?? 0;
}

const STATUS_TO_KIND: Record<string, ActivityItem['kind']> = {
  active: 'reported',
  in_review: 'in_review',
  pending: 'in_review',
  resolved: 'resolved',
  fixed: 'resolved',
};

/**
 * A real "recent activity" feed derived from the user's own reports and their
 * lifecycle status — replaces the old hardcoded activity list.
 */
export async function getRecentActivity(userId: string, limit = 6): Promise<ActivityItem[]> {
  try {
    const { data, error } = await supabase
      .from('hazards')
      .select('*')
      .eq('reported_by', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return ((data as Hazard[] | null) ?? []).map((hazard) => {
      const kind = STATUS_TO_KIND[hazard.status] ?? 'in_review';
      const prettyType = prettyDefectTypes(hazard);
      return {
        id: hazard.id,
        kind,
        title: prettyType,
        subtitle: `${hazard.latitude.toFixed(3)}, ${hazard.longitude.toFixed(3)}`,
        createdAt: hazard.created_at,
        hazard,
      };
    });
  } catch (error) {
    throw toFriendlyError(error, 'Could not load recent activity.');
  }
}
