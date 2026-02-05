/**
 * Reports API Service
 * Handles CRUD operations for road defect reports
 */

import apiClient from './apiClient';
import {
    Report,
    CreateReportRequest,
    ReportFilters,
    PaginatedReports,
    ApiResponse,
    PaginationParams
} from '../types';

const REPORTS_ENDPOINTS = {
    BASE: '/reports',
    MY_REPORTS: '/reports/me',
    BY_ID: (id: string) => `/reports/${id}`,
    UPLOAD_IMAGE: '/reports/upload-image',
};

/**
 * Create a new defect report
 */
export const createReport = async (
    reportData: CreateReportRequest
): Promise<Report> => {
    const response = await apiClient.post<ApiResponse<Report>>(
        REPORTS_ENDPOINTS.BASE,
        reportData
    );
    return response.data.data;
};

/**
 * Get all reports with optional filters and pagination
 */
export const getReports = async (
    filters?: ReportFilters,
    pagination?: PaginationParams
): Promise<PaginatedReports> => {
    const response = await apiClient.get<ApiResponse<PaginatedReports>>(
        REPORTS_ENDPOINTS.BASE,
        { params: { ...filters, ...pagination } }
    );
    return response.data.data;
};

/**
 * Get reports submitted by current user
 */
export const getMyReports = async (
    pagination?: PaginationParams
): Promise<PaginatedReports> => {
    const response = await apiClient.get<ApiResponse<PaginatedReports>>(
        REPORTS_ENDPOINTS.MY_REPORTS,
        { params: pagination }
    );
    return response.data.data;
};

/**
 * Get a single report by ID
 */
export const getReportById = async (id: string): Promise<Report> => {
    const response = await apiClient.get<ApiResponse<Report>>(
        REPORTS_ENDPOINTS.BY_ID(id)
    );
    return response.data.data;
};

/**
 * Update an existing report
 */
export const updateReport = async (
    id: string,
    updates: Partial<CreateReportRequest>
): Promise<Report> => {
    const response = await apiClient.patch<ApiResponse<Report>>(
        REPORTS_ENDPOINTS.BY_ID(id),
        updates
    );
    return response.data.data;
};

/**
 * Delete a report
 */
export const deleteReport = async (id: string): Promise<void> => {
    await apiClient.delete(REPORTS_ENDPOINTS.BY_ID(id));
};

/**
 * Upload image and get URL
 */
export const uploadImage = async (imageUri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'report-image.jpg',
    } as unknown as Blob);

    const response = await apiClient.post<ApiResponse<{ url: string }>>(
        REPORTS_ENDPOINTS.UPLOAD_IMAGE,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data.data.url;
};
