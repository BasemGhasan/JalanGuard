import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const notificationSettingsScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  introText: {
    marginBottom: SPACING.sm,
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  row: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  rowTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  rowSubtitle: {
    marginTop: 2,
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
  },
  footnote: {
    marginTop: SPACING.md,
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    lineHeight: FONT_SIZES.sm * 1.5,
  },
});
