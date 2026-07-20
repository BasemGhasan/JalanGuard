import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const settingsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    marginTop: SPACING.md,
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    letterSpacing: 0.08 * FONT_SIZES.sm,
    textTransform: 'uppercase',
  },
  // Mirrors listRow's shape so the language control sits flush with the rows
  // above it instead of looking like a different kind of component.
  languageRow: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  languageIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageTextWrap: {
    flex: 1,
  },
  languageTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  languageSubtitle: {
    marginTop: 2,
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    padding: 3,
  },
  languageOption: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: 999,
  },
  languageOptionActive: {
    backgroundColor: COLORS.secondary,
  },
  languageOptionText: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  languageOptionTextActive: {
    color: COLORS.white,
  },
  disabledRow: {
    opacity: 0.45,
  },
  logoutButton: {
    margin: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
