/**
 * LoadingSpinner Component
 * Full-screen or inline loading indicator
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    fullScreen?: boolean;
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    color = COLORS.secondary,
    fullScreen = false,
    message,
}) => {
    if (fullScreen) {
        return (
            <View style={styles.fullScreenContainer}>
                <ActivityIndicator size={size} color={color} />
                {message && <Text style={styles.message}>{message}</Text>}
            </View>
        );
    }

    return (
        <View style={styles.inlineContainer}>
            <ActivityIndicator size={size} color={color} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    inlineContainer: {
        padding: SPACING.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        marginTop: SPACING.sm,
        fontSize: FONT_SIZES.md,
        color: COLORS.accent,
    },
});
