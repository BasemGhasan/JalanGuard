import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader, ListRow } from '../../components';
import { settingsScreenStyles } from '../../styles/screens';

type SettingsScreenProps = {
  onBack: () => void;
  onLogout: () => Promise<void>;
};

export function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
  const { t } = useTranslation();

  const items = [
    { icon: 'person', label: t('settings.items.account.label'), subtitle: t('settings.items.account.subtitle') },
    {
      icon: 'notifications',
      label: t('settings.items.notifications.label'),
      subtitle: t('settings.items.notifications.subtitle'),
    },
    { icon: 'lock', label: t('settings.items.privacy.label'), subtitle: t('settings.items.privacy.subtitle') },
    { icon: 'help', label: t('settings.items.help.label'), subtitle: t('settings.items.help.subtitle') },
  ] as const;

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleLogout = useCallback(() => {
    void onLogout();
  }, [onLogout]);

  return (
    <View style={settingsScreenStyles.container}>
      <AppHeader title={t('settings.title')} onBack={handleBack} />

      <ScrollView contentContainerStyle={settingsScreenStyles.content}>
        {items.map((item) => (
          <ListRow
            key={item.label}
            title={item.label}
            subtitle={item.subtitle}
            icon={item.icon}
            rightIcon="chevron-right"
          />
        ))}
      </ScrollView>

      <Pressable style={settingsScreenStyles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color={COLORS.error} />
        <Text style={settingsScreenStyles.logoutText}>{t('common.actions.logout')}</Text>
      </Pressable>
    </View>
  );
}
