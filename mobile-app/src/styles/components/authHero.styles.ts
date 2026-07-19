import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
import { withAlpha } from '../../utils';

export const authHeroStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  // Mirrors the onboarding carousel's badge, one size down — these screens
  // share the page with a form, so the badge can't dominate it.
  iconBadge: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: withAlpha(COLORS.secondary, 0.18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: SPACING.sm,
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
});
