/**
 * MapScreen Component
 * Interactive map showing defect locations
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../hooks';
import { LoadingSpinner } from '../../components';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { DEFAULT_LOCATION } from '../../constants/config';

export const MapScreen: React.FC = () => {
    const { t } = useTranslation();
    const {
        location,
        isLoading,
        hasPermission,
        requestPermission,
        refreshLocation
    } = useLocation();

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        } else {
            refreshLocation();
        }
    }, [hasPermission, requestPermission, refreshLocation]);

    const handleCenterOnUser = useCallback(() => {
        refreshLocation();
    }, [refreshLocation]);

    const region = useMemo(() => ({
        latitude: location?.latitude ?? DEFAULT_LOCATION.latitude,
        longitude: location?.longitude ?? DEFAULT_LOCATION.longitude,
        latitudeDelta: DEFAULT_LOCATION.latitudeDelta,
        longitudeDelta: DEFAULT_LOCATION.longitudeDelta,
    }), [location]);

    if (!hasPermission) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Ionicons name="location-outline" size={64} color={COLORS.disabled} />
                    <Text style={styles.permissionTitle}>{t('map.enable_location')}</Text>
                    <Text style={styles.permissionText}>
                        {t('map.location_permission_denied')}
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Enable Location</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('map.title')}</Text>
            </View>

            {isLoading && !location ? (
                <LoadingSpinner fullScreen message={t('common.loading')} />
            ) : (
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        region={region}
                        showsUserLocation
                        showsMyLocationButton={false}
                    >
                        {/* TODO: Add markers for defect reports */}
                    </MapView>

                    {/* Center on user button */}
                    <TouchableOpacity
                        style={styles.centerButton}
                        onPress={handleCenterOnUser}
                    >
                        <Ionicons name="locate" size={24} color={COLORS.primary} />
                    </TouchableOpacity>

                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
                            <Text style={styles.legendText}>Critical</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
                            <Text style={styles.legendText}>Pending</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                            <Text style={styles.legendText}>Resolved</Text>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    centerButton: {
        position: 'absolute',
        bottom: SPACING.xl + 60,
        right: SPACING.md,
        backgroundColor: COLORS.white,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        ...SHADOWS.md,
    },
    legend: {
        position: 'absolute',
        bottom: SPACING.md,
        left: SPACING.md,
        backgroundColor: COLORS.white,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        flexDirection: 'row',
        gap: SPACING.md,
        ...SHADOWS.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: BORDER_RADIUS.full,
    },
    legendText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.accent,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    permissionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: SPACING.md,
    },
    permissionText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.accent,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
    permissionButton: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.secondary,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
    },
    permissionButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
});
