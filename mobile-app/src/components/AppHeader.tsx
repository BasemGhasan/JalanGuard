import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants';
import { appHeaderStyles } from '../styles/components';

type AppHeaderProps = {
  title: string;
  onBack?: () => void;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightPress?: () => void;
};

export function AppHeader({ title, onBack, rightIcon, onRightPress }: AppHeaderProps) {
  // Pad the header below the status bar / notch on every device instead of the
  // old hardcoded 64px, which overlapped content on some screens.
  const insets = useSafeAreaInsets();

  return (
    <View style={[appHeaderStyles.row, { paddingTop: insets.top + SPACING.sm }]}>
      {onBack ? (
        <Pressable style={appHeaderStyles.iconButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={22} color={COLORS.white} />
        </Pressable>
      ) : (
        <View style={appHeaderStyles.placeholder} />
      )}

      <Text style={appHeaderStyles.title}>{title}</Text>

      {rightIcon ? (
        <Pressable style={appHeaderStyles.iconButton} onPress={onRightPress}>
          <MaterialIcons name={rightIcon} size={20} color={COLORS.white} />
        </Pressable>
      ) : (
        <View style={appHeaderStyles.placeholder} />
      )}
    </View>
  );
}
