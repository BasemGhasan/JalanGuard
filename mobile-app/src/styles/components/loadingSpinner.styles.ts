import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const loadingSpinnerStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  message: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: 14,
  },
});
