"""JalanGuard AI Detection Service — application entry point.

Runs the trained YOLO model behind a small HTTP API. The mobile app sends a
captured photo to POST /detect and uses the response to auto-fill (and gate) a
hazard report: no verified detection, no report.

Deployed on Google Cloud Run — the mobile app always calls that live URL, not
a local instance. `uvicorn main:app --reload` here is only for iterating on
this service's own code (via /docs or curl) before deploying; see the README
for the deploy command and the full local-dev workflow.

Swagger UI:  http://localhost:8000/docs
"""

# 1. Imports
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import detect
from app.services import detector

# 2. Lifespan — warm the model on startup so the first /detect isn't slow.
settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    detector.warm_up()
    yield


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=(
        "Computer-vision service that validates Malaysian road-hazard photos and "
        "classifies their type (crack / pothole) and severity for JalanGuard."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# 3. CORS — the mobile app (and, in dev, browsers) call this cross-origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# 4. Routers
app.include_router(detect.router)


# 5. Meta endpoints
@app.get("/health", tags=["Meta"], summary="Liveness probe")
def health() -> dict:
    """Health check that also reports whether the model weights are loadable.

    Actually attempts to load the model (cheap after the first success, since
    the loader is cached) rather than just checking the weights file exists —
    a present-but-broken model (e.g. a torch/torchvision mismatch) must show
    up here, not just report "ok" while every real request 500s.
    """
    return {
        "status": "ok",
        "service": settings.api_title,
        "version": settings.api_version,
        "model_available": detector.warm_up(),
    }


@app.get("/", include_in_schema=False)
def root() -> dict:
    return {"docs": "/docs", "health": "/health", "detect": "POST /detect"}
