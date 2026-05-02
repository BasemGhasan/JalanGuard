import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../../../constants';
import { withAlpha } from '../../../../utils';

export type BadgeTone = 'danger' | 'warning' | 'success' | 'neutral' | 'accent';

export const badgeToneStyles: Record<BadgeTone, { backgroundColor: string; color: string }> = {
  danger: {
    backgroundColor: withAlpha(COLORS.error, 0.22),
    color: COLORS.error,
  },
  warning: {
    backgroundColor: withAlpha(COLORS.warning, 0.22),
    color: COLORS.warning,
  },
  success: {
    backgroundColor: withAlpha(COLORS.success, 0.24),
    color: COLORS.success,
  },
  neutral: {
    backgroundColor: withAlpha(COLORS.disabled, 0.2),
    color: COLORS.disabled,
  },
  accent: {
    backgroundColor: withAlpha(COLORS.secondary, 0.22),
    color: COLORS.secondary,
  },
};

export const badgeChipStyles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
});
