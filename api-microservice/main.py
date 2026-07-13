"""JalanGuard Open Data API — application entry point.

Run locally:
    cd api-microservice
    python -m venv .venv && .venv/Scripts/activate   # Windows
    pip install -r requirements.txt
    cp .env.example .env   # then fill in SUPABASE_SERVICE_ROLE_KEY
    uvicorn main:app --reload

Swagger UI:  http://localhost:8000/docs
ReDoc:       http://localhost:8000/redoc
OpenAPI:     http://localhost:8000/openapi.json
"""

# 1. Imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import hazards

# 2. App
settings = get_settings()

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=(
        "Public API for verified Malaysian road-hazard data collected by "
        "JalanGuard.\n\n"
        "Authenticate every request with your dashboard-issued API key via "
        "`Authorization: Bearer <key>`. All responses are JSON; image media is "
        "returned strictly as URL strings."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={"name": "JalanGuard", "url": "https://jalanguard.org"},
)

# 3. CORS — the dashboard and third-party integrators call this from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

# 4. Routers
app.include_router(hazards.router)


# 5. Meta endpoints (unauthenticated)
@app.get("/health", tags=["Meta"], summary="Liveness probe")
def health() -> dict:
    """Simple health check for uptime monitors and the dashboard status banner."""
    return {
        "status": "ok",
        "service": settings.api_title,
        "version": settings.api_version,
        "configured": settings.is_configured,
    }


@app.get("/", include_in_schema=False)
def root() -> dict:
    return {"docs": "/docs", "redoc": "/redoc", "openapi": "/openapi.json", "health": "/health"}
