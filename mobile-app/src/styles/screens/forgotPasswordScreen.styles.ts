import { StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants';

export const forgotPasswordScreenStyles = StyleSheet.create({
  // Applied as a scroll content container by KeyboardAwareScreen — flexGrow,
  // not flex, or the form can't scroll clear of the keyboard.
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  // Matches the register form: the button gets more air than the field gaps.
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
});
