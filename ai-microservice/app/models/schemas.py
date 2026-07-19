"""Pydantic response models for the detection endpoint.

The mobile app consumes these directly to auto-fill the hazard report, so the
field names here are the contract between the two services.
"""

# 1. Imports
from typing import Literal, Optional

from pydantic import BaseModel, Field

Severity = Literal["low", "medium", "high"]
DefectType = Literal["crack", "pothole"]


# 2. Models
class Detection(BaseModel):
    """A single validated hazard box surviving the custom NMS pass."""

    type: DefectType = Field(..., description="Base hazard type (crack | pothole).")
    severity: Severity = Field(..., description="Per-box severity read from the class label.")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence for this box (0–1).")
    box: list[int] = Field(..., description="Pixel bounding box [x1, y1, x2, y2].")


class DetectionResult(BaseModel):
    """Aggregated result the app turns into a hazard report.

    When multiple boxes are found the aggregation follows the product rules:
      * `defect_types` holds every distinct base type (both 'crack' and
        'pothole' when the image contains both).
      * `severity` is the MEAN severity across all boxes (low=1, medium=2,
        high=3, rounded to the nearest level).
      * `primary_type` is the single worst box's type, used to populate the
        legacy single-value `defect_type` column for API/dashboard filters.
    """

    detected: bool = Field(..., description="True when at least one hazard passed validation.")
    defect_types: list[DefectType] = Field(
        default_factory=list,
        description="Distinct base hazard types, sorted. Empty when nothing detected.",
    )
    primary_type: Optional[DefectType] = Field(
        None, description="Type of the single most-severe box (for the legacy defect_type column)."
    )
    severity: Optional[Severity] = Field(
        None, description="Mean severity across all validated boxes."
    )
    confidence: Optional[float] = Field(
        None, ge=0, le=1, description="Mean model confidence across all validated boxes (0–1)."
    )
    detection_count: int = Field(0, description="Number of validated boxes after NMS.")
    detections: list[Detection] = Field(
        default_factory=list, description="Per-box breakdown, for transparency/debugging."
    )
    message: str = Field(..., description="Human-readable summary of the outcome.")
