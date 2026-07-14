import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const mapScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  toggleGroup: {
    position: 'absolute',
    top: SPACING.xl + SPACING.md,
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  toggleRight: {
    right: SPACING.md,
  },
  toggleLeft: {
    left: SPACING.md,
  },
  toggleItem: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: 999,
  },
  toggleItemActive: {
    backgroundColor: COLORS.secondary,
  },
  toggleText: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.35)',
    gap: SPACING.md,
  },
  errorText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 10,
  },
  retryText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
