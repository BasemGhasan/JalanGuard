/**
 * Authentication API Service
 * Handles login, register, logout, and token management
 */

import apiClient from './apiClient';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User,
    ApiResponse
} from '../types';

const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
};

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
        AUTH_ENDPOINTS.LOGIN,
        credentials
    );
    return response.data.data;
};

/**
 * Register a new user account
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
        AUTH_ENDPOINTS.REGISTER,
        userData
    );
    return response.data.data;
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(AUTH_ENDPOINTS.ME);
    return response.data.data;
};

/**
 * Request password reset email
 */
export const forgotPassword = async (email: string): Promise<void> => {
    await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
};

/**
 * Reset password with token
 */
export const resetPassword = async (
    token: string,
    newPassword: string
): Promise<void> => {
    await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, { token, newPassword });
};
