import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader, BadgeChip, InfoCard, StateView } from '../../components';
import { useHazardVotes } from '../../hooks';
import { formatDate, prettyDefectTypes, severityTone } from '../../utils';
import type { Hazard, UserProfile, VoteKind } from '../../types';
import { hazardDetailScreenStyles as s, HERO_WIDTH } from '../../styles/screens';

type HazardDetailScreenProps = {
  /** The hazard tapped on the map or in History. Undefined for a stale/deep entry. */
  hazard?: Hazard;
  user: UserProfile | null;
  onBack: () => void;
};

/**
 * Community auto-resolve thresholds, mirrored from
 * `public.hazard_autoresolve_threshold()` so the UI can show progress toward
 * the rule. The database remains the sole authority on actually applying it —
 * these values only drive the meter's copy.
 */
const AUTO_RESOLVE_MIN_VOTES = 10;
const AUTO_RESOLVE_PERCENT = 80;

export function HazardDetailScreen({ hazard, user, onBack }: HazardDetailScreenProps) {
  const { t } = useTranslation();
  const [photoIndex, setPhotoIndex] = useState(0);

  const { summary, myVote, loading, error, voting, vote } = useHazardVotes(hazard?.id, user?.id);

  const images = useMemo(() => {
    if (!hazard) return [];
    return hazard.image_urls ?? [];
  }, [hazard]);

  // Guard against a missing hazard instead of rendering mock placeholder data.
  if (!hazard) {
    return (
      <View style={s.container}>
        <AppHeader title={t('hazardDetail.title')} onBack={onBack} />
        <StateView
          empty
          emptyIcon="report-off"
          emptyTitle={t('hazardDetail.missingTitle')}
          emptyMessage={t('hazardDetail.missingMessage')}
        />
      </View>
    );
  }

  const title = prettyDefectTypes(hazard);
  const location = `${hazard.latitude.toFixed(4)}, ${hazard.longitude.toFixed(4)}`;
  const reporter = hazard.reporter_name?.trim() || t('hazardDetail.reporterUnknown');

  // Mirrors public.recompute_hazard_status — keep the thresholds in step.
  const totalVotes = summary.fixed + summary.broken;
  const fixedPercent = totalVotes > 0 ? Math.round((summary.fixed / totalVotes) * 100) : 0;
  const votesNeeded = Math.max(0, AUTO_RESOLVE_MIN_VOTES - totalVotes);
  const isResolved = hazard.status === 'fixed' || hazard.status === 'resolved';

  const voteButton = (kind: VoteKind, label: string, count: number) => {
    const active = myVote === kind;
    return (
      <Pressable
        style={[s.voteButton, active && s.voteButtonActive, voting && s.voteButtonDisabled]}
        onPress={() => vote(kind)}
        disabled={voting || loading}
      >
        <Text style={s.voteText}>{label}</Text>
        <Text style={s.voteCount}>{count}</Text>
      </Pressable>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.heroContainer}>
        {images.length > 0 ? (
          <FlatList
            data={images}
            keyExtractor={(uri, i) => `${uri}-${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / HERO_WIDTH))
            }
            renderItem={({ item }) => <Image source={{ uri: item }} style={s.heroImage} />}
          />
        ) : (
          <View style={s.heroPlaceholder}>
            <MaterialIcons name="image-not-supported" size={48} color={COLORS.disabled} />
          </View>
        )}

        <View style={s.headerOverlay}>
          <AppHeader title={t('hazardDetail.title')} onBack={onBack} />
        </View>

        {images.length > 1 && (
          <View style={s.photoCounter}>
            <Text style={s.photoCounterText}>
              {t('hazardDetail.photoCount', { index: photoIndex + 1, total: images.length })}
            </Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.titleRow}>
          <Text style={s.title}>{title}</Text>
          <BadgeChip label={t(`common.severity.${hazard.severity}`)} tone={severityTone(hazard.severity)} />
        </View>
        <Text style={s.subtitle}>{location}</Text>
        <Text style={s.subtitle}>{t('hazardDetail.reportedOn', { date: formatDate(hazard.created_at) })}</Text>

        {hazard.description ? <Text style={s.description}>{hazard.description}</Text> : null}

        <Text style={s.sectionTitle}>{t('hazardDetail.communityVerification')}</Text>
        <Text style={s.sectionHint}>{t('hazardDetail.verificationQuestion')}</Text>

        {isResolved && (
          <View style={s.resolvedBanner}>
            <MaterialIcons name="verified" size={18} color={COLORS.success} />
            <Text style={s.resolvedBannerText}>{t('hazardDetail.resolvedBanner')}</Text>
          </View>
        )}

        {/* Consensus meter — how close this report is to auto-resolving. */}
        <View style={s.consensusWrap}>
          <View style={s.consensusHeader}>
            <Text style={s.consensusPercent}>
              {t('hazardDetail.fixedPercent', { percent: fixedPercent })}
            </Text>
            <Text style={s.consensusCount}>
              {t('hazardDetail.voteCount', { count: totalVotes })}
            </Text>
          </View>

          <View style={s.consensusTrack}>
            <View style={[s.consensusFill, { width: `${fixedPercent}%` }]} />
          </View>

          {!isResolved && (
            <Text style={s.consensusHint}>
              {votesNeeded > 0
                ? t('hazardDetail.consensusNeedsVotes', {
                    count: votesNeeded,
                    percent: AUTO_RESOLVE_PERCENT,
                  })
                : t('hazardDetail.consensusThreshold', { percent: AUTO_RESOLVE_PERCENT })}
            </Text>
          )}
        </View>

        <View style={s.voteRow}>
          {voteButton('fixed', t('common.actions.yesFixed'), summary.fixed)}
          {voteButton('broken', t('common.actions.stillBroken'), summary.broken)}
        </View>
        {error ? <Text style={s.errorText}>{error.message}</Text> : null}

        <InfoCard icon="person" title={t('hazardDetail.reporterTitle')} value={reporter} />
      </ScrollView>
    </View>
  );
}
