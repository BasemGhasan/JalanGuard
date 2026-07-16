/**
 * Profile service — the citizen's trust score and aggregate contribution stats.
 *
 * Trust score lives on `public.profiles` (seeded to 50 for citizens by the
 * `handle_new_user` trigger). Report/vote counts are composed from the hazard
 * and vote services so the Profile and Home screens show real numbers.
 */
import { supabase } from './supabase';
import { toFriendlyError } from '../utils/errors';
import { getMyReportCount } from './hazardService';
import { getMyVoteCount } from './voteService';
import type { ReportStats } from '../types';

/** Reads the user's trust score from their profile row (null if unset). */
export async function getTrustScore(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('trust_score')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.trust_score as number | null) ?? null;
}

/**
 * Aggregate contribution stats for Profile/Home. Runs the three reads in
 * parallel and normalises any connectivity failure into a friendly error.
 */
export async function getContributionStats(userId: string): Promise<ReportStats> {
  try {
    const [reports, votes, trustScore] = await Promise.all([
      getMyReportCount(userId),
      getMyVoteCount(userId),
      getTrustScore(userId),
    ]);
    return { reports, votes, trustScore };
  } catch (error) {
    throw toFriendlyError(error, 'Could not load your stats.');
  }
}
