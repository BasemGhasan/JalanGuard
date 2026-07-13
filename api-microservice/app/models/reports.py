"""Pydantic schemas for the reports API.

Report fields are all optional (except ``id``) so that granular field selection
can omit unrequested keys: the router serializes with ``exclude_none=True``, so a
field left as ``None`` disappears from the JSON payload entirely.
"""

# 1. Imports
from datetime import datetime

from pydantic import BaseModel, Field

# 2. Selectable field catalogue (API-facing names) — the single source of truth
#    shared by the router (query validation) and the service (row shaping).
SELECTABLE_FIELDS: tuple[str, ...] = (
    "category",
    "severity",
    "status",
    "confidence",
    "latitude",
    "longitude",
    "location",
    "description",
    "reporter_name",
    "created_at",
    "updated_at",
    "media",
)


# 3. Models
class Report(BaseModel):
    """A single road-hazard report.

    ``media`` is always a list of plain string URLs pointing at the storage
    bucket — never Base64 or binary. It is present only when ``include_media=true``.
    """

    id: str
    category: str | None = Field(default=None, description="Defect type, e.g. 'pothole'.")
    severity: str | None = Field(default=None, description="low | medium | high")
    status: str | None = Field(default=None, description="Lifecycle status, e.g. 'active'.")
    confidence: float | None = Field(default=None, description="AI detection confidence 0–1.")
    latitude: float | None = None
    longitude: float | None = None
    location: str | None = Field(default=None, description="Administrative area name.")
    description: str | None = None
    reporter_name: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    media: list[str] | None = Field(default=None, description="Image URLs (strings only).")


class PaginationMeta(BaseModel):
    """Server-side pagination envelope."""

    total: int = Field(description="Total rows matching the filters.")
    limit: int = Field(description="Page size used for this response.")
    offset: int = Field(description="Row offset of this page.")
    count: int = Field(description="Number of rows actually returned.")
    has_more: bool = Field(description="True if further pages exist.")


class ReportListResponse(BaseModel):
    """Paginated list of reports."""

    data: list[Report]
    pagination: PaginationMeta
