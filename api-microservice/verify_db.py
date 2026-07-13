"""Direct database connectivity check.

Loads .env through the app's own Settings (proving the API reads the same
credentials), then queries the `hazards` table with the service-role client.
Doubles as a wake-up ping for a paused free-tier Supabase instance.

Run:  .venv/Scripts/python.exe verify_db.py
"""
import sys
import time

from app.core.config import get_settings
from app.core.database import get_supabase

settings = get_settings()
print(f"SUPABASE_URL loaded:              {settings.supabase_url or '(MISSING)'}")
print(f"SUPABASE_SERVICE_ROLE_KEY loaded: {'yes (' + str(len(settings.supabase_service_role_key)) + ' chars)' if settings.supabase_service_role_key else '(MISSING)'}")
print(f"is_configured:                    {settings.is_configured}")

if not settings.is_configured:
    print("\nFAIL — .env is not being read. Aborting.")
    sys.exit(1)

client = get_supabase()

# Retry a few times: a paused free-tier instance can take a moment to wake.
for attempt in range(1, 4):
    try:
        t0 = time.time()
        result = (
            client.table("hazards")
            .select("id, defect_type, severity, status", count="exact")
            .limit(3)
            .execute()
        )
        elapsed = time.time() - t0
        print(f"\nquery OK (attempt {attempt}, {elapsed:.2f}s)")
        print(f"total rows in hazards: {result.count}")
        for row in result.data:
            print(f"  - {row['id'][:8]}…  {row['defect_type']:<14} severity={row['severity']:<7} status={row['status']}")
        print("\nPASS — database is awake and the service-role connection works.")
        sys.exit(0)
    except Exception as exc:
        print(f"attempt {attempt} failed: {exc}")
        if attempt < 3:
            print("retrying in 3s (database may be waking up)…")
            time.sleep(3)

print("\nFAIL — could not reach the hazards table after 3 attempts.")
sys.exit(1)
