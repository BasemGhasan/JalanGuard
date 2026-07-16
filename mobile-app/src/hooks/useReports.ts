/**
 * Data hooks for the citizen's own contributions — stats, report history, and
 * the derived activity feed. Each wraps `useAsyncData` for consistent
 * loading/error/retry behaviour and stays idle until a user id is available.
 */
import { useCallback } from 'react';

import { useAsyncData } from './useAsyncData';
import { getContributionStats, getMyReports, getRecentActivity } from '../services';
import type { ActivityItem, Hazard, ReportStats } from '../types';

export function useContributionStats(userId: string | undefined) {
  const fetcher = useCallback(() => getContributionStats(userId as string), [userId]);
  return useAsyncData<ReportStats>(fetcher, Boolean(userId));
}

export function useMyReports(userId: string | undefined) {
  const fetcher = useCallback(() => getMyReports(userId as string), [userId]);
  return useAsyncData<Hazard[]>(fetcher, Boolean(userId));
}

export function useRecentActivity(userId: string | undefined, limit = 6) {
  const fetcher = useCallback(() => getRecentActivity(userId as string, limit), [userId, limit]);
  return useAsyncData<ActivityItem[]>(fetcher, Boolean(userId));
}
