import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const registerScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  subtitle: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
  },
  inputSpacing: {
    marginTop: SPACING.md,
  },
  linkText: {
    marginTop: SPACING.lg,
    textAlign: 'center',
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
