/**
 * Profile service — the citizen's aggregate contribution stats.
 *
 * Report and vote counts are composed from the hazard and vote services so the
 * Profile and Home screens show real numbers.
 */
import { toFriendlyError } from '../utils/errors';
import { getMyReportCount } from './hazardService';
import { getMyVoteCount } from './voteService';
import type { ReportStats } from '../types';

/**
 * Aggregate contribution stats for Profile/Home. Runs both reads in parallel
 * and normalises any connectivity failure into a friendly error.
 */
export async function getContributionStats(userId: string): Promise<ReportStats> {
  try {
    const [reports, votes] = await Promise.all([
      getMyReportCount(userId),
      getMyVoteCount(userId),
    ]);
    return { reports, votes };
  } catch (error) {
    throw toFriendlyError(error, 'Could not load your stats.');
  }
}
