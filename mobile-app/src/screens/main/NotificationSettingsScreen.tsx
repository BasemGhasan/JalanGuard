import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader } from '../../components';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferences,
  saveNotificationPreferences,
} from '../../services';
import type { NotificationPreferences } from '../../types';
import { notificationSettingsScreenStyles as s } from '../../styles/screens';

type NotificationSettingsScreenProps = {
  onBack: () => void;
};

/** Rendered in order; keys map onto NotificationPreferences. */
const OPTIONS: Array<{
  key: keyof NotificationPreferences;
  icon: keyof typeof MaterialIcons.glyphMap;
}> = [
  { key: 'myReports', icon: 'campaign' },
  { key: 'nearbyHazards', icon: 'location-on' },
  { key: 'trustMilestones', icon: 'emoji-events' },
];

/**
 * Settings → Notifications: per-category toggles.
 *
 * Preferences are written to device storage on every change (no explicit save
 * button). Push delivery isn't wired up yet, so these currently record intent
 * only — the note at the bottom of the screen says so rather than implying
 * notifications are already being sent.
 */
export function NotificationSettingsScreen({ onBack }: NotificationSettingsScreenProps) {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );

  useEffect(() => {
    let active = true;
    void getNotificationPreferences().then((saved) => {
      if (active) setPreferences(saved);
    });
    return () => {
      active = false;
    };
  }, []);

  const toggle = useCallback((key: keyof NotificationPreferences) => {
    setPreferences((previous) => {
      const next = { ...previous, [key]: !previous[key] };
      void saveNotificationPreferences(next);
      return next;
    });
  }, []);

  return (
    <View style={s.screen}>
      <AppHeader title={t('notificationSettings.title')} onBack={onBack} />

      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.introText}>{t('notificationSettings.intro')}</Text>

        {OPTIONS.map(({ key, icon }) => (
          <View key={key} style={s.row}>
            <View style={s.iconWrap}>
              <MaterialIcons name={icon} size={20} color={COLORS.secondary} />
            </View>

            <View style={s.textWrap}>
              <Text style={s.rowTitle}>{t(`notificationSettings.options.${key}.label`)}</Text>
              <Text style={s.rowSubtitle}>{t(`notificationSettings.options.${key}.subtitle`)}</Text>
            </View>

            <Switch
              value={preferences[key]}
              onValueChange={() => toggle(key)}
              trackColor={{ false: COLORS.accent, true: COLORS.secondary }}
              thumbColor={COLORS.white}
            />
          </View>
        ))}

        <Text style={s.footnote}>{t('notificationSettings.footnote')}</Text>
      </ScrollView>
    </View>
  );
}
