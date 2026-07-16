/**
 * Community-vote hook for the Hazard Detail screen.
 *
 * Loads the public tally + the user's current vote, and exposes a `vote` action
 * that upserts/retracts via `voteService` and refreshes the tally. Tapping the
 * current choice again clears the vote (handled server-side).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { castVote, getMyVote, getVoteSummary } from '../services';
import type { VoteKind, VoteSummary } from '../types';

export function useHazardVotes(hazardId: string | undefined, userId: string | undefined) {
  const [summary, setSummary] = useState<VoteSummary>({ fixed: 0, broken: 0 });
  const [myVote, setMyVote] = useState<VoteKind | null>(null);
  const [loading, setLoading] = useState(Boolean(hazardId));
  const [error, setError] = useState<Error | null>(null);
  const [voting, setVoting] = useState(false);

  const activeRef = useRef(true);
  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!hazardId) return;
    setLoading(true);
    setError(null);
    try {
      const [nextSummary, nextVote] = await Promise.all([
        getVoteSummary(hazardId),
        userId ? getMyVote(hazardId, userId) : Promise.resolve<VoteKind | null>(null),
      ]);
      if (!activeRef.current) return;
      setSummary(nextSummary);
      setMyVote(nextVote);
    } catch (err) {
      if (activeRef.current) setError(err instanceof Error ? err : new Error('Could not load votes.'));
    } finally {
      if (activeRef.current) setLoading(false);
    }
  }, [hazardId, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const vote = useCallback(
    async (kind: VoteKind) => {
      if (!hazardId || !userId || voting) return;
      setVoting(true);
      setError(null);
      try {
        const result = await castVote(hazardId, userId, kind, myVote);
        const nextSummary = await getVoteSummary(hazardId);
        if (!activeRef.current) return;
        setMyVote(result);
        setSummary(nextSummary);
      } catch (err) {
        if (activeRef.current) setError(err instanceof Error ? err : new Error('Could not save your vote.'));
      } finally {
        if (activeRef.current) setVoting(false);
      }
    },
    [hazardId, userId, myVote, voting],
  );

  return { summary, myVote, loading, error, voting, vote, retry: load };
}
