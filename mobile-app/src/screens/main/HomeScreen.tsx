import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { BadgeChip, ListRow } from '../../components';
import { homeScreenStyles } from '../../styles/screens';

type HomeScreenProps = {
  onOpenMap: () => void;
  onOpenNotifications: () => void;
};

const MAP_IMG =
  'https://images.unsplash.com/photo-1620662892011-f5c2d523fae2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

export function HomeScreen({ onOpenMap, onOpenNotifications }: HomeScreenProps) {
  const { t } = useTranslation();

  const activities = useMemo(
    () => [
      {
        title: t('home.activity.potholeReported'),
        subtitle: t('home.activity.potholeSubtitle'),
        tone: 'warning' as const,
        icon: 'warning' as const,
      },
      {
        title: t('home.activity.voteConfirmed'),
        subtitle: t('home.activity.voteSubtitle'),
        tone: 'success' as const,
        icon: 'thumb-up' as const,
      },
      {
        title: t('home.activity.badgeEarned'),
        subtitle: t('home.activity.badgeSubtitle'),
        tone: 'accent' as const,
        icon: 'emoji-events' as const,
      },
    ],
    [t],
  );

  return (
    <ScrollView style={homeScreenStyles.container} contentContainerStyle={homeScreenStyles.content}>
      <View style={homeScreenStyles.header}>
        <View>
          <Text style={homeScreenStyles.greeting}>{t('home.greeting')}</Text>
          <Text style={homeScreenStyles.name}>{t('home.helloUser')}</Text>
        </View>
        <Pressable onPress={onOpenNotifications} style={homeScreenStyles.notificationButton}>
          <MaterialIcons name="notifications" size={22} color={COLORS.white} />
        </Pressable>
      </View>

      <View style={homeScreenStyles.statsCard}>
        <Text style={homeScreenStyles.statsTitle}>{t('home.contributions')}</Text>
        <View style={homeScreenStyles.statsRow}>
          <View style={homeScreenStyles.statItem}>
            <Text style={homeScreenStyles.statValue}>3</Text>
            <Text style={homeScreenStyles.statLabel}>{t('home.stats.reports')}</Text>
          </View>
          <View style={homeScreenStyles.statItem}>
            <Text style={homeScreenStyles.statValue}>12</Text>
            <Text style={homeScreenStyles.statLabel}>{t('home.stats.votes')}</Text>
          </View>
          <View style={homeScreenStyles.statItem}>
            <Text style={homeScreenStyles.statValue}>750</Text>
            <Text style={homeScreenStyles.statLabel}>{t('home.stats.trust')}</Text>
          </View>
        </View>
      </View>

      <Pressable style={homeScreenStyles.mapCard} onPress={onOpenMap}>
        <Image source={{ uri: MAP_IMG }} style={homeScreenStyles.mapImage} />
        <View style={homeScreenStyles.mapOverlay}>
          <Text style={homeScreenStyles.mapTitle}>{t('home.communityMap')}</Text>
          <Text style={homeScreenStyles.mapSubtitle}>{t('home.hazardsNearby')}</Text>
        </View>
      </Pressable>

      <Text style={homeScreenStyles.sectionTitle}>{t('home.recentActivity')}</Text>
      {activities.map((item) => (
        <ListRow
          key={item.title}
          title={item.title}
          subtitle={item.subtitle}
          icon={item.icon}
          rightIcon="chevron-right"
        >
          <BadgeChip
            label={
              item.tone === 'success'
                ? t('home.badges.verified')
                : item.tone === 'accent'
                  ? t('home.badges.reward')
                  : t('home.badges.pending')
            }
            tone={item.tone}
          />
        </ListRow>
      ))}
    </ScrollView>
  );
}
