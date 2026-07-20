import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader, BadgeChip, ListRow, StateView } from '../../components';
import { useMyReports, useRefetchOnFocus } from '../../hooks';
import { deleteMyReport, markReportFixed } from '../../services';
import { formatDate, prettyDefectTypes, severityTone, statusTone } from '../../utils';
import type { Hazard, UserProfile } from '../../types';
import { historyScreenStyles as s } from '../../styles/screens';

type HistoryScreenProps = {
  user: UserProfile | null;
  onOpenHazardDetail: (hazard: Hazard) => void;
};

/**
 * The signed-in user's own reports, straight from Supabase (no mock rows).
 *
 * Each still-active report carries two owner actions: mark it fixed (if the
 * user can see it's been repaired) or delete it outright. Both are backed by
 * RLS policies scoped to `reported_by = auth.uid()`, so the UI can only ever
 * offer what the database would actually permit.
 */
export function HistoryScreen({ user, onOpenHazardDetail }: HistoryScreenProps) {
  const { t } = useTranslation();
  const { data: reports, loading, error, retry } = useMyReports(user?.id);
  useRefetchOnFocus(retry);

  /** Id of the report currently being mutated, so only its buttons disable. */
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleResolve = useCallback(
    (hazard: Hazard) => {
      if (!user) return;
      Alert.alert(
        t('history.resolveConfirmTitle'),
        t('history.resolveConfirmMessage'),
        [
          { text: t('common.actions.cancel'), style: 'cancel' },
          {
            text: t('history.markFixed'),
            onPress: async () => {
              setBusyId(hazard.id);
              try {
                await markReportFixed(hazard.id, user.id);
                retry();
              } catch (err) {
                Alert.alert(
                  t('history.actionFailedTitle'),
                  err instanceof Error ? err.message : t('errors.generic'),
                );
              } finally {
                setBusyId(null);
              }
            },
          },
        ],
      );
    },
    [retry, t, user],
  );

  const handleDelete = useCallback(
    (hazard: Hazard) => {
      if (!user) return;
      Alert.alert(
        t('history.deleteConfirmTitle'),
        t('history.deleteConfirmMessage'),
        [
          { text: t('common.actions.cancel'), style: 'cancel' },
          {
            text: t('history.deleteReport'),
            style: 'destructive',
            onPress: async () => {
              setBusyId(hazard.id);
              try {
                await deleteMyReport(hazard.id, user.id);
                retry();
              } catch (err) {
                Alert.alert(
                  t('history.actionFailedTitle'),
                  err instanceof Error ? err.message : t('errors.generic'),
                );
              } finally {
                setBusyId(null);
              }
            },
          },
        ],
      );
    },
    [retry, t, user],
  );

  const renderItem = ({ item }: { item: Hazard }) => {
    const thumb = item.image_urls?.[0] ?? undefined;
    const busy = busyId === item.id;
    // Only an open report can be resolved; a fixed one can still be deleted.
    const canResolve = item.status === 'active';

    return (
      <View>
        <ListRow
          title={prettyDefectTypes(item)}
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

        <View style={s.actionRow}>
          {canResolve && (
            <Pressable style={s.actionButton} onPress={() => handleResolve(item)} disabled={busy}>
              <MaterialIcons name="check-circle-outline" size={16} color={COLORS.success} />
              <Text style={[s.actionButtonText, s.resolveText]}>{t('history.markFixed')}</Text>
            </Pressable>
          )}
          <Pressable style={s.actionButton} onPress={() => handleDelete(item)} disabled={busy}>
            <MaterialIcons name="delete-outline" size={16} color={COLORS.error} />
            <Text style={[s.actionButtonText, s.deleteText]}>{t('history.deleteReport')}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <AppHeader title={t('history.title')} />

      {loading || error ? (
        <StateView loading={loading} error={error} onRetry={retry} />
      ) : (
        <FlatList
          data={reports ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.content}
          ListHeaderComponent={
            (reports?.length ?? 0) > 0 ? (
              <Text style={s.summaryText}>
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
