/**
 * HomeScreen Component
 * Main dashboard showing recent reports and quick actions
 */

import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CustomButton } from '../../components';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

export const HomeScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = React.useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        // TODO: Fetch latest reports
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const handleQuickReport = useCallback(() => {
        navigation.navigate('Report' as never);
    }, [navigation]);

    const handleViewAllReports = useCallback(() => {
        // TODO: Navigate to all reports
    }, []);

    const stats = useMemo(() => [
        { label: t('profile.total_reports'), value: '12', icon: 'document-text-outline' as const },
        { label: t('report.status.pending'), value: '3', icon: 'time-outline' as const },
        { label: t('profile.resolved_reports'), value: '8', icon: 'checkmark-circle-outline' as const },
    ], [t]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{t('home.welcome_message')}</Text>
                        <Text style={styles.appName}>{t('common.app_name')}</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {/* Quick Report Button */}
                <Card style={styles.quickReportCard}>
                    <View style={styles.quickReportContent}>
                        <View style={styles.quickReportText}>
                            <Text style={styles.quickReportTitle}>{t('home.quick_report')}</Text>
                            <Text style={styles.quickReportSubtitle}>
                                Report a road defect in your area
                            </Text>
                        </View>
                        <CustomButton
                            title={t('report.new_report')}
                            onPress={handleQuickReport}
                            size="sm"
                        />
                    </View>
                </Card>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <Card key={index} style={styles.statCard}>
                            <Ionicons name={stat.icon} size={24} color={COLORS.secondary} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </Card>
                    ))}
                </View>

                {/* Recent Reports */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('home.recent_reports')}</Text>
                    <TouchableOpacity onPress={handleViewAllReports}>
                        <Text style={styles.viewAll}>{t('home.view_all')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Placeholder for reports */}
                <Card style={styles.emptyCard}>
                    <Ionicons name="document-outline" size={48} color={COLORS.disabled} />
                    <Text style={styles.emptyText}>{t('home.no_reports')}</Text>
                    <CustomButton
                        title={t('report.new_report')}
                        onPress={handleQuickReport}
                        variant="outline"
                        size="sm"
                        style={styles.emptyButton}
                    />
                </Card>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    greeting: {
        fontSize: FONT_SIZES.md,
        color: COLORS.accent,
    },
    appName: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    notificationButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.full,
    },
    quickReportCard: {
        marginBottom: SPACING.lg,
        backgroundColor: COLORS.primary,
    },
    quickReportContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quickReportText: {
        flex: 1,
        marginRight: SPACING.md,
    },
    quickReportTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    quickReportSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.surface,
        marginTop: SPACING.xs,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    statValue: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: SPACING.xs,
    },
    statLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.accent,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.primary,
    },
    viewAll: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    emptyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.disabled,
        marginTop: SPACING.md,
        marginBottom: SPACING.md,
    },
    emptyButton: {
        marginTop: SPACING.sm,
    },
});
