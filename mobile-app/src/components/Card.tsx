/**
 * Card Component
 * Reusable card container with optional shadow
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    elevated?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    elevated = true,
    padding = 'md',
}) => {
    const paddingValue = {
        none: 0,
        sm: SPACING.sm,
        md: SPACING.md,
        lg: SPACING.lg,
    };

    return (
        <View
            style={[
                styles.card,
                elevated && SHADOWS.md,
                { padding: paddingValue[padding] },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
});
