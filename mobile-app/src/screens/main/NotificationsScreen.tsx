import React, { useCallback, useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppHeader, ListRow, StateView } from '../../components';
import { useMyNotifications, useRefetchOnFocus } from '../../hooks';
import { getHazardById, markNotificationsRead } from '../../services';
import type { NotificationEntry } from '../../services';
import { formatDate } from '../../utils';
import type { Hazard, UserProfile } from '../../types';
import { notificationsScreenStyles } from '../../styles/screens';

type NotificationsScreenProps = {
  user: UserProfile | null;
  onBack: () => void;
  onOpenHazardDetail: (hazard: Hazard) => void;
};

const KIND_ICON: Record<NotificationEntry['kind'], keyof typeof MaterialIcons.glyphMap> = {
  my_reports: 'campaign',
  nearby_hazards: 'location-on',
  report_checkin: 'event-repeat',
};

/**
 * The user's real notification history, read from `notification_outbox` — the
 * same queue the push dispatcher drains, so this list and the pushes actually
 * delivered stay in step by construction.
 *
 * Tapping an entry loads its hazard on demand: the outbox only stores the id,
 * and the hazard may have changed (or been deleted) since the notification was
 * queued, so fetching now is more truthful than embedding a stale snapshot.
 */
export function NotificationsScreen({ user, onBack, onOpenHazardDetail }: NotificationsScreenProps) {
  const { t } = useTranslation();
  const { data: notifications, loading, error, retry } = useMyNotifications(user?.id);
  useRefetchOnFocus(retry);

  /**
   * Opening this screen clears the unread badge. Deliberately fired once on
   * mount rather than per-row: the badge means "there's something you haven't
   * looked at", and the list is that look. The Home screen re-reads the count
   * when it regains focus, so the badge is gone by the time you go back.
   *
   * Runs after the fetch that populated the list, so `readAt` on the rows
   * already on screen stays as it was — unread ones keep their highlight for
   * this visit instead of clearing under the user's eyes.
   */
  useEffect(() => {
    if (!user?.id) return;
    void markNotificationsRead().catch(() => {
      // Non-fatal: the badge simply persists until the next visit.
    });
  }, [user?.id]);

  const handleOpen = useCallback(
    async (hazardId: string | null) => {
      if (!hazardId) return;
      const hazard = await getHazardById(hazardId);
      if (hazard) onOpenHazardDetail(hazard);
    },
    [onOpenHazardDetail],
  );

  const renderItem = ({ item }: { item: NotificationEntry }) => (
    <View style={item.readAt ? undefined : notificationsScreenStyles.unreadRow}>
      <ListRow
        title={item.title}
        subtitle={`${item.body} · ${formatDate(item.createdAt)}`}
        icon={KIND_ICON[item.kind]}
        rightIcon={item.hazardId ? 'chevron-right' : undefined}
        onPress={item.hazardId ? () => void handleOpen(item.hazardId) : undefined}
      />
    </View>
  );

  return (
    <View style={notificationsScreenStyles.container}>
      <AppHeader title={t('notifications.title')} onBack={onBack} />

      {loading || error ? (
        <StateView loading={loading} error={error} onRetry={retry} />
      ) : (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={notificationsScreenStyles.listContainer}
          ListEmptyComponent={
            <StateView
              empty
              emptyIcon="notifications-none"
              emptyTitle={t('notifications.emptyTitle')}
              emptyMessage={t('notifications.emptyMessage')}
            />
          }
        />
      )}
    </View>
  );
}
