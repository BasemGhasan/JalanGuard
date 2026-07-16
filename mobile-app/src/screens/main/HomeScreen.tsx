import React, { useCallback } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING } from '../../constants';
import { BadgeChip, ListRow, StateView } from '../../components';
import { useContributionStats, useRecentActivity, useRefetchOnFocus } from '../../hooks';
import { formatDate } from '../../utils';
import type { ActivityItem, UserProfile } from '../../types';
import { homeScreenStyles } from '../../styles/screens';

type HomeScreenProps = {
  user: UserProfile | null;
  onOpenMap: () => void;
  onOpenNotifications: () => void;
};

const KIND_TONE = {
  reported: 'warning',
  resolved: 'success',
  in_review: 'neutral',
} as const;

const KIND_ICON = {
  reported: 'warning',
  resolved: 'check-circle',
  in_review: 'hourglass-empty',
} as const;

export function HomeScreen({ user, onOpenMap, onOpenNotifications }: HomeScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { data: stats, loading: statsLoading, retry: retryStats } = useContributionStats(user?.id);
  const { data: activity, loading, error, retry } = useRecentActivity(user?.id);

  // Refresh contributions + activity when returning to the Home tab (e.g. after
  // submitting a report), since tab screens stay mounted and won't refetch.
  const refreshHome = useCallback(() => {
    retryStats();
    retry();
  }, [retryStats, retry]);
  useRefetchOnFocus(refreshHome);

  const statValue = (value: number | null | undefined): string =>
    statsLoading ? '…' : value == null ? '0' : String(value);

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';

  const renderActivity = (item: ActivityItem) => {
    const statusLabel = t(`common.status.${item.hazard.status}`, { defaultValue: item.hazard.status });
    return (
      <ListRow
        key={item.id}
        title={item.title}
        subtitle={`${formatDate(item.createdAt)} · ${statusLabel}`}
        icon={KIND_ICON[item.kind]}
        rightIcon="chevron-right"
      >
        <BadgeChip label={statusLabel} tone={KIND_TONE[item.kind]} />
      </ListRow>
    );
  };

  return (
    <ScrollView
      style={homeScreenStyles.container}
      contentContainerStyle={[homeScreenStyles.content, { paddingTop: insets.top + SPACING.lg }]}
    >
      <View style={homeScreenStyles.header}>
        <View style={homeScreenStyles.headerText}>
          <Text style={homeScreenStyles.greeting}>{t('home.greeting')}</Text>
          {firstName ? <Text style={homeScreenStyles.name}>{firstName}</Text> : null}
        </View>
        <Pressable onPress={onOpenNotifications} style={homeScreenStyles.notificationButton}>
          <MaterialIcons name="notifications" size={22} color={COLORS.white} />
        </Pressable>
      </View>

      <View style={homeScreenStyles.statsCard}>
        <Text style={homeScreenStyles.statsTitle}>{t('home.contributions')}</Text>
        <View style={homeScreenStyles.statsRow}>
          <View style={homeScreenStyles.statItem}>
            <Text style={homeScreenStyles.statValue}>{statValue(stats?.reports)}</Text>
            <Text style={homeScreenStyles.statLabel}>{t('home.stats.reports')}</Text>
          </View>
          <View style={homeScreenStyles.statItem}>
            <Text style={homeScreenStyles.statValue}>{statValue(stats?.votes)}</Text>
            <Text style={homeScreenStyles.statLabel}>{t('home.stats.votes')}</Text>
          </View>
          <View style={homeScreenStyles.statItem}>
            <Text style={homeScreenStyles.statValue}>{statValue(stats?.trustScore)}</Text>
            <Text style={homeScreenStyles.statLabel}>{t('home.stats.trust')}</Text>
          </View>
        </View>
      </View>

      <Pressable style={homeScreenStyles.mapCard} onPress={onOpenMap}>
        <Image source={require('../../../assets/mapImage.png')} style={homeScreenStyles.mapImage} />
        
        <View style={homeScreenStyles.mapHeader}>
          <View style={homeScreenStyles.mapIcon}>
            <MaterialIcons name="map" size={26} color={COLORS.secondary} />
          </View>
          <View style={homeScreenStyles.mapTextWrap}>
            <Text style={homeScreenStyles.mapTitle}>{t('home.communityMap')}</Text>
            <Text style={homeScreenStyles.mapSubtitle}>{t('home.mapSubtitle')}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.disabled} />
        </View>
      </Pressable>


      <Text style={homeScreenStyles.sectionTitle}>{t('home.recentActivity')}</Text>

      {loading || error ? (
        <StateView loading={loading} error={error} onRetry={retry} />
      ) : (activity?.length ?? 0) === 0 ? (
        <StateView
          empty
          emptyIcon="timeline"
          emptyTitle={t('home.activityEmptyTitle')}
          emptyMessage={t('home.activityEmptyMessage')}
        />
      ) : (
        activity!.map(renderActivity)
      )}
    </ScrollView>
  );
}
