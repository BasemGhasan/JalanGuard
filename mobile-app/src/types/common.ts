/**
 * Common types used across the application
 */

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption<T = string> {
    label: string;
    value: T;
}
