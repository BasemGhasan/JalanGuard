/**
 * In-app notifications.
 *
 * Notifications are produced server-side by database triggers (see
 * `supabase/migrations/…_push_notifications.sql`) into `notification_outbox`:
 *   - my_reports     — a vote on, or auto-resolution of, a hazard you reported
 *   - nearby_hazards — a new report close to your last known location
 *   - report_checkin — the daily cron's 30-day "is this still there?" reminder
 *
 * Delivery is in-app only. Remote push was removed deliberately: it needs a
 * custom EAS development build on both platforms and a paid Apple Developer
 * membership on iOS, which isn't worth it here. The Notifications screen reads
 * this queue directly, and unread rows drive the badge on the Home screen.
 */
import { supabase } from './supabase';

/** One notification, as shown on the Notifications screen. */
export type NotificationEntry = {
  id: string;
  kind: 'my_reports' | 'nearby_hazards' | 'report_checkin';
  title: string;
  body: string;
  hazardId: string | null;
  createdAt: string;
  readAt: string | null;
};

/**
 * The user's notification history, newest first.
 * RLS restricts `notification_outbox` to the caller's own rows.
 */
export async function getMyNotifications(
  userId: string,
  limit = 30,
): Promise<NotificationEntry[]> {
  const { data, error } = await supabase
    .from('notification_outbox')
    .select('id, kind, title, body, hazard_id, created_at, read_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    kind: row.kind as NotificationEntry['kind'],
    title: row.title as string,
    body: row.body as string,
    hazardId: (row.hazard_id as string | null) ?? null,
    createdAt: row.created_at as string,
    readAt: (row.read_at as string | null) ?? null,
  }));
}

/**
 * How many notifications the user hasn't opened yet — drives the Home badge.
 * Head-only count query, so no rows travel over the wire.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notification_outbox')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Marks every unread notification as read; called when the Notifications
 * screen opens. Goes through an RPC because users are allowed to set `read_at`
 * and nothing else — a plain row-scoped UPDATE policy would also let a client
 * rewrite its own notification titles and bodies.
 *
 * @returns how many rows were marked.
 */
export async function markNotificationsRead(): Promise<number> {
  const { data, error } = await supabase.rpc('mark_my_notifications_read');
  if (error) throw error;
  return (data as number | null) ?? 0;
}

/**
 * Records the device's coarse location so the backend can decide whether a new
 * hazard counts as "nearby". Only ever the last known point, never a history.
 */
export async function updateLastKnownLocation(
  userId: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  try {
    await supabase
      .from('profiles')
      .update({
        last_latitude: latitude,
        last_longitude: longitude,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch {
    // Non-fatal: at worst this user misses proximity alerts until next time.
  }
}

/** Mirrors the user's toggles to the server, which does the filtering. */
export async function syncNotificationPreferences(
  userId: string,
  preferences: { myReports: boolean; nearbyHazards: boolean; reportCheckins: boolean },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      notify_my_reports: preferences.myReports,
      notify_nearby_hazards: preferences.nearbyHazards,
      notify_report_checkin: preferences.reportCheckins,
    })
    .eq('id', userId);
  if (error) throw error;
}
