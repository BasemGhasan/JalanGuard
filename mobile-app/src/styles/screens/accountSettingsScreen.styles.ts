import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const accountSettingsScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  // Scroll content container (KeyboardAwareScreen) — flexGrow, not flex.
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    letterSpacing: 0.08 * FONT_SIZES.sm,
    textTransform: 'uppercase',
  },
  hintText: {
    marginTop: SPACING.sm,
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
  },
  fieldSpacing: {
    marginTop: SPACING.md,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  linkText: {
    marginTop: SPACING.md,
    textAlign: 'center',
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
