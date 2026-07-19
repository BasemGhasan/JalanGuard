import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const loginScreenStyles = StyleSheet.create({
  // Applied as a scroll content container by KeyboardAwareScreen — flexGrow,
  // not flex, or the form can't scroll clear of the keyboard.
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  passwordWrap: {
    marginTop: SPACING.md,
  },
  // The forgot-password link sits between the password field and the button,
  // so its margins provide the button's breathing room here.
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  forgotText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  linkText: {
    marginTop: SPACING.lg,
    textAlign: 'center',
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
