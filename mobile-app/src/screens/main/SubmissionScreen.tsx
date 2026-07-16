import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { SPACING } from '../../constants';
import { AppHeader, InfoCard, PrimaryButton } from '../../components';
import { getImageByteSize, submitHazardReport } from '../../services';
import { estimateSeverity } from '../../utils';
import type { UserProfile } from '../../types';
import { submissionScreenStyles as s } from '../../styles/screens';

type SubmissionScreenProps = {
  photoUri: string;
  latitude: number | null;
  longitude: number | null;
  user: UserProfile | null;
  onBack: () => void;
  /** Called after a successful submit so the shell can return to the tabs. */
  onSubmitted: () => void;
};

const HAZARD_TYPES = ['pothole', 'crack', 'debris'] as const;
type HazardType = (typeof HAZARD_TYPES)[number];

/**
 * Review-and-submit screen for a captured hazard.
 *
 * Real end-to-end flow: uploads the photo to Supabase Storage and inserts a
 * `hazards` row (see `hazardService`). The severity shown is a transparent
 * client-side estimate (see `estimateSeverity`) standing in for the not-yet-built
 * YOLO service — labelled "preliminary" so it never masquerades as a real model.
 */
export function SubmissionScreen({
  photoUri,
  latitude,
  longitude,
  user,
  onBack,
  onSubmitted,
}: SubmissionScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [defectType, setDefectType] = useState<HazardType>('pothole');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLocation = latitude !== null && longitude !== null;

  // Size is a cheap stat; severity re-estimates when the chosen type changes.
  const imageBytes = useMemo(() => getImageByteSize(photoUri), [photoUri]);
  const estimate = useMemo(() => estimateSeverity(defectType, imageBytes), [defectType, imageBytes]);

  const gpsValue = hasLocation
    ? `${latitude!.toFixed(4)}, ${longitude!.toFixed(4)}`
    : t('submission.gpsUnavailable');

  const severityValue = t('submission.severityValue', {
    severity: t(`common.severity.${estimate.severity}`),
    confidence: Math.round(estimate.confidence * 100),
  });

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (!user) {
      setError(t('submission.errorTitle'));
      return;
    }
    if (!hasLocation) {
      setError(t('submission.locationRequired'));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitHazardReport(
        {
          defectType,
          severity: estimate.severity,
          confidence: estimate.confidence,
          latitude: latitude!,
          longitude: longitude!,
          description: description.trim() || null,
          imageUrls: [],
          reportedBy: user.id,
          reporterName: user.name,
        },
        [photoUri],
      );
      Alert.alert(t('submission.successTitle'), t('submission.successMessage'));
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submission.errorTitle'));
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    user,
    hasLocation,
    defectType,
    estimate,
    latitude,
    longitude,
    description,
    photoUri,
    onSubmitted,
    t,
  ]);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title={t('submission.title')} onBack={onBack} />

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Image source={{ uri: photoUri }} style={s.previewImage} />

        <InfoCard icon="location-on" title={t('submission.gpsCoordinates')} value={gpsValue} />
        {!hasLocation && <Text style={s.warningText}>{t('submission.locationRequired')}</Text>}

        <InfoCard icon="analytics" title={t('submission.aiSeverityAssessment')} value={severityValue} />
        <Text style={s.noteText}>{t('submission.preliminaryNote')}</Text>

        <Text style={s.sectionTitle}>{t('submission.hazardType')}</Text>
        <Text style={s.sectionHint}>{t('submission.hazardTypeHint')}</Text>
        <View style={s.tagRow}>
          {HAZARD_TYPES.map((type) => {
            const active = defectType === type;
            return (
              <Pressable key={type} onPress={() => setDefectType(type)}>
                <Text style={[s.tag, active && s.tagActive]}>{t(`submission.hazardTags.${type}`)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={s.sectionTitle}>{t('submission.descriptionLabel')}</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t('submission.descriptionPlaceholder')}
          placeholderTextColor="#94A3B8"
          multiline
          style={s.descriptionInput}
          editable={!submitting}
        />
      </ScrollView>

      <View style={[s.submitWrap, { paddingBottom: insets.bottom + SPACING.md }]}>
        {error && <Text style={s.errorText}>{error}</Text>}
        <PrimaryButton
          label={submitting ? t('submission.submitting') : t('common.actions.submitReport')}
          icon="chevron-right"
          onPress={handleSubmit}
          disabled={submitting || !hasLocation}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
