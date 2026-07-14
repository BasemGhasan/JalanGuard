import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants';
import { reportTabButtonStyles } from '../styles/components';

type ReportTabButtonProps = {
  onPress: () => void;
};

export function ReportTabButton({ onPress }: ReportTabButtonProps) {
  const { t } = useTranslation();

  return (
    <View style={reportTabButtonStyles.wrapper}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t('common.actions.submitReport')}
        style={({ pressed }) => [reportTabButtonStyles.circle, pressed && reportTabButtonStyles.pressed]}
      >
        <MaterialIcons name="photo-camera" size={28} color={COLORS.white} />
      </Pressable>
    </View>
  );
}
