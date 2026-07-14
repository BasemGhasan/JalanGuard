import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader, InfoCard } from '../../components';
import type { Hazard } from '../../types';
import { hazardDetailScreenStyles } from '../../styles/screens';

type HazardDetailScreenProps = {
  /** The hazard tapped on the map. Undefined for a direct/placeholder entry. */
  hazard?: Hazard;
  onBack: () => void;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1616107838939-1b29303d66c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

/** Humanises a snake_case defect type, e.g. "pot_hole" → "Pot Hole". */
function prettyDefectType(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function HazardDetailScreen({ hazard, onBack }: HazardDetailScreenProps) {
  const { t } = useTranslation();
  const [vote, setVote] = useState<'fixed' | 'broken' | null>(null);

  const heroImage = hazard?.image_urls?.[0] ?? hazard?.image_url ?? FALLBACK_IMAGE;
  const title = hazard ? prettyDefectType(hazard.defect_type) : t('hazardDetail.hazardName');
  const location = hazard
    ? `${hazard.latitude.toFixed(4)}, ${hazard.longitude.toFixed(4)}`
    : t('hazardDetail.hazardLocation');
  const reporter = hazard?.reporter_name ?? t('hazardDetail.reporterValue');

  return (
    <View style={hazardDetailScreenStyles.container}>
      <View style={hazardDetailScreenStyles.heroContainer}>
        <Image source={{ uri: heroImage }} style={hazardDetailScreenStyles.heroImage} />
        <View style={hazardDetailScreenStyles.headerOverlay}>
          <AppHeader title={t('hazardDetail.title')} onBack={onBack} />
        </View>
      </View>

      <ScrollView contentContainerStyle={hazardDetailScreenStyles.content}>
        <Text style={hazardDetailScreenStyles.title}>{title}</Text>
        <Text style={hazardDetailScreenStyles.subtitle}>{location}</Text>

        {hazard?.description ? (
          <Text style={hazardDetailScreenStyles.subtitle}>{hazard.description}</Text>
        ) : null}

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

        <InfoCard icon="person" title={t('hazardDetail.reporterTitle')} value={reporter} />
      </ScrollView>
    </View>
  );
}
