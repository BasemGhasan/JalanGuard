"""Supabase client factory.

The backend talks to Supabase with the SERVICE-ROLE key so it can call the
service_role-only verify_api_key() RPC and read hazard data unhindered by RLS.
This client must never be exposed to the browser.
"""

# 1. Imports
from functools import lru_cache

from supabase import Client, create_client

from .config import get_settings


# 2. Cached client — one connection pool per process
@lru_cache
def get_supabase() -> Client:
    """Return a process-wide Supabase client authenticated as service_role.

    Raises RuntimeError if the required credentials are missing, so the failure
    surfaces clearly at first use rather than as an opaque network error.
    """
    settings = get_settings()
    if not settings.is_configured:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set "
            "(copy backend/.env.example to backend/.env and fill them in)."
        )
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
