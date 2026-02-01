"""
Pydantic Schemas for API Request/Response
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


# Enums
class ReportStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class DefectCategory(str, Enum):
    POTHOLE = "pothole"
    CRACK = "crack"
    EROSION = "erosion"
    DRAINAGE = "drainage"
    SIGNAGE = "signage"
    LIGHTING = "lighting"
    OTHER = "other"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    phone_number: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    phone_number: Optional[str] = None


class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse


# Location Schema
class Coordinates(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


# Report Schemas
class ReportImageResponse(BaseModel):
    id: str
    uri: str
    thumbnail_uri: Optional[str] = None


class AIDetectionResult(BaseModel):
    defect_type: str
    confidence: float
    bounding_box: Optional[dict] = None


class ReportBase(BaseModel):
    category: DefectCategory
    description: Optional[str] = Field(None, max_length=1000)
    location: Coordinates
    address: Optional[str] = None


class ReportCreate(ReportBase):
    images: List[str]  # Base64 encoded images or URIs


class ReportUpdate(BaseModel):
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[ReportStatus] = None


class ReportResponse(ReportBase):
    id: str
    user_id: str
    images: List[ReportImageResponse]
    status: ReportStatus
    severity: Optional[Severity] = None
    ai_detection_result: Optional[AIDetectionResult] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaginatedReports(BaseModel):
    data: List[ReportResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Generic Response
class APIResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Optional[dict] = None
