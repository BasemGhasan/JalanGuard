/**
 * Custom hook for location services
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '../types';
import { DEFAULT_LOCATION, LOCATION_TIMEOUT } from '../constants/config';

interface UseLocationReturn {
    location: Coordinates | null;
    address: string | null;
    isLoading: boolean;
    error: string | null;
    hasPermission: boolean;
    requestPermission: () => Promise<boolean>;
    refreshLocation: () => Promise<void>;
    getAddressFromCoordinates: (coords: Coordinates) => Promise<string | null>;
}

export const useLocation = (): UseLocationReturn => {
    const [location, setLocation] = useState<Coordinates | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            const granted = status === 'granted';
            setHasPermission(granted);
            return granted;
        } catch {
            setError('Failed to request location permission');
            return false;
        }
    }, []);

    const getAddressFromCoordinates = useCallback(
        async (coords: Coordinates): Promise<string | null> => {
            try {
                const [result] = await Location.reverseGeocodeAsync({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });

                if (result) {
                    const addressParts = [
                        result.streetNumber,
                        result.street,
                        result.city,
                        result.region,
                        result.postalCode,
                    ].filter(Boolean);
                    return addressParts.join(', ');
                }
                return null;
            } catch {
                return null;
            }
        },
        []
    );

    const refreshLocation = useCallback(async (): Promise<void> => {
        if (!hasPermission) {
            const granted = await requestPermission();
            if (!granted) {
                setError('Location permission denied');
                setLocation({
                    latitude: DEFAULT_LOCATION.latitude,
                    longitude: DEFAULT_LOCATION.longitude,
                });
                return;
            }
        }

        try {
            setIsLoading(true);
            setError(null);

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: LOCATION_TIMEOUT,
            });

            const coords: Coordinates = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };

            setLocation(coords);

            const addressResult = await getAddressFromCoordinates(coords);
            setAddress(addressResult);
        } catch (err) {
            setError('Failed to get current location');
            setLocation({
                latitude: DEFAULT_LOCATION.latitude,
                longitude: DEFAULT_LOCATION.longitude,
            });
        } finally {
            setIsLoading(false);
        }
    }, [hasPermission, requestPermission, getAddressFromCoordinates]);

    // Check permission on mount
    useEffect(() => {
        const checkPermission = async () => {
            const { status } = await Location.getForegroundPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        checkPermission();
    }, []);

    return {
        location,
        address,
        isLoading,
        error,
        hasPermission,
        requestPermission,
        refreshLocation,
        getAddressFromCoordinates,
    };
};
