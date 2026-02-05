/**
 * Application Configuration
 * Environment-specific settings and constants
 */

// API Configuration
export const API_URL = __DEV__
    ? 'http://localhost:8000/api/v1'
    : 'https://api.jalanguard.com/api/v1';

// App Constants
export const APP_NAME = 'JalanGuard';
export const APP_VERSION = '1.0.0';

// Image Upload Limits
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES_PER_REPORT = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Location Settings
export const DEFAULT_LOCATION = {
    latitude: 3.1390,  // Kuala Lumpur
    longitude: 101.6869,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Timeouts (in milliseconds)
export const API_TIMEOUT = 30000;
export const LOCATION_TIMEOUT = 15000;

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: '@jalanguard/auth_token',
    USER_DATA: '@jalanguard/user_data',
    LANGUAGE: '@jalanguard/language',
    ONBOARDING_COMPLETE: '@jalanguard/onboarding_complete',
} as const;

// Defect Categories
export const DEFECT_CATEGORIES = [
    'pothole',
    'crack',
    'erosion',
    'drainage',
    'signage',
    'lighting',
    'other',
] as const;

// Report Status
export const REPORT_STATUS = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
} as const;

export type DefectCategory = typeof DEFECT_CATEGORIES[number];
export type ReportStatusType = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];
