import { StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants';

export const notificationsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  listContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  // Unread rows keep an amber edge for the duration of this visit, so opening
  // the screen shows you *which* items were new rather than just clearing the
  // badge silently.
  unreadRow: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
    borderRadius: 12,
  },
});
