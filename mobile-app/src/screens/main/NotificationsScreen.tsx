import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader, BadgeChip, ListRow } from '../../components';
import { notificationsScreenStyles } from '../../styles/screens';

type NotificationsScreenProps = {
  onBack: () => void;
};

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const { t } = useTranslation();

  const notifications = [
    {
      title: t('notifications.items.trustPoints.title'),
      subtitle: t('notifications.items.trustPoints.subtitle'),
      type: 'reward',
      icon: 'emoji-events' as const,
      tone: 'accent' as const,
      typeLabel: t('notifications.items.trustPoints.type'),
    },
    {
      title: t('notifications.items.reportFixed.title'),
      subtitle: t('notifications.items.reportFixed.subtitle'),
      type: 'update',
      icon: 'check-circle' as const,
      tone: 'success' as const,
      typeLabel: t('notifications.items.reportFixed.type'),
    },
    {
      title: t('notifications.items.photoUpdate.title'),
      subtitle: t('notifications.items.photoUpdate.subtitle'),
      type: 'action',
      icon: 'camera-alt' as const,
      tone: 'warning' as const,
      typeLabel: t('notifications.items.photoUpdate.type'),
    },
  ];

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <View style={notificationsScreenStyles.container}>
      <AppHeader title={t('notifications.title')} onBack={handleBack} />

      <ScrollView contentContainerStyle={notificationsScreenStyles.listContainer}>
        {notifications.map((item) => (
          <ListRow key={item.title} title={item.title} subtitle={item.subtitle} icon={item.icon}>
            <BadgeChip label={item.typeLabel} tone={item.tone} />
          </ListRow>
        ))}
      </ScrollView>
    </View>
  );
}
