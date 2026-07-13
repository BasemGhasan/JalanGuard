# JalanGuard Open Data API (api-microservice)

Production-ready **FastAPI** microservice that serves verified road-hazard
("report") data to third-party developers, authenticated with API keys that are
issued and revealed from the web dashboard and stored **encrypted in Supabase
Vault** (two-way symmetric encryption — never hashed).

## Architecture

```
api-microservice/
├── main.py                     # FastAPI app, CORS, meta endpoints, Swagger
├── requirements.txt
├── .env.example                # copy to .env
└── app/
    ├── core/
    │   ├── config.py           # env-driven settings (pydantic-settings)
    │   └── database.py         # service-role Supabase client (singleton)
    ├── middleware/
    │   ├── auth.py             # Bearer/X-API-Key → verify_api_key() RPC
    │   └── rate_limit.py       # 60 req/min per key, fixed window → 429
    ├── models/
    │   └── reports.py          # Pydantic schemas + selectable-field catalogue
    ├── routers/
    │   └── reports.py          # GET /api/v1/hazards (thin controller)
    └── services/
        └── reports_service.py  # query building, filtering, pagination
```

Separation of concerns is strict: **routers** validate input, **services** hold
business logic, **middleware** handles auth + limits, **core** wires config/DB.

## How authentication works

1. A signed-in user generates a key in the dashboard. The plaintext
   `jg_<public_id>_<secret>` is stored **encrypted** in Supabase Vault; only the
   16-char `public_id` is kept in plaintext for O(1) lookup.
2. The client sends `Authorization: Bearer jg_...` to this API.
3. `auth.py` calls the `verify_api_key(raw_key)` Postgres RPC (service-role
   only), which looks up the row by `public_id`, decrypts the stored key, and
   returns the owning `user_id` on an exact match.
4. The per-key rate limiter (60/min) runs; `429` is returned when exceeded.

## Setup

```bash
cd api-microservice
python -m venv .venv
# Windows:  .venv\Scripts\activate     |  macOS/Linux:  source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env         # then set SUPABASE_SERVICE_ROLE_KEY
uvicorn main:app --reload
```

- **Swagger UI:** http://localhost:8000/docs (auto-generated)
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json
- **Health:** http://localhost:8000/health

> The `SUPABASE_SERVICE_ROLE_KEY` (Dashboard → Project Settings → API) is
> required for real auth/data. It bypasses RLS — keep it server-side only.

## Endpoint

### `GET /api/v1/hazards`

| Query param     | Type    | Default | Notes                                            |
|-----------------|---------|---------|--------------------------------------------------|
| `limit`         | int     | 50      | 1–100 (server-enforced max).                     |
| `offset`        | int     | 0       | Pagination offset.                               |
| `location`      | string  | –       | Administrative area name, partial match.         |
| `category`      | string  | –       | Defect type (e.g. `pothole`).                    |
| `severity`      | string  | –       | `low` \| `medium` \| `high`.                     |
| `status`        | string  | –       | Lifecycle status (e.g. `active`).                |
| `date_from`     | date    | –       | `YYYY-MM-DD`, inclusive.                          |
| `date_to`       | date    | –       | `YYYY-MM-DD`, inclusive.                          |
| `include_media` | bool    | false   | Include image **URL strings** (never Base64).    |
| `fields`        | string  | –       | Comma-separated subset of fields (`id` implicit).|

Example:

```bash
curl "http://localhost:8000/api/v1/hazards?severity=high&location=Selangor&include_media=true&limit=20" \
  -H "Authorization: Bearer jg_your_key_here"
```

Response:

```json
{
  "data": [
    {
      "id": "…",
      "category": "pothole",
      "severity": "high",
      "status": "active",
      "location": "Petaling",
      "media": ["https://…/image1.jpg"]
    }
  ],
  "pagination": { "total": 42, "limit": 20, "offset": 0, "count": 20, "has_more": true }
}
```

## Notes / production hardening

- The rate limiter stores counters **in process memory**. For multi-worker or
  multi-instance deployments, back it with Redis (the `enforce_rate_limit`
  contract is unchanged).
- Media fields return storage-bucket URL strings only — the payload never
  contains binary or Base64 image data.
