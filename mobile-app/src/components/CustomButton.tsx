/**
 * CustomButton Component
 * Reusable button with multiple variants
 */

import React, { useCallback, useMemo } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
}) => {
    const isDisabled = disabled || loading;

    const buttonStyles = useMemo((): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: BORDER_RADIUS.md,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
        };

        // Size styles
        const sizeStyles: Record<ButtonSize, ViewStyle> = {
            sm: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
            md: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
            lg: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
        };

        // Variant styles
        const variantStyles: Record<ButtonVariant, ViewStyle> = {
            primary: { backgroundColor: COLORS.secondary },
            secondary: { backgroundColor: COLORS.accent },
            outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.secondary },
            ghost: { backgroundColor: 'transparent' },
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
            ...(fullWidth && { width: '100%' }),
            ...(isDisabled && { opacity: 0.5 }),
        };
    }, [variant, size, fullWidth, isDisabled]);

    const textStyles = useMemo((): TextStyle => {
        const sizeStyles: Record<ButtonSize, TextStyle> = {
            sm: { fontSize: FONT_SIZES.sm },
            md: { fontSize: FONT_SIZES.md },
            lg: { fontSize: FONT_SIZES.lg },
        };

        const variantStyles: Record<ButtonVariant, TextStyle> = {
            primary: { color: COLORS.white },
            secondary: { color: COLORS.white },
            outline: { color: COLORS.secondary },
            ghost: { color: COLORS.secondary },
        };

        return {
            fontWeight: '600',
            ...sizeStyles[size],
            ...variantStyles[variant],
        };
    }, [variant, size]);

    const handlePress = useCallback(() => {
        if (!isDisabled) {
            onPress();
        }
    }, [isDisabled, onPress]);

    return (
        <TouchableOpacity
            style={[buttonStyles, style]}
            onPress={handlePress}
            disabled={isDisabled}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost' ? COLORS.secondary : COLORS.white}
                />
            ) : (
                <Text style={[textStyles, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({});
