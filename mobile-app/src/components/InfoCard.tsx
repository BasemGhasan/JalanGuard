import React from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { infoCardStyles } from '../styles/components';

type InfoCardProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value: string;
};

export function InfoCard({ icon, title, value }: InfoCardProps) {
  return (
    <View style={infoCardStyles.card}>
      <View style={infoCardStyles.iconWrap}>
        <MaterialIcons name={icon} size={20} color={COLORS.secondary} />
      </View>
      <View style={infoCardStyles.textWrap}>
        <Text style={infoCardStyles.title}>{title}</Text>
        <Text style={infoCardStyles.value}>{value}</Text>
      </View>
    </View>
  );
}
