"""Per-API-key rate limiting.

A fixed-window counter (60 requests / minute by default). State is kept in
process memory guarded by a lock — sufficient for a single-process FYP
deployment. For a multi-worker/horizontal deployment, swap the in-memory
``_BUCKETS`` store for Redis (the ``enforce_rate_limit`` contract stays the same).
"""

# 1. Imports
import threading
import time

from fastapi import HTTPException, status

from ..core.config import get_settings

# 2. Module state — key -> (window_index, count_in_window)
_LOCK = threading.Lock()
_BUCKETS: dict[str, tuple[int, int]] = {}


# 3. Enforcement
def enforce_rate_limit(api_key: str) -> None:
    """Increment the caller's counter for the current minute.

    Raises HTTP 429 with a ``Retry-After`` header once the limit is exceeded.
    Why fixed-window: it is O(1) in time and memory per key and needs no
    per-request timestamp lists, which matters when the store is in memory.
    """
    limit = get_settings().rate_limit_per_minute
    now = int(time.time())
    window = now // 60

    with _LOCK:
        stored_window, count = _BUCKETS.get(api_key, (window, 0))
        if stored_window != window:
            stored_window, count = window, 0
        count += 1
        _BUCKETS[api_key] = (stored_window, count)

    if count > limit:
        retry_after = 60 - (now % 60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {limit} requests per minute per API key.",
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
            },
        )
