import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationPreferences } from '../types';

/**
 * Notification preferences, stored on the device.
 *
 * These are kept local rather than on `profiles` because nothing server-side
 * consumes them yet — push delivery isn't wired up, so the Notifications screen
 * is currently the only reader. When a push backend lands, this module is the
 * single place that has to start syncing to Supabase.
 */
const NOTIFICATION_PREFS_KEY = 'jalanguard.notificationPrefs';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  myReports: true,
  nearbyHazards: true,
  trustMilestones: false,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    // Spread over the defaults so a preference added in a later release gets a
    // sensible value instead of `undefined` on an existing install.
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(preferences));
  } catch {
    // Non-fatal: the toggle still reflects the change for this session.
  }
}
