/**
 * Custom hook for authentication logic
 */

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { login, register, logout, getCurrentUser } from '../services/authService';
import { User, LoginRequest, RegisterRequest, LoadingState } from '../types';

interface UseAuthReturn {
    user: User | null;
    isAuthenticated: boolean;
    loadingState: LoadingState;
    error: string | null;
    handleLogin: (credentials: LoginRequest) => Promise<boolean>;
    handleRegister: (userData: RegisterRequest) => Promise<boolean>;
    handleLogout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingState, setLoadingState] = useState<LoadingState>('idle');
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = user !== null;

    const handleLogin = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
        try {
            setLoadingState('loading');
            setError(null);

            const response = await login(credentials);

            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.tokens.accessToken);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

            setUser(response.user);
            setLoadingState('success');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            setLoadingState('error');
            return false;
        }
    }, []);

    const handleRegister = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
        try {
            setLoadingState('loading');
            setError(null);

            const response = await register(userData);

            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.tokens.accessToken);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

            setUser(response.user);
            setLoadingState('success');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed';
            setError(errorMessage);
            setLoadingState('error');
            return false;
        }
    }, []);

    const handleLogout = useCallback(async (): Promise<void> => {
        try {
            await logout();
        } catch {
            // Continue with local logout even if API fails
        } finally {
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            setUser(null);
            setLoadingState('idle');
        }
    }, []);

    const checkAuthStatus = useCallback(async (): Promise<void> => {
        try {
            setLoadingState('loading');
            const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

            if (!token) {
                setLoadingState('idle');
                return;
            }

            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setLoadingState('success');
        } catch {
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            setUser(null);
            setLoadingState('idle');
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        user,
        isAuthenticated,
        loadingState,
        error,
        handleLogin,
        handleRegister,
        handleLogout,
        checkAuthStatus,
        clearError,
    };
};
