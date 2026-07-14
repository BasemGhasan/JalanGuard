import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import type { KeyboardTypeOptions, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { formFieldStyles } from '../styles/components';

type FormFieldProps = {
  /** Leading MaterialIcons glyph shown inside the field. */
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  /** Renders a password field with a built-in show/hide toggle. */
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  /** Container override — typically top spacing between stacked fields. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Reusable labeled input row (leading icon + input + optional password toggle).
 *
 * Replaces the icon/TextInput/wrap markup that was duplicated across the Login,
 * Register and ForgotPassword screens. Owns its own password-visibility state.
 */
export function FormField({
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  style,
}: FormFieldProps) {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <View style={[formFieldStyles.wrap, style]}>
      <MaterialIcons name={icon} size={20} color={COLORS.disabled} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.disabled}
        secureTextEntry={secureTextEntry && !showSecret}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        style={formFieldStyles.input}
      />
      {secureTextEntry ? (
        <Pressable onPress={() => setShowSecret((prev) => !prev)}>
          <MaterialIcons
            name={showSecret ? 'visibility-off' : 'visibility'}
            size={20}
            color={COLORS.disabled}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
