import React from 'react';
import { Text, View } from 'react-native';
import {
  BadgeTone,
  badgeChipStyles,
  badgeToneStyles,
} from '../styles/components';

type BadgeChipProps = {
  label: string;
  tone?: BadgeTone;
};

export function BadgeChip({ label, tone = 'neutral' }: BadgeChipProps) {
  const toneStyle = badgeToneStyles[tone];

  return (
    <View style={[badgeChipStyles.chip, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[badgeChipStyles.label, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}
