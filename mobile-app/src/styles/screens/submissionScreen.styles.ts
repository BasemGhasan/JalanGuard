import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const submissionScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  tagRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
    color: COLORS.disabled,
    fontWeight: '600',
  },
  tagActive: {
    backgroundColor: COLORS.secondary,
    color: COLORS.white,
  },
  submitWrap: {
    margin: SPACING.lg,
  },
});
