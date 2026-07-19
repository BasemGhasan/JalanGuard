import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING } from '../../constants';
import { AppHeader, BadgeChip, InfoCard, PrimaryButton } from '../../components';
import { AiDetectionError, analyzeHazardPhoto, submitHazardReport } from '../../services';
import type { AiDetectionResult, Severity, UserProfile } from '../../types';
import type { BadgeTone } from '../../styles/components';
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

/** AI validation lifecycle for the captured photo. */
type Analysis =
  | { status: 'analyzing' }
  | { status: 'success'; result: AiDetectionResult }
  | { status: 'error'; message: string; noHazard: boolean };

const SEVERITY_TONE: Record<Severity, BadgeTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'success',
};

/**
 * Review-and-submit screen for a captured hazard.
 *
 * The photo is sent to the AI detection microservice FIRST (see `aiService`).
 * The model must verify a hazard before anything is written to the database, and
 * the detected **type(s)** and **severity** are auto-filled and locked — the user
 * cannot change them. No detection ⇒ an error is shown and nothing is submitted.
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

  const [analysis, setAnalysis] = useState<Analysis>({ status: 'analyzing' });
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLocation = latitude !== null && longitude !== null;

  // Run AI validation as soon as we have a photo (and re-run on "Try again").
  const runAnalysis = useCallback(async () => {
    setAnalysis({ status: 'analyzing' });
    try {
      const result = await analyzeHazardPhoto(photoUri);
      setAnalysis({ status: 'success', result });
    } catch (err) {
      if (err instanceof AiDetectionError) {
        setAnalysis({ status: 'error', message: err.message, noHazard: err.noHazard });
      } else {
        setAnalysis({
          status: 'error',
          message: err instanceof Error ? err.message : t('submission.errorTitle'),
          noHazard: false,
        });
      }
    }
  }, [photoUri, t]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  const gpsValue = hasLocation
    ? `${latitude!.toFixed(4)}, ${longitude!.toFixed(4)}`
    : t('submission.gpsUnavailable');

  const canSubmit = analysis.status === 'success' && hasLocation && !submitting;

  const handleSubmit = useCallback(async () => {
    if (submitting || analysis.status !== 'success') return;
    if (!user) {
      setError(t('submission.errorTitle'));
      return;
    }
    if (!hasLocation) {
      setError(t('submission.locationRequired'));
      return;
    }

    const { result } = analysis;
    setSubmitting(true);
    setError(null);
    try {
      await submitHazardReport(
        {
          // AI-driven, non-editable classification.
          defectType: result.primaryType ?? result.defectTypes[0],
          defectTypes: result.defectTypes,
          severity: result.severity!,
          confidence: result.confidence,
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
    analysis,
    user,
    hasLocation,
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

        {/* ── AI validation: analyzing / error / detected ─────────────────── */}
        {analysis.status === 'analyzing' && (
          <View style={s.aiCard}>
            <ActivityIndicator color={COLORS.secondary} />
            <View style={s.aiCardText}>
              <Text style={s.aiCardTitle}>{t('submission.analyzingTitle')}</Text>
              <Text style={s.aiCardHint}>{t('submission.analyzingHint')}</Text>
            </View>
          </View>
        )}

        {analysis.status === 'error' && (
          <View style={[s.aiCard, s.aiCardError]}>
            <MaterialIcons
              name={analysis.noHazard ? 'search-off' : 'error-outline'}
              size={22}
              color={COLORS.error}
            />
            <View style={s.aiCardText}>
              <Text style={s.aiErrorTitle}>
                {analysis.noHazard
                  ? t('submission.noHazardTitle')
                  : t('submission.analysisFailedTitle')}
              </Text>
              <Text style={s.aiCardHint}>{analysis.message}</Text>
            </View>
          </View>
        )}

        {analysis.status === 'success' && (
          <>
            <View style={s.aiVerifiedRow}>
              <MaterialIcons name="verified" size={16} color={COLORS.success} />
              <Text style={s.aiVerifiedText}>{t('submission.aiVerified')}</Text>
            </View>

            <Text style={s.sectionTitle}>{t('submission.hazardTypeDetected')}</Text>
            <View style={s.tagRow}>
              {analysis.result.defectTypes.map((type) => (
                <BadgeChip key={type} label={t(`submission.hazardTags.${type}`)} tone="accent" />
              ))}
            </View>
            <Text style={s.noteText}>
              {analysis.result.defectTypes.length > 1
                ? t('submission.multiTypeNote')
                : t('submission.hazardTypeLockedHint')}
            </Text>

            <Text style={s.sectionTitle}>{t('submission.aiSeverityAssessment')}</Text>
            <View style={s.severityRow}>
              <BadgeChip
                label={t(`common.severity.${analysis.result.severity!}`)}
                tone={SEVERITY_TONE[analysis.result.severity!]}
              />
              {analysis.result.confidence !== null && (
                <Text style={s.confidenceText}>
                  {t('submission.confidenceValue', {
                    confidence: Math.round(analysis.result.confidence * 100),
                  })}
                </Text>
              )}
            </View>
            <Text style={s.noteText}>{t('submission.severityLockedHint')}</Text>
          </>
        )}

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
        {analysis.status === 'error' ? (
          <PrimaryButton
            label={analysis.noHazard ? t('submission.retakePhoto') : t('submission.retry')}
            icon={analysis.noHazard ? 'photo-camera' : 'refresh'}
            onPress={analysis.noHazard ? onBack : runAnalysis}
          />
        ) : (
          <PrimaryButton
            label={submitting ? t('submission.submitting') : t('common.actions.submitReport')}
            icon="chevron-right"
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
