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
    paddingBottom: SPACING.xl,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
  },
  noteText: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    marginTop: -SPACING.sm + 2,
  },
  warningText: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.sm,
    marginTop: -SPACING.sm + 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  sectionHint: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    overflow: 'hidden',
  },
  tagActive: {
    backgroundColor: COLORS.secondary,
    color: COLORS.white,
  },
  descriptionInput: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    minHeight: 96,
    textAlignVertical: 'top',
    marginTop: SPACING.sm,
  },
  submitWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.accent,
  },
});
