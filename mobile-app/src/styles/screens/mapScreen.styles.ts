import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const mapScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  mapArea: {
    flex: 1,
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  topSearch: {
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  searchText: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
  },
  pin: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: SPACING.md,
  },
  bottomTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  bottomSubtitle: {
    color: COLORS.disabled,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
});
