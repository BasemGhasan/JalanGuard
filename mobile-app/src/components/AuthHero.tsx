import React from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { authHeroStyles } from '../styles/components';

type AuthHeroProps = {
  /** Glyph for the badge above the title — one per auth screen. */
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
};

/**
 * Centred icon badge + title + subtitle shown above every auth form.
 *
 * The auth screens run without a navigation header, so this both fills the
 * space the header used to occupy and gives each screen a visual identity.
 * Shared by Login, Register and ForgotPassword so the three stay in step.
 */
export function AuthHero({ icon, title, subtitle }: AuthHeroProps) {
  return (
    <View style={authHeroStyles.wrap}>
      <View style={authHeroStyles.iconBadge}>
        <MaterialIcons name={icon} size={44} color={COLORS.secondary} />
      </View>
      <Text style={authHeroStyles.title}>{title}</Text>
      <Text style={authHeroStyles.subtitle}>{subtitle}</Text>
    </View>
  );
}
