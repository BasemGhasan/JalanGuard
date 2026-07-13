"""Offline smoke test — no real Supabase needed. Mocks the service-role client
so we can exercise auth, field selection, media gating and pagination locally.
Run:  .venv/Scripts/python.exe smoke_test.py
"""
import os

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role")
os.environ.setdefault("RATE_LIMIT_PER_MINUTE", "1000")  # high; 429 tested in isolation below

from fastapi.testclient import TestClient

import app.core.database as db
import app.middleware.auth as auth_mod
import app.services.reports_service as svc

VALID_KEY = "jg_abcabcabcabcabca_" + "d" * 48

# ---- Fake Supabase client -------------------------------------------------
FAKE_ROWS = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "defect_type": "pothole",
        "severity": "high",
        "status": "active",
        "confidence": 0.92,
        "latitude": 3.14,
        "longitude": 101.6,
        "description": "Deep pothole",
        "reporter_name": "Ahmad",
        "created_at": "2026-06-01T10:00:00+00:00",
        "updated_at": "2026-06-02T10:00:00+00:00",
        "image_urls": ["https://bucket/img1.jpg", "https://bucket/img2.jpg"],
        "adm1": {"name": "Selangor"},
        "adm2": {"name": "Petaling"},
    }
]


class FakeQuery:
    def __init__(self, table):
        self.table = table

    def select(self, *a, **k):
        return self

    def eq(self, *a, **k):
        return self

    def gte(self, *a, **k):
        return self

    def lte(self, *a, **k):
        return self

    def ilike(self, *a, **k):
        return self

    def or_(self, *a, **k):
        return self

    def order(self, *a, **k):
        return self

    def range(self, *a, **k):
        return self

    def execute(self):
        class R:
            pass

        r = R()
        if self.table == "hazards":
            r.data = FAKE_ROWS
            r.count = 1
        else:
            r.data = []
            r.count = 0
        return r


class FakeClient:
    def table(self, name):
        return FakeQuery(name)

    def rpc(self, fn, params):
        raw = params.get("raw_key")

        class R:
            pass

        r = R()
        r.data = "2de65c25-b393-47d0-8215-f61f2e901a26" if raw == VALID_KEY else None
        return lambda: r  # placeholder, replaced below

    # rpc(...).execute() pattern
    def rpc(self, fn, params):  # noqa: F811
        raw = params.get("raw_key")
        owner = "2de65c25-b393-47d0-8215-f61f2e901a26" if raw == VALID_KEY else None

        class Exec:
            def execute(self_inner):
                class R:
                    pass

                r = R()
                r.data = owner
                return r

        return Exec()


fake = FakeClient()
db.get_supabase = lambda: fake
auth_mod.get_supabase = lambda: fake
svc.get_supabase = lambda: fake

from main import app  # import after patching

client = TestClient(app)
failures = []


def check(name, cond):
    print(("PASS" if cond else "FAIL"), "-", name)
    if not cond:
        failures.append(name)


# 1. OpenAPI / Swagger schema builds
schema = app.openapi()
check("openapi schema builds", "/api/v1/hazards" in schema["paths"])
check("swagger ui served", client.get("/docs").status_code == 200)
check("health ok", client.get("/health").json()["status"] == "ok")

# 2. Auth
check("401 without key", client.get("/api/v1/hazards").status_code == 401)
check("401 with bad key", client.get("/api/v1/hazards", headers={"Authorization": "Bearer jg_bad_key"}).status_code == 401)

H = {"Authorization": f"Bearer {VALID_KEY}"}

# 3. Happy path + default field selection (media hidden by default)
r = client.get("/api/v1/hazards?limit=10", headers=H)
check("200 with valid key", r.status_code == 200)
body = r.json()
row = body["data"][0]
check("category mapped from defect_type", row["category"] == "pothole")
check("location resolved to adm2", row["location"] == "Petaling")
check("media hidden when include_media=false", "media" not in row)
check("pagination total", body["pagination"]["total"] == 1)
check("pagination has_more false", body["pagination"]["has_more"] is False)

# 4. include_media returns URL strings only
r = client.get("/api/v1/hazards?include_media=true", headers=H)
row = r.json()["data"][0]
check("media present as list of url strings", row.get("media") == ["https://bucket/img1.jpg", "https://bucket/img2.jpg"])

# 5. Granular field selection drops unrequested keys
r = client.get("/api/v1/hazards?fields=severity,category", headers=H)
row = r.json()["data"][0]
check("only id+selected fields returned", set(row.keys()) == {"id", "severity", "category"})

# 6. Unknown field → 400
r = client.get("/api/v1/hazards?fields=bogus", headers=H)
check("400 on unknown field", r.status_code == 400)

# 7. limit bounds enforced (le=100)
check("422 when limit over 100", client.get("/api/v1/hazards?limit=500", headers=H).status_code == 422)

# 8. Rate limit → 429 once the per-key budget is exceeded.
#    Tested in isolation: clear buckets and shrink the limit to 3 for this key.
import app.middleware.rate_limit as rl
from app.core.config import get_settings

rl._BUCKETS.clear()
get_settings().rate_limit_per_minute = 3
codes = [client.get("/api/v1/hazards", headers=H).status_code for _ in range(6)]
check("first 3 requests allowed", codes[:3] == [200, 200, 200])
check("429 after limit exceeded", codes[3] == 429 and codes[-1] == 429)

print("\nRESULT:", "ALL PASS" if not failures else f"{len(failures)} FAILURES: {failures}")
raise SystemExit(1 if failures else 0)
