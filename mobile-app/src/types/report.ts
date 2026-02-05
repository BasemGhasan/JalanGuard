/**
 * Report-related types and interfaces
 */

import { DefectCategory, ReportStatusType } from '../constants/config';

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface ReportImage {
    id: string;
    uri: string;
    thumbnailUri?: string;
}

export interface Report {
    id: string;
    userId: string;
    category: DefectCategory;
    description: string;
    images: ReportImage[];
    location: Coordinates;
    address?: string;
    status: ReportStatusType;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    aiDetectionResult?: AiDetectionResult;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

export interface AiDetectionResult {
    defectType: string;
    confidence: number;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface CreateReportRequest {
    category: DefectCategory;
    description: string;
    images: string[]; // Base64 encoded images or URIs
    location: Coordinates;
    address?: string;
}

export interface ReportFilters {
    status?: ReportStatusType;
    category?: DefectCategory;
    startDate?: string;
    endDate?: string;
    userId?: string;
}

export interface PaginatedReports {
    data: Report[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
