"""Detection endpoint — accepts a photo, returns the validated hazard result."""

# 1. Imports
import logging

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.models.schemas import DetectionResult
from app.services import detector

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Detection"])

_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"}


# 2. Endpoint
@router.post(
    "/detect",
    response_model=DetectionResult,
    summary="Validate a road-hazard photo and auto-classify it",
)
async def detect(image: UploadFile = File(..., description="Road photo (JPEG/PNG/WebP).")) -> DetectionResult:
    """Run the YOLO model on an uploaded photo.

    Returns 200 with `detected: false` when the image is valid but contains no
    hazard (the caller shows a "no hazard found" message and blocks the report).
    Returns 4xx only for malformed requests, and 503 when the model is missing.
    """
    settings = get_settings()

    if not settings.model_exists:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Detection model is not available on the server.",
        )

    if image.content_type and image.content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type '{image.content_type}'.",
        )

    data = await image.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty image upload.")
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds the maximum allowed size.",
        )

    try:
        return detector.analyze_image(data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Detection failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Detection failed while processing the image.",
        ) from exc
