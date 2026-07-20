import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader, ListRow } from '../../components';
import { SUPPORTED_LANGUAGES, setLanguage, type LanguageCode } from '../../i18n/language';
import { settingsScreenStyles as s } from '../../styles/screens';

type SettingsScreenProps = {
  onBack: () => void;
  onLogout: () => Promise<void>;
  onOpenAccount: () => void;
  onOpenNotifications: () => void;
};

export function SettingsScreen({
  onBack,
  onLogout,
  onOpenAccount,
  onOpenNotifications,
}: SettingsScreenProps) {
  const { t, i18n } = useTranslation();

  const handleLogout = useCallback(() => {
    void onLogout();
  }, [onLogout]);

  const handleSelectLanguage = useCallback((language: LanguageCode) => {
    void setLanguage(language);
  }, []);

  // `i18n.language` can carry a region suffix (e.g. "ms-MY"); compare the base.
  const activeLanguage = i18n.language.split('-')[0];

  return (
    <View style={s.container}>
      <AppHeader title={t('settings.title')} onBack={onBack} />

      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.sectionTitle}>{t('settings.sections.general')}</Text>

        <ListRow
          title={t('settings.items.account.label')}
          subtitle={t('settings.items.account.subtitle')}
          icon="person"
          rightIcon="chevron-right"
          onPress={onOpenAccount}
        />

        <ListRow
          title={t('settings.items.notifications.label')}
          subtitle={t('settings.items.notifications.subtitle')}
          icon="notifications"
          rightIcon="chevron-right"
          onPress={onOpenNotifications}
        />

        <Text style={s.sectionTitle}>{t('settings.sections.language')}</Text>

        <View style={s.languageRow}>
          <View style={s.languageIconWrap}>
            <MaterialIcons name="language" size={20} color={COLORS.secondary} />
          </View>

          <View style={s.languageTextWrap}>
            <Text style={s.languageTitle}>{t('settings.language.label')}</Text>
            <Text style={s.languageSubtitle}>{t('settings.language.subtitle')}</Text>
          </View>

          <View style={s.languageToggle}>
            {SUPPORTED_LANGUAGES.map((language) => {
              const active = activeLanguage === language;
              return (
                <Pressable
                  key={language}
                  onPress={() => handleSelectLanguage(language)}
                  style={[s.languageOption, active && s.languageOptionActive]}
                >
                  <Text style={[s.languageOptionText, active && s.languageOptionTextActive]}>
                    {t(`settings.language.options.${language}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

      </ScrollView>

      <Pressable style={s.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color={COLORS.error} />
        <Text style={s.logoutText}>{t('common.actions.logout')}</Text>
      </Pressable>
    </View>
  );
}
