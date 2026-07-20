import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationPreferences } from '../types';

/**
 * Notification preferences.
 *
 * Stored on the device for instant toggle feedback, and mirrored to
 * `profiles.notify_*` by `notificationService.syncNotificationPreferences` —
 * the server needs its own copy because the DB triggers that enqueue
 * notifications can't read device storage.
 */
const NOTIFICATION_PREFS_KEY = 'jalanguard.notificationPrefs';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  myReports: true,
  nearbyHazards: true,
  reportCheckins: true,
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
