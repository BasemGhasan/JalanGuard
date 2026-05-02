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
  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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
