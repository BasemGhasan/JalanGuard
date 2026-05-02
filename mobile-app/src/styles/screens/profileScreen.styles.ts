import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const profileScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  name: {
    marginTop: SPACING.md,
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  level: {
    marginTop: 4,
    color: COLORS.disabled,
  },
  statsWrap: {
    marginTop: SPACING.lg,
    width: '100%',
    gap: SPACING.sm,
  },
  logoutButton: {
    marginTop: SPACING.xl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '700',
  },
});
