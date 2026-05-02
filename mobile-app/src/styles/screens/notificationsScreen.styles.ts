import { StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants';

export const notificationsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  listContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
});
