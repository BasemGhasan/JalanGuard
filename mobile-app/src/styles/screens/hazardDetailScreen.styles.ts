import { Dimensions, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

/** Full-bleed hero width; each carousel page snaps to this. */
export const HERO_WIDTH = Dimensions.get('window').width;

export const hazardDetailScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  heroContainer: {
    height: 260,
    position: 'relative',
    backgroundColor: COLORS.accent,
  },
  heroImage: {
    width: HERO_WIDTH,
    height: 260,
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  photoCounter: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.md,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  photoCounterText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    flexShrink: 1,
  },
  subtitle: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
  },
  description: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  sectionHint: {
    color: COLORS.disabled,
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  voteRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  voteButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: 2,
  },
  voteButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  voteButtonDisabled: {
    opacity: 0.6,
  },
  voteText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  voteCount: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
});
