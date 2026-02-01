/**
 * Application Configuration for Web Dashboard
 */

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export const APP_NAME = 'JalanGuard Dashboard';
export const APP_VERSION = '1.0.0';

export const DEFAULT_PAGE_SIZE = 20;
export const API_TIMEOUT = 30000;

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'jalanguard_auth_token',
    USER_DATA: 'jalanguard_user_data',
    LANGUAGE: 'jalanguard_language',
} as const;

export const REPORT_STATUS = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
} as const;

export const DEFECT_CATEGORIES = [
    'pothole',
    'crack',
    'erosion',
    'drainage',
    'signage',
    'lighting',
    'other',
] as const;

export type ReportStatusType = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];
export type DefectCategory = typeof DEFECT_CATEGORIES[number];
