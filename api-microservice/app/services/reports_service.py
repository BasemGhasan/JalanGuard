"""Business logic for querying road-hazard reports from Supabase.

Thin routers, fat services: all query building, filtering, pagination and
row → Report shaping lives here. The router only validates input and returns
what this module produces.
"""

# 1. Imports
from datetime import date

from ..core.database import get_supabase
from ..models.reports import Report, ReportListResponse, PaginationMeta

# 2. Constants
# PostgREST select with the two administrative-boundary embeds disambiguated by
# their FK constraint names (hazards has three FKs to the same table).
_SELECT = (
    "id,defect_type,severity,status,confidence,latitude,longitude,"
    "description,reporter_name,created_at,updated_at,image_urls,"
    "adm1:administrative_boundaries!hazards_adm1_id_fkey(name),"
    "adm2:administrative_boundaries!hazards_adm2_id_fkey(name)"
)


# 3. Row shaping
def _resolve_location(row: dict) -> str | None:
    """Most specific administrative name available (district over state)."""
    for key in ("adm2", "adm1"):
        node = row.get(key)
        if node and node.get("name"):
            return node["name"]
    return None


def _to_report(row: dict, fields: set[str], include_media: bool) -> Report:
    """Build a Report, populating only the selected fields (others stay None
    and are dropped from the payload by exclude_none serialization)."""
    values: dict = {"id": str(row["id"])}

    mapping = {
        "category": lambda: row.get("defect_type"),
        "severity": lambda: row.get("severity"),
        "status": lambda: row.get("status"),
        "confidence": lambda: row.get("confidence"),
        "latitude": lambda: row.get("latitude"),
        "longitude": lambda: row.get("longitude"),
        "location": lambda: _resolve_location(row),
        "description": lambda: row.get("description"),
        "reporter_name": lambda: row.get("reporter_name"),
        "created_at": lambda: row.get("created_at"),
        "updated_at": lambda: row.get("updated_at"),
    }
    for field, getter in mapping.items():
        if field in fields:
            values[field] = getter()

    # Media is gated by BOTH selection and the include_media flag. URLs only.
    if "media" in fields and include_media:
        urls = row.get("image_urls") or []
        values["media"] = [str(u) for u in urls]

    return Report(**values)


# 4. Query
def list_reports(
    *,
    limit: int,
    offset: int,
    fields: set[str],
    include_media: bool,
    location: str | None = None,
    category: str | None = None,
    severity: str | None = None,
    status: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> ReportListResponse:
    """Return a paginated, filtered page of reports."""
    client = get_supabase()

    # location → resolve matching boundary ids, then filter hazards on any adm level.
    boundary_ids: list[str] | None = None
    if location:
        matches = (
            client.table("administrative_boundaries")
            .select("id")
            .ilike("name", f"%{location}%")
            .execute()
        )
        boundary_ids = [str(r["id"]) for r in (matches.data or [])]
        if not boundary_ids:
            # No such area — short-circuit with an empty page.
            return ReportListResponse(
                data=[],
                pagination=PaginationMeta(
                    total=0, limit=limit, offset=offset, count=0, has_more=False
                ),
            )

    query = client.table("hazards").select(_SELECT, count="exact")

    if category:
        query = query.eq("defect_type", category)
    if severity:
        query = query.eq("severity", severity)
    if status:
        query = query.eq("status", status)
    if date_from:
        query = query.gte("created_at", date_from.isoformat())
    if date_to:
        # Inclusive end-of-day so a single-day range matches that whole day.
        query = query.lte("created_at", f"{date_to.isoformat()}T23:59:59.999999+00:00")
    if boundary_ids is not None:
        id_list = ",".join(boundary_ids)
        query = query.or_(
            f"adm0_id.in.({id_list}),adm1_id.in.({id_list}),adm2_id.in.({id_list})"
        )

    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    response = query.execute()

    rows = response.data or []
    total = response.count or 0
    reports = [_to_report(row, fields, include_media) for row in rows]

    return ReportListResponse(
        data=reports,
        pagination=PaginationMeta(
            total=total,
            limit=limit,
            offset=offset,
            count=len(reports),
            has_more=offset + len(reports) < total,
        ),
    )
