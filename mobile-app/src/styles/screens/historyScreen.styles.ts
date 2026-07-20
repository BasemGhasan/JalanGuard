import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const historyScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  summaryText: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
  },
  // Owner actions sit under each row rather than behind a swipe: the action is
  // destructive/irreversible, so it should be visible and deliberate.
  // The list's own `gap` only separates cards, not a card from its own action
  // row, so the breathing room has to come from here.
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  resolveText: {
    color: COLORS.success,
  },
  deleteText: {
    color: COLORS.error,
  },
});
