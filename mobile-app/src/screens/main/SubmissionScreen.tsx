import React, { useCallback } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader, InfoCard, PrimaryButton } from '../../components';
import { submissionScreenStyles } from '../../styles/screens';

type SubmissionScreenProps = {
  photoUri: string;
  latitude: number | null;
  longitude: number | null;
  onBack: () => void;
  onSubmit: () => void;
};

export function SubmissionScreen({ photoUri, latitude, longitude, onBack, onSubmit }: SubmissionScreenProps) {
  const { t } = useTranslation();

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleSubmit = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  const gpsValue =
    latitude !== null && longitude !== null
      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : t('submission.gpsUnavailable');

  return (
    <View style={submissionScreenStyles.container}>
      <AppHeader title={t('submission.title')} onBack={handleBack} />

      <ScrollView contentContainerStyle={submissionScreenStyles.content}>
        <Image source={{ uri: photoUri }} style={submissionScreenStyles.previewImage} />

        <InfoCard icon="location-on" title={t('submission.gpsCoordinates')} value={gpsValue} />

        <InfoCard icon="analytics" title={t('submission.aiSeverityAssessment')} value={t('submission.aiSeverityValue')} />

        <Text style={submissionScreenStyles.sectionTitle}>{t('submission.hazardType')}</Text>
        <View style={submissionScreenStyles.tagRow}>
          <Text style={[submissionScreenStyles.tag, submissionScreenStyles.tagActive]}>{t('submission.hazardTags.pothole')}</Text>
          <Text style={submissionScreenStyles.tag}>{t('submission.hazardTags.crack')}</Text>
          <Text style={submissionScreenStyles.tag}>{t('submission.hazardTags.debris')}</Text>
        </View>
      </ScrollView>

      <View style={submissionScreenStyles.submitWrap}>
        <PrimaryButton label={t('common.actions.submitReport')} icon="chevron-right" onPress={handleSubmit} />
      </View>
    </View>
  );
}
