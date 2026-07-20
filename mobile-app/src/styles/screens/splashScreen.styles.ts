import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const splashScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWrap: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  // The logo art already carries its own circular badge and transparency, so
  // it needs no background plate behind it — hence no wrapper View.
  logo: {
    width: 120,
    height: 120,
  },
  brandText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  tagline: {
    marginTop: SPACING.lg,
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    letterSpacing: 0.5,
  },
});
