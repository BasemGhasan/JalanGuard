"""API-key authentication.

A FastAPI dependency that:
  1. extracts the Bearer token (or X-API-Key header),
  2. validates it against the Vault-encrypted keys via the verify_api_key() RPC,
  3. applies the per-key rate limit.

On success it yields an ``AuthContext`` with the owning user's id.
"""

# 1. Imports
from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..core.database import get_supabase
from .rate_limit import enforce_rate_limit

# 2. Security scheme — drives the "Authorize" button in Swagger UI
_bearer_scheme = HTTPBearer(
    auto_error=False,
    description="Your JalanGuard API key (format: jg_<id>_<secret>).",
)


# 3. Auth context
@dataclass
class AuthContext:
    """Resolved identity for an authenticated request."""

    user_id: str
    api_key: str


# 4. Helpers
def _extract_key(request: Request, creds: HTTPAuthorizationCredentials | None) -> str | None:
    """Prefer the Authorization: Bearer header; fall back to X-API-Key."""
    if creds and creds.credentials:
        return creds.credentials.strip()
    header_key = request.headers.get("X-API-Key")
    return header_key.strip() if header_key else None


# 5. Dependency
async def require_api_key(
    request: Request,
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> AuthContext:
    """Authenticate and rate-limit the request, or raise 401/429/503."""
    api_key = _extract_key(request, creds)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key. Send 'Authorization: Bearer <key>' or 'X-API-Key: <key>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate against the decrypted keys in the database (service_role RPC).
    try:
        result = get_supabase().rpc("verify_api_key", {"raw_key": api_key}).execute()
    except Exception as exc:  # network / config failure — not the caller's fault
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication backend is unavailable.",
        ) from exc

    user_id = result.data
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Rate limit only after the key is known-valid, so unauthenticated noise
    # cannot exhaust a real key's budget.
    enforce_rate_limit(api_key)

    return AuthContext(user_id=str(user_id), api_key=api_key)
