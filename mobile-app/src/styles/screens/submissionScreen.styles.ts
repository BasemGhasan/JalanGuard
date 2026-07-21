import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
import { withAlpha } from '../../utils';

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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  // AI validation status card (analyzing / error states).
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: SPACING.md,
  },
  aiCardError: {
    backgroundColor: withAlpha(COLORS.error, 0.12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(COLORS.error, 0.4),
  },
  aiCardText: {
    flex: 1,
    gap: 2,
  },
  aiCardTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  aiCardHint: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
  },
  aiErrorTitle: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  aiVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  aiVerifiedText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  confidenceText: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
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
  galleryRow: {
    marginTop: SPACING.sm,
  },
  galleryThumbWrap: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  galleryThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },
  galleryRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: withAlpha(COLORS.black, 0.6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoTile: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addPhotoText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.accent,
  },
});
