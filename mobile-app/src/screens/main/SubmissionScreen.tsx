import React, { useCallback } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants';
import { AppHeader, InfoCard, PrimaryButton } from '../../components';
import { submissionScreenStyles } from '../../styles/screens';

type SubmissionScreenProps = {
  onBack: () => void;
  onSubmit: () => void;
};

const PREVIEW_IMAGE =
  'https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

export function SubmissionScreen({ onBack, onSubmit }: SubmissionScreenProps) {
  const { t } = useTranslation();

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleSubmit = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <View style={submissionScreenStyles.container}>
      <AppHeader title={t('submission.title')} onBack={handleBack} />

      <ScrollView contentContainerStyle={submissionScreenStyles.content}>
        <Image source={{ uri: PREVIEW_IMAGE }} style={submissionScreenStyles.previewImage} />

        <InfoCard icon="location-on" title={t('submission.gpsCoordinates')} value={t('submission.gpsValue')} />

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
