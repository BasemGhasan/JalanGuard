/**
 * Data hooks for the citizen's own contributions — stats, report history, and
 * the derived activity feed. Each wraps `useAsyncData` for consistent
 * loading/error/retry behaviour and stays idle until a user id is available.
 */
import { useCallback } from 'react';

import { useAsyncData } from './useAsyncData';
import {
  getContributionStats,
  getMyNotifications,
  getMyReports,
  getRecentActivity,
  getUnreadNotificationCount,
  type NotificationEntry,
} from '../services';
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

/** The user's notification history, newest first. */
export function useMyNotifications(userId: string | undefined, limit = 30) {
  const fetcher = useCallback(() => getMyNotifications(userId as string, limit), [userId, limit]);
  return useAsyncData<NotificationEntry[]>(fetcher, Boolean(userId));
}

/** Unread count behind the Home screen's bell badge. */
export function useUnreadNotificationCount(userId: string | undefined) {
  const fetcher = useCallback(() => getUnreadNotificationCount(userId as string), [userId]);
  return useAsyncData<number>(fetcher, Boolean(userId));
}
