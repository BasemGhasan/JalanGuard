import React from 'react';
import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader, BadgeChip, ListRow, StateView } from '../../components';
import { useRecentActivity } from '../../hooks';
import { formatDate } from '../../utils';
import type { ActivityItem, Hazard, UserProfile } from '../../types';
import { notificationsScreenStyles } from '../../styles/screens';

type NotificationsScreenProps = {
  user: UserProfile | null;
  onBack: () => void;
  onOpenHazardDetail: (hazard: Hazard) => void;
};

const KIND_ICON = {
  reported: 'add-alert',
  resolved: 'check-circle',
  in_review: 'hourglass-empty',
} as const;

const KIND_TONE = {
  reported: 'warning',
  resolved: 'success',
  in_review: 'neutral',
} as const;

/**
 * Notifications derived from the user's real report activity and its lifecycle
 * status — there is no separate notifications table, so this stays honest to the
 * data rather than showing invented alerts. Loading/error/empty via StateView.
 */
export function NotificationsScreen({ user, onBack, onOpenHazardDetail }: NotificationsScreenProps) {
  const { t } = useTranslation();
  const { data: activity, loading, error, retry } = useRecentActivity(user?.id, 20);

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <ListRow
      title={t(`notifications.kinds.${item.kind}`)}
      subtitle={`${item.title} · ${formatDate(item.createdAt)}`}
      icon={KIND_ICON[item.kind]}
      rightIcon="chevron-right"
      onPress={() => onOpenHazardDetail(item.hazard)}
    >
      <BadgeChip
        label={t(`common.status.${item.hazard.status}`, { defaultValue: item.hazard.status })}
        tone={KIND_TONE[item.kind]}
      />
    </ListRow>
  );

  return (
    <View style={notificationsScreenStyles.container}>
      <AppHeader title={t('notifications.title')} onBack={onBack} />

      {loading || error ? (
        <StateView loading={loading} error={error} onRetry={retry} />
      ) : (
        <FlatList
          data={activity ?? []}
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
