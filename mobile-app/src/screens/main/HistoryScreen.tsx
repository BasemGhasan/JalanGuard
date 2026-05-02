import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader, BadgeChip, ListRow } from '../../components';
import { historyScreenStyles } from '../../styles/screens';

const REPORT_IMG =
  'https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

export function HistoryScreen() {
  const { t } = useTranslation();

  const reports = [
    {
      title: t('history.reports.severePothole.title'),
      location: t('history.reports.severePothole.location'),
      severity: t('history.reports.severePothole.severity'),
      severityTone: 'danger' as const,
      status: t('history.reports.severePothole.status'),
      statusTone: 'warning' as const,
    },
    {
      title: t('history.reports.roadCrack.title'),
      location: t('history.reports.roadCrack.location'),
      severity: t('history.reports.roadCrack.severity'),
      severityTone: 'warning' as const,
      status: t('history.reports.roadCrack.status'),
      statusTone: 'success' as const,
    },
    {
      title: t('history.reports.brokenPavement.title'),
      location: t('history.reports.brokenPavement.location'),
      severity: t('history.reports.brokenPavement.severity'),
      severityTone: 'danger' as const,
      status: t('history.reports.brokenPavement.status'),
      statusTone: 'warning' as const,
    },
  ];

  return (
    <View style={historyScreenStyles.container}>
      <AppHeader title={t('history.title')} />
      <ScrollView contentContainerStyle={historyScreenStyles.content}>
        <Text style={historyScreenStyles.summaryText}>{t('history.summary', { count: reports.length })}</Text>

        {reports.map((report) => (
          <ListRow
            key={report.title}
            title={report.title}
            subtitle={report.location}
            thumbnailUri={REPORT_IMG}
            rightIcon="chevron-right"
          >
            <BadgeChip label={report.severity} tone={report.severityTone} />
            <BadgeChip label={report.status} tone={report.statusTone} />
          </ListRow>
        ))}
      </ScrollView>
    </View>
  );
}
