import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader, InfoCard } from '../../components';
import { hazardDetailScreenStyles } from '../../styles/screens';

type HazardDetailScreenProps = {
  onBack: () => void;
};

const HAZARD_IMAGE =
  'https://images.unsplash.com/photo-1616107838939-1b29303d66c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

export function HazardDetailScreen({ onBack }: HazardDetailScreenProps) {
  const { t } = useTranslation();
  const [vote, setVote] = useState<'fixed' | 'broken' | null>(null);

  return (
    <View style={hazardDetailScreenStyles.container}>
      <View style={hazardDetailScreenStyles.heroContainer}>
        <Image source={{ uri: HAZARD_IMAGE }} style={hazardDetailScreenStyles.heroImage} />
        <View style={hazardDetailScreenStyles.headerOverlay}>
          <AppHeader title={t('hazardDetail.title')} onBack={onBack} />
        </View>
      </View>

      <ScrollView contentContainerStyle={hazardDetailScreenStyles.content}>
        <Text style={hazardDetailScreenStyles.title}>{t('hazardDetail.hazardName')}</Text>
        <Text style={hazardDetailScreenStyles.subtitle}>{t('hazardDetail.hazardLocation')}</Text>

        <Text style={hazardDetailScreenStyles.sectionTitle}>{t('hazardDetail.communityVerification')}</Text>
        <Text style={hazardDetailScreenStyles.sectionHint}>{t('hazardDetail.verificationQuestion')}</Text>

        <View style={hazardDetailScreenStyles.voteRow}>
          <Pressable
            style={[hazardDetailScreenStyles.voteButton, vote === 'fixed' && hazardDetailScreenStyles.voteButtonActive]}
            onPress={() => setVote('fixed')}
          >
            <Text style={[hazardDetailScreenStyles.voteText, vote === 'fixed' && hazardDetailScreenStyles.voteTextActive]}>{t('common.actions.yesFixed')}</Text>
          </Pressable>
          <Pressable
            style={[hazardDetailScreenStyles.voteButton, vote === 'broken' && hazardDetailScreenStyles.voteButtonActive]}
            onPress={() => setVote('broken')}
          >
            <Text style={[hazardDetailScreenStyles.voteText, vote === 'broken' && hazardDetailScreenStyles.voteTextActive]}>{t('common.actions.stillBroken')}</Text>
          </Pressable>
        </View>

        <InfoCard icon="person" title={t('hazardDetail.reporterTitle')} value={t('hazardDetail.reporterValue')} />
      </ScrollView>
    </View>
  );
}
