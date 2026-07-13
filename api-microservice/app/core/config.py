"""Application configuration, loaded from environment / .env via pydantic-settings."""

# 1. Imports
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


# 2. Settings
class Settings(BaseSettings):
    """Typed application settings. Values come from environment variables or .env."""

    supabase_url: str = ""
    supabase_service_role_key: str = ""

    cors_origins: str = "*"
    rate_limit_per_minute: int = 60
    default_page_size: int = 50
    max_page_size: int = 100

    api_title: str = "JalanGuard Open Data API"
    api_version: str = "1.0.0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        """CORS origins as a list. A bare '*' means allow all."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_configured(self) -> bool:
        """True when the Supabase credentials needed to serve real data are present."""
        return bool(self.supabase_url and self.supabase_service_role_key)


# 3. Cached accessor — a single Settings instance per process
@lru_cache
def get_settings() -> Settings:
    return Settings()
