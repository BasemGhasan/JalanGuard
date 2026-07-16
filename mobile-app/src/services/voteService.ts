/**
 * Community voting service — persists "is it fixed?" votes to `hazard_votes`.
 *
 * Schema note (see `hazard-submission-voting-schema`): the column is `vote_type`
 * (legacy name), constrained to 'fixed' | 'broken'; one row per (hazard, user)
 * enforced by a unique constraint, so we upsert on conflict.
 */
import { supabase } from './supabase';
import { toFriendlyError } from '../utils/errors';
import type { VoteKind, VoteSummary } from '../types';

/** Public tally of fixed/broken votes for a hazard, via the SECURITY DEFINER RPC. */
export async function getVoteSummary(hazardId: string): Promise<VoteSummary> {
  try {
    const { data, error } = await supabase.rpc('hazard_vote_summary', { p_hazard_id: hazardId });
    if (error) throw error;
    // The RPC returns a single row { fixed_count, broken_count }.
    const row = Array.isArray(data) ? data[0] : data;
    return { fixed: row?.fixed_count ?? 0, broken: row?.broken_count ?? 0 };
  } catch (error) {
    throw toFriendlyError(error, 'Could not load votes.');
  }
}

/** The signed-in user's current vote on a hazard, or null if they haven't voted. */
export async function getMyVote(hazardId: string, userId: string): Promise<VoteKind | null> {
  try {
    const { data, error } = await supabase
      .from('hazard_votes')
      .select('vote_type')
      .eq('hazard_id', hazardId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return (data?.vote_type as VoteKind | undefined) ?? null;
  } catch (error) {
    throw toFriendlyError(error, 'Could not load your vote.');
  }
}

/**
 * Casts or updates the user's vote (upsert on the unique (hazard, user) pair).
 * Tapping the same choice again retracts the vote.
 *
 * @returns the resulting vote, or null if it was retracted.
 */
export async function castVote(
  hazardId: string,
  userId: string,
  vote: VoteKind,
  current: VoteKind | null,
): Promise<VoteKind | null> {
  try {
    if (current === vote) {
      const { error } = await supabase
        .from('hazard_votes')
        .delete()
        .eq('hazard_id', hazardId)
        .eq('user_id', userId);
      if (error) throw error;
      return null;
    }

    const { error } = await supabase
      .from('hazard_votes')
      .upsert(
        { hazard_id: hazardId, user_id: userId, vote_type: vote },
        { onConflict: 'hazard_id,user_id' },
      );
    if (error) throw error;
    return vote;
  } catch (error) {
    throw toFriendlyError(error, 'Could not save your vote.');
  }
}

/** Count of votes cast by a user (for contribution stats). */
export async function getMyVoteCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('hazard_votes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count ?? 0;
}
