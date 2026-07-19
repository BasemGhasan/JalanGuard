import React from 'react';
import { Pressable, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { primaryButtonStyles } from '../styles/components';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  /** Container override — typically top spacing from the field above. */
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      style={[primaryButtonStyles.button, disabled && primaryButtonStyles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={primaryButtonStyles.text}>{label}</Text>
      {icon ? <MaterialIcons name={icon} size={20} color={COLORS.white} /> : null}
    </Pressable>
  );
}
