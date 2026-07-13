"""Hazards API router — GET /api/v1/hazards.

The router is thin: it validates/normalizes query parameters and delegates to
reports_service (which queries the `hazards` table in Supabase). Every endpoint
requires a valid API key via require_api_key.
"""

# 1. Imports
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..core.config import get_settings
from ..middleware.auth import AuthContext, require_api_key
from ..models.reports import SELECTABLE_FIELDS, ReportListResponse
from ..services import reports_service

# 2. Router — path mirrors the Supabase table name (`hazards`)
router = APIRouter(prefix="/api/v1", tags=["Hazards"])


# 3. Helpers
def _resolve_fields(fields: str | None) -> set[str]:
    """Parse the comma-separated ``fields`` param into a validated set.

    Empty/absent → all selectable fields. Unknown names raise 400 so callers
    learn about typos instead of silently getting nothing.
    """
    if not fields:
        return set(SELECTABLE_FIELDS)

    requested = {f.strip() for f in fields.split(",") if f.strip()}
    unknown = requested - set(SELECTABLE_FIELDS)
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown field(s): {', '.join(sorted(unknown))}. "
            f"Allowed: {', '.join(SELECTABLE_FIELDS)}.",
        )
    return requested


# 4. Endpoint
@router.get(
    "/hazards",
    response_model=ReportListResponse,
    response_model_exclude_none=True,
    summary="List road hazards",
    description=(
        "Paginated, filterable feed of verified road-hazard reports.\n\n"
        "**Auth:** send your key as `Authorization: Bearer <key>` (or `X-API-Key`).\n"
        "**Rate limit:** 60 requests/minute per key.\n"
        "**Media:** image fields are always plain URL strings — never Base64."
    ),
)
def list_reports(
    auth: AuthContext = Depends(require_api_key),
    limit: int = Query(
        default=None,
        ge=1,
        le=100,
        description="Page size (default 50, max 100).",
    ),
    offset: int = Query(default=0, ge=0, description="Row offset for pagination."),
    location: str | None = Query(
        default=None, description="Filter by administrative area name (partial match)."
    ),
    category: str | None = Query(
        default=None, description="Filter by defect type, e.g. 'pothole'."
    ),
    severity: str | None = Query(
        default=None, description="Filter by severity: low | medium | high."
    ),
    status_: str | None = Query(
        default=None, alias="status", description="Filter by lifecycle status."
    ),
    date_from: date | None = Query(
        default=None, description="Only reports created on/after this date (YYYY-MM-DD)."
    ),
    date_to: date | None = Query(
        default=None, description="Only reports created on/before this date (YYYY-MM-DD)."
    ),
    include_media: bool = Query(
        default=False, description="Include image URL arrays in each report."
    ),
    fields: str | None = Query(
        default=None,
        description="Comma-separated subset of fields to return (id is always included).",
    ),
) -> ReportListResponse:
    settings = get_settings()
    effective_limit = min(limit or settings.default_page_size, settings.max_page_size)

    return reports_service.list_reports(
        limit=effective_limit,
        offset=offset,
        fields=_resolve_fields(fields),
        include_media=include_media,
        location=location,
        category=category,
        severity=severity,
        status=status_,
        date_from=date_from,
        date_to=date_to,
    )
