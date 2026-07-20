import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const verifyEmailScreenStyles = StyleSheet.create({
  // Applied as a scroll content container by KeyboardAwareScreen — flexGrow,
  // not flex, or the form can't scroll clear of the keyboard.
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  linkText: {
    marginTop: SPACING.lg,
    textAlign: 'center',
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryLinkText: {
    marginTop: SPACING.md,
    textAlign: 'center',
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
