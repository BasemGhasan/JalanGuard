import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../constants';
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
 *
 * These screens run headerless, so the wrapper also owns the safe-area insets
 * that the navigation header used to provide — without them the content would
 * sit under the status bar / notch.
 */
export function KeyboardAwareScreen({
  contentStyle,
  backgroundColor = COLORS.primary,
  children,
}: KeyboardAwareScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[keyboardAwareScreenStyles.flex, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={keyboardAwareScreenStyles.flex}
        contentContainerStyle={[
          keyboardAwareScreenStyles.content,
          contentStyle,
          { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + SPACING.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
