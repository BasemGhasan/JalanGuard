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
});
