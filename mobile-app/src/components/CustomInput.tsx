/**
 * CustomInput Component
 * Reusable text input with validation support
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface CustomInputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    secureTextEntry,
    ...textInputProps
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    const togglePasswordVisibility = useCallback(() => {
        setIsPasswordVisible((prev) => !prev);
    }, []);

    const inputContainerStyle = useMemo((): ViewStyle => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: error ? COLORS.error : isFocused ? COLORS.secondary : COLORS.surface,
        paddingHorizontal: SPACING.md,
    }), [error, isFocused]);

    const isSecure = secureTextEntry && !isPasswordVisible;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={inputContainerStyle}>
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={COLORS.disabled}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholderTextColor={COLORS.disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={isSecure}
                    {...textInputProps}
                />

                {secureTextEntry && (
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={COLORS.disabled}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity onPress={onRightIconPress}>
                        <Ionicons
                            name={rightIcon}
                            size={20}
                            color={COLORS.disabled}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    input: {
        flex: 1,
        fontSize: FONT_SIZES.md,
        color: COLORS.primary,
        paddingVertical: SPACING.sm,
    },
    leftIcon: {
        marginRight: SPACING.sm,
    },
    errorText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.error,
        marginTop: SPACING.xs,
    },
});
