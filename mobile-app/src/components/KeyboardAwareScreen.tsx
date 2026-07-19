import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../constants';
import { keyboardAwareScreenStyles } from '../styles/components';

type KeyboardAwareScreenProps = {
  /** Layout/padding for the content itself — applied to the scroll content. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Fills the area behind the content, including any keyboard inset. */
  backgroundColor?: string;
  children: React.ReactNode;
};

/**
 * Form screen wrapper that keeps the focused input visible above the keyboard.
 *
 * Two mechanisms, one per platform. On Android the window resizes (Expo's
 * default `softwareKeyboardLayoutMode`), so the ScrollView shrinks and scrolls
 * the focused TextInput into view on its own. iOS doesn't resize, so
 * KeyboardAvoidingView pads the bottom by the keyboard height to produce the
 * same effect — hence `behavior` being iOS-only; setting it on Android would
 * fight the resize and double-count the inset.
 *
 * Screens pass their existing container style as `contentStyle`; it must use
 * `flexGrow` rather than `flex` since it lands on a scroll content container.
 */
export function KeyboardAwareScreen({
  contentStyle,
  backgroundColor = COLORS.primary,
  children,
}: KeyboardAwareScreenProps) {
  return (
    <KeyboardAvoidingView
      style={[keyboardAwareScreenStyles.flex, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={keyboardAwareScreenStyles.flex}
        contentContainerStyle={[keyboardAwareScreenStyles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
