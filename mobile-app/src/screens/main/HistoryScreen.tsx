import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader, BadgeChip, ListRow, StateView } from '../../components';
import { useMyReports, useRefetchOnFocus } from '../../hooks';
import { formatDate, prettyDefectType, severityTone, statusTone } from '../../utils';
import type { Hazard, UserProfile } from '../../types';
import { historyScreenStyles } from '../../styles/screens';

type HistoryScreenProps = {
  user: UserProfile | null;
  onOpenHazardDetail: (hazard: Hazard) => void;
};

/**
 * The signed-in user's own reports, straight from Supabase (no mock rows).
 * Loading, error+retry and empty states are all handled by StateView.
 */
export function HistoryScreen({ user, onOpenHazardDetail }: HistoryScreenProps) {
  const { t } = useTranslation();
  const { data: reports, loading, error, retry } = useMyReports(user?.id);
  useRefetchOnFocus(retry);

  const renderItem = ({ item }: { item: Hazard }) => {
    const thumb = item.image_urls?.[0] ?? item.image_url ?? undefined;
    return (
      <ListRow
        title={prettyDefectType(item.defect_type)}
        subtitle={formatDate(item.created_at)}
        thumbnailUri={thumb}
        icon={thumb ? undefined : 'warning'}
        rightIcon="chevron-right"
        onPress={() => onOpenHazardDetail(item)}
      >
        <BadgeChip label={t(`common.severity.${item.severity}`)} tone={severityTone(item.severity)} />
        <BadgeChip
          label={t(`common.status.${item.status}`, { defaultValue: item.status })}
          tone={statusTone(item.status)}
        />
      </ListRow>
    );
  };

  return (
    <View style={historyScreenStyles.container}>
      <AppHeader title={t('history.title')} />

      {loading || error ? (
        <StateView loading={loading} error={error} onRetry={retry} />
      ) : (
        <FlatList
          data={reports ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={historyScreenStyles.content}
          ListHeaderComponent={
            (reports?.length ?? 0) > 0 ? (
              <Text style={historyScreenStyles.summaryText}>
                {t('history.summary', { count: reports?.length ?? 0 })}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <StateView
              empty
              emptyIcon="assignment"
              emptyTitle={t('history.emptyTitle')}
              emptyMessage={t('history.emptyMessage')}
            />
          }
        />
      )}
    </View>
  );
}
