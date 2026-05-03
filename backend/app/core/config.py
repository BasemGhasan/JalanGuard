"""
Application Configuration
Environment variables and settings
"""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # App Info
    APP_NAME: str = "JalanGuard API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database - falls back to env var DATABASE_URL set by Replit
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost:5432/jalanguard")

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5000", "http://localhost:5173", "http://localhost:8081"]

    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp"]

    # AI Model
    YOLO_MODEL_PATH: str = "models/yolov8n.pt"
    CONFIDENCE_THRESHOLD: float = 0.5

    # ── Custom SMTP (used by authEmail router to send all auth emails) ──────
    # Set these as Replit Secrets:
    #   SMTP_HOST     e.g. smtp.gmail.com | smtp.resend.com | smtp.sendgrid.net
    #   SMTP_PORT     587 for STARTTLS (default), 465 for SSL
    #   SMTP_USER     Your SMTP login / username
    #   SMTP_PASSWORD Your SMTP password or app-password
    #   SMTP_FROM     Sender address, e.g. "JalanGuard <no-reply@yourdomain.com>"
    SMTP_HOST:     str = os.environ.get("SMTP_HOST", "")
    SMTP_PORT:     int = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USER:     str = os.environ.get("SMTP_USER", "")
    SMTP_PASSWORD: str = os.environ.get("SMTP_PASSWORD", "")
    SMTP_FROM:     str = os.environ.get("SMTP_FROM", "JalanGuard <no-reply@jalanguard.app>")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
