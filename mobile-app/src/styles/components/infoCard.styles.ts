import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
import { withAlpha } from '../../utils';

export const infoCardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(COLORS.secondary, 0.18),
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
  },
  value: {
    marginTop: 2,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
