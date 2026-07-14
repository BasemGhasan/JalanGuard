import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const formFieldStyles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
});
