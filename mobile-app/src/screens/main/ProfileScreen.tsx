import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader, InfoCard } from '../../components';
import { profileScreenStyles } from '../../styles/screens';

type ProfileScreenProps = {
  onLogout: () => Promise<void>;
  onOpenSettings: () => void;
};

export function ProfileScreen({ onLogout, onOpenSettings }: ProfileScreenProps) {
  const { t } = useTranslation();

  return (
    <ScrollView style={profileScreenStyles.container} contentContainerStyle={profileScreenStyles.content}>
      <AppHeader title={t('profile.title')} rightIcon="settings" onRightPress={onOpenSettings} />

      <View style={profileScreenStyles.avatar}>
        <Text style={profileScreenStyles.avatarText}>JG</Text>
      </View>
      <Text style={profileScreenStyles.name}>{t('profile.userName')}</Text>
      <Text style={profileScreenStyles.level}>{t('profile.level')}</Text>

      <View style={profileScreenStyles.statsWrap}>
        <InfoCard icon="warning" title={t('profile.stats.reports')} value="24" />
        <InfoCard icon="thumb-up" title={t('profile.stats.verifies')} value="58" />
        <InfoCard icon="emoji-events" title={t('profile.stats.rank')} value="#12" />
      </View>

      <Pressable style={profileScreenStyles.logoutButton} onPress={onLogout}>
        <MaterialIcons name="logout" size={18} color={COLORS.error} />
        <Text style={profileScreenStyles.logoutText}>{t('common.actions.logout')}</Text>
      </Pressable>
    </ScrollView>
  );
}
