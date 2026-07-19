import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const forgotPasswordScreenStyles = StyleSheet.create({
  // Applied as a scroll content container by KeyboardAwareScreen — flexGrow,
  // not flex, or the form can't scroll clear of the keyboard.
  container: {
    flexGrow: 1,
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
  linkText: {
    marginTop: SPACING.lg,
    textAlign: 'center',
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
