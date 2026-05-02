import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../../../constants';
import { withAlpha } from '../../../../utils';

export const listRowStyles = StyleSheet.create({
  row: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  thumbnail: {
    width: 74,
    height: 74,
    borderRadius: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: withAlpha(COLORS.secondary, 0.18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
  childrenWrap: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
});
