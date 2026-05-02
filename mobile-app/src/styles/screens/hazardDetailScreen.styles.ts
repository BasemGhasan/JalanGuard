import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

export const hazardDetailScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  heroContainer: {
    height: 260,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.disabled,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  sectionHint: {
    color: COLORS.disabled,
    marginTop: 4,
    marginBottom: SPACING.md,
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
  },
  voteButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  voteText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  voteTextActive: {
    color: COLORS.white,
  },
});
