import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  greeting: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
  },
  name: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginTop: 2,
  },
  // Badge is positioned against this, so it must not clip its children.
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Overlaps the bell's top-right corner. minWidth (not a fixed width) so a
  // two-digit count widens the pill instead of overflowing it.
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    // Separates the badge from the bell underneath it.
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: SPACING.md,
  },
  statsTitle: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
  mapCard: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapHeader: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  mapImage: {
    width: '100%',
    height: 200,
  },
  mapIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTextWrap: {
    flex: 1,
  },
  mapTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  mapSubtitle: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
});
