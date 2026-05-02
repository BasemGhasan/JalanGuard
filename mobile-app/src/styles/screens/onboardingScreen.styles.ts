import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
import { withAlpha } from '../../utils';

export const onboardingScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  contentWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: withAlpha(COLORS.secondary, 0.25),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  previewImage: {
    width: 220,
    height: 300,
    borderRadius: 24,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    textAlign: 'center',
    color: COLORS.muted,
    paddingHorizontal: SPACING.sm,
  },
  footer: {
    gap: SPACING.md,
  },
  dotsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.secondary,
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    gap: SPACING.xs,
  },
  primaryButtonFull: {
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  linkText: {
    textAlign: 'center',
    color: COLORS.secondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
