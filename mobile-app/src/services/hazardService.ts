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
      const prettyType = hazard.defect_type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
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
