import { StyleSheet } from 'react-native';

export const keyboardAwareScreenStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  // flexGrow (not flex) so short forms still fill the screen — letting
  // `justifyContent: 'center'` work — while long ones stay scrollable.
  content: {
    flexGrow: 1,
  },
});
