import { StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants';

export const registerScreenStyles = StyleSheet.create({
  // Applied as a scroll content container by KeyboardAwareScreen — flexGrow,
  // not flex, or the form can't scroll clear of the keyboard.
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  inputSpacing: {
    marginTop: SPACING.md,
  },
  // Wider than the gaps between fields so the button reads as a separate
  // action rather than a fourth row of the form.
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
