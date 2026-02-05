/**
 * ProfileScreen Component
 * User profile and settings
 */

import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { useAuth } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface MenuItem {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
}

export const ProfileScreen: React.FC = () => {
    const { t } = useTranslation();
    const { user, handleLogout } = useAuth();

    const handleEditProfile = useCallback(() => {
        // TODO: Navigate to edit profile
    }, []);

    const handleMyReports = useCallback(() => {
        // TODO: Navigate to my reports
    }, []);

    const handleSettings = useCallback(() => {
        // TODO: Navigate to settings
    }, []);

    const handleHelp = useCallback(() => {
        // TODO: Navigate to help
    }, []);

    const confirmLogout = useCallback(() => {
        Alert.alert(
            t('auth.logout'),
            t('auth.logout_confirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('auth.logout'),
                    style: 'destructive',
                    onPress: handleLogout
                },
            ]
        );
    }, [t, handleLogout]);

    const menuItems: MenuItem[] = useMemo(() => [
        {
            icon: 'person-outline',
            label: t('profile.edit_profile'),
            onPress: handleEditProfile,
        },
        {
            icon: 'document-text-outline',
            label: t('profile.my_reports'),
            onPress: handleMyReports,
        },
        {
            icon: 'settings-outline',
            label: t('profile.settings'),
            onPress: handleSettings,
        },
        {
            icon: 'help-circle-outline',
            label: t('profile.help'),
            onPress: handleHelp,
        },
        {
            icon: 'log-out-outline',
            label: t('auth.logout'),
            onPress: confirmLogout,
            color: COLORS.error,
        },
    ], [t, handleEditProfile, handleMyReports, handleSettings, handleHelp, confirmLogout]);

    // Mock user data
    const displayUser = useMemo(() => user ?? {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
    }, [user]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {displayUser.firstName[0]}{displayUser.lastName[0]}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.userName}>
                        {displayUser.firstName} {displayUser.lastName}
                    </Text>
                    <Text style={styles.userEmail}>{displayUser.email}</Text>
                </View>

                {/* Stats */}
                <Card style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>{t('profile.total_reports')}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>8</Text>
                        <Text style={styles.statLabel}>{t('profile.resolved_reports')}</Text>
                    </View>
                </Card>

                {/* Menu Items */}
                <Card style={styles.menuCard} padding="none">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.menuItem,
                                index < menuItems.length - 1 && styles.menuItemBorder,
                            ]}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuItemLeft}>
                                <Ionicons
                                    name={item.icon}
                                    size={22}
                                    color={item.color ?? COLORS.accent}
                                />
                                <Text
                                    style={[
                                        styles.menuItemText,
                                        item.color && { color: item.color },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={COLORS.disabled}
                            />
                        </TouchableOpacity>
                    ))}
                </Card>

                {/* App Version */}
                <Text style={styles.version}>
                    {t('settings.version')} 1.0.0
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
        marginTop: SPACING.lg,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    avatarText: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    userName: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    userEmail: {
        fontSize: FONT_SIZES.md,
        color: COLORS.accent,
        marginTop: SPACING.xs,
    },
    statsCard: {
        flexDirection: 'row',
        marginBottom: SPACING.lg,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    statLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.accent,
        marginTop: SPACING.xs,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.surface,
        marginVertical: SPACING.sm,
    },
    menuCard: {
        marginBottom: SPACING.lg,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    menuItemText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.primary,
    },
    version: {
        textAlign: 'center',
        fontSize: FONT_SIZES.sm,
        color: COLORS.disabled,
        marginBottom: SPACING.xl,
    },
});
