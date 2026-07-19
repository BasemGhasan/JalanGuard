"""Application configuration, loaded from environment / .env via pydantic-settings."""

# 1. Imports
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# The service package lives at ai-microservice/app/core/config.py, so the model
# file (ai-microservice/best.pt) sits three parents up. Resolved to an absolute
# path so the model loads regardless of the process working directory.
_DEFAULT_MODEL_PATH = str((Path(__file__).resolve().parents[2] / "best.pt"))


# 2. Settings
class Settings(BaseSettings):
    """Typed application settings. Values come from environment variables or .env."""

    # Path to the trained YOLO weights.
    model_path: str = _DEFAULT_MODEL_PATH

    # Minimum per-box confidence for a detection to count (matches the FYP
    # evaluation script's CONF_THRESHOLD so the service and the report agree).
    conf_threshold: float = 0.25

    # Intersection-over-Minimum overlap above which same-type boxes are merged
    # by the custom NMS. Differing types (pothole inside a crack) are exempt.
    iomin_threshold: float = 0.45

    # Cap on the uploaded image size (bytes) the endpoint will accept (10 MB).
    max_upload_bytes: int = 10 * 1024 * 1024

    cors_origins: str = "*"

    api_title: str = "JalanGuard AI Detection Service"
    api_version: str = "1.0.0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        """CORS origins as a list. A bare '*' means allow all."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def model_exists(self) -> bool:
        """True when the configured weights file is present on disk."""
        return Path(self.model_path).is_file()


# 3. Cached accessor — a single Settings instance per process
@lru_cache
def get_settings() -> Settings:
    return Settings()
