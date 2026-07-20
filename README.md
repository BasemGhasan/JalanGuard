# JalanGuard 🛣️

**AI-powered road hazard reporting for Malaysia.**

Citizens photograph road defects on their phone; a YOLO model verifies and classifies the damage automatically; the community confirms whether hazards are still there; and developers consume the resulting dataset through a public Open Data API.

---

## Table of contents

- [What the system does](#what-the-system-does)
- [Architecture at a glance](#architecture-at-a-glance)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Shared backend setup (do this first)](#shared-backend-setup-do-this-first)
- [Part 1 — Mobile (citizen app)](#part-1--mobile-citizen-app)
- [Part 2 — Web (developer dashboard)](#part-2--web-developer-dashboard)
- [Design system](#design-system)
- [Troubleshooting](#troubleshooting)

---

## What the system does

JalanGuard has two distinct audiences, and the whole product is shaped around that split:

| | **Citizens** | **Developers / authorities** |
|---|---|---|
| Client | Mobile app (iOS + Android) | Web dashboard |
| Purpose | Report and verify hazards | Explore data, get an API key |
| Account creation | ✅ Here only | ❌ Sign in with an existing account |

**Accounts are created on mobile only.** Supabase Auth ties one email to exactly one login, so the web dashboard cannot create a second account for the same person. Instead, signing into the dashboard with existing mobile credentials *grants* that account developer access. One login, two roles (`is_citizen` / `is_developer`).

---

## Architecture at a glance

```
┌──────────────────┐         ┌──────────────────┐
│   Mobile app     │         │  Web dashboard   │
│  React Native    │         │  React + Vite    │
│     (Expo)       │         │                  │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │  supabase-js (anon key, RLS-enforced)
         ├────────────────┬───────────┘
         │                │
         │                ▼
         │      ┌───────────────────────────┐
         │      │        SUPABASE           │
         │      │  Postgres + PostGIS       │
         │      │  Auth · Storage · RLS     │
         │      │  Triggers · pg_cron       │
         │      └─────────────┬─────────────┘
         │                    │ service_role
         │                    ▼
         │       ┌──────────────────────────┐
         │       │   api-microservice       │
         │       │   FastAPI — Open Data    │
         │       │   GET /api/v1/hazards    │
         │       └──────────────────────────┘
         │
         │  multipart POST /detect
         ▼
┌────────────────────────────┐
│    ai-microservice         │
│  FastAPI + YOLO (best.pt)  │
│  Google Cloud Run          │
└────────────────────────────┘
```

**Key idea:** both frontends talk to Supabase *directly* using the public anon key. Security comes from **Row Level Security** policies in the database, not from a middle-tier server. The two FastAPI services exist for jobs Supabase can't do: running a neural network, and serving a rate-limited public API to third parties.

### Tech stack

| Layer | Technology |
|---|---|
| Mobile | React Native, Expo SDK 54, TypeScript, React Navigation, i18next |
| Web | React 18, Vite, TypeScript, Leaflet |
| Database | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth (email + 8-digit OTP codes) |
| Storage | Supabase Storage (`hazard-images` bucket) |
| AI service | FastAPI, Ultralytics YOLO, Pillow, NumPy |
| Open Data API | FastAPI, Supabase Python client |
| Scheduling | `pg_cron` |
| Maps | Leaflet + CARTO tiles, PostGIS choropleth views |

> **Note on OpenCV:** OpenCV is **not** part of the running system. It appears only in `scripts/ai-model/model-testing.py`, an offline script used to draw bounding boxes when evaluating the model. The deployed AI service uses **Pillow + NumPy** for image handling.

---

## Repository layout

```
JalanGuard/
├── mobile-app/          React Native (Expo) — citizen app
├── web-dashboard/       React + Vite — developer dashboard
├── api-microservice/    FastAPI — public Open Data API
├── ai-microservice/     FastAPI + YOLO — hazard detection
├── supabase/
│   └── migrations/      Ordered SQL migrations (source of truth for the schema)
├── scripts/ai-model/    Offline model training + evaluation scripts
└── docs/                Architecture guide and study notes
```

---

## Prerequisites

| Tool | Version | Needed for |
|---|---|---|
| Node.js | ≥ 18 | Mobile + web |
| npm | ≥ 9 | Mobile + web |
| Python | ≥ 3.10 | Both microservices |
| Expo Go | Latest | Running the mobile app on a phone |
| Docker | Any recent | Only to build the AI service image |

A **Supabase project** is required. The repo is pre-configured against an existing one, so for coursework/demo purposes you can skip creating your own.

---

## Shared backend setup (do this first)

Both frontends read from the same Supabase project, so set this up before running either.

### 1. Apply the database migrations

Open **Supabase Dashboard → SQL Editor** and run every file in `supabase/migrations/` **in filename order** (they are timestamp-prefixed, so alphabetical = chronological):

```
20260101000000_baseline_core_tables.sql    ← ⚠️ RUN FIRST: hazards, hazard_votes, delete_user
20260503000001_hazards_schema.sql          ← adds description / image_urls / reporter_name
20260503000002_profiles_trigger.sql        ← profiles + auto-create on signup
20260616042137_enterprise_gis_architecture ← PostGIS boundaries + choropleth views
20260712000001_api_keys_vault.sql          ← encrypted API keys (Supabase Vault)
20260715000001_mobile_submission_and_votes ← voting + storage policies
20260717000001_hazard_defect_types.sql     ← multi-type detections
20260720000001_dual_role_accounts.sql      ← is_citizen / is_developer
20260721000001_web_account_deletion.sql    ← split delete semantics
20260722000001_remove_trust_score.sql
20260722000002_report_lifecycle.sql        ← community auto-resolve
20260722000003_push_notifications.sql      ← notification triggers + cron
20260722000004_fix_hazard_votes_trigger.sql
20260723000001_in_app_notifications_only.sql
20260724000001_enable_rls_hardening.sql    ← ⚠️ enables RLS — do not skip
```

### 2. Configure the email templates (required for signup)

JalanGuard verifies email with **typed 8-digit codes**, never clickable links — a link's redirect URL is unreachable from a physical phone on a different network.

In **Authentication → Emails**, make sure each of these templates includes `{{ .Token }}`:

- **Confirm signup**
- **Reset password**
- **Change email address**

Keep `{{ .ConfirmationURL }}` too if you like — the web dashboard tolerates both — but the token is what the apps actually use.

### 3. Enable email confirmation

**Authentication → Providers → Email → Confirm email: ON.** The mobile app additionally re-checks `email_confirmed_at` client-side and refuses to sign in without it.

---

# Part 1 — Mobile (citizen app)

The primary product. Where accounts are created, hazards are reported, and the community votes.

### Features

- **AI-gated reporting** — a photo must be verified by the YOLO model before it can be submitted. Hazard type and severity are set by the model and cannot be edited by the user.
- **Live hazard map** — Leaflet in a WebView, with choropleth (by state/district) and pin views, centred on your GPS location.
- **Community verification** — vote "fixed" or "still broken"; a hazard auto-resolves at ≥ 10 votes with ≥ 80 % agreement.
- **Report management** — mark your own reports fixed, or delete them.
- **In-app notifications** — votes on your reports, hazards near you, and a 30-day check-in reminder, with an unread badge.
- **Bilingual** — full English and Bahasa Melayu, persisted across launches.

### Setup

```bash
cd mobile-app
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS: Camera app; Android: in-app scanner).

If you change assets or `app.json`, clear the cache:

```bash
npx expo start -c
```

### Configuration

Credentials are baked into `src/constants/config.ts` with sensible defaults, so **no `.env` is required**. To point at a different backend, override:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

The AI service URL is a constant in the same file (`AI_SERVICE_URL`), pointing at the deployed Cloud Run instance.

### The AI microservice (dependency)

The mobile app cannot submit a report unless this service responds. It is already deployed to Cloud Run, so **you don't need to run it locally** — but if you want to:

```bash
cd ai-microservice
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

Then point `AI_SERVICE_URL` in `mobile-app/src/constants/config.ts` at your machine's LAN IP (not `localhost` — the phone can't reach that).

Docs: `http://localhost:8080/docs` · Endpoint: `POST /detect` (multipart `image`)

**Deploying:**

```bash
cd ai-microservice
gcloud run deploy jalanguard-ai --source . --region asia-southeast1 --allow-unauthenticated
```

> The Dockerfile deliberately installs the **CPU-only** PyTorch wheel — Cloud Run has no GPU, and the default PyPI resolution would pull a multi-gigabyte CUDA build.

---

# Part 2 — Web (developer dashboard)

The secondary surface: a public hazard map plus a developer portal for API access.

### Features

- **Live map** (public) — the same PostGIS choropleth data, in react-leaflet.
- **Data explorer** (public) — filter and export hazard data to Excel/PDF.
- **API key management** (sign-in required) — generate, reveal, and rotate a key stored encrypted in Supabase Vault.
- **API documentation** (sign-in required) — embedded FastAPI docs.
- **Read-only profile** — name and email are displayed but edited only in the mobile app.

### Setup

```bash
cd web-dashboard
npm install
npm run dev
```

Runs at `http://localhost:5173`.

Create `web-dashboard/.env`:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_BASE_URL=http://localhost:8000
```

> Signing in requires an account **created in the mobile app first**. The first successful web sign-in automatically grants developer access to that account.

### The Open Data API microservice

Serves third-party consumers of the hazard dataset, authenticated by API key.

```bash
cd api-microservice
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Create `api-microservice/.env`:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
CORS_ORIGINS=http://localhost:5173
RATE_LIMIT_PER_MINUTE=60
```

> ⚠️ The **service role key** bypasses Row Level Security. It belongs only in this server's environment — never in a frontend, never committed.

Docs: `http://localhost:8000/docs`

**Endpoint**

```http
GET /api/v1/hazards
Authorization: Bearer jg_<public_id>_<secret>
```

Supports `limit`, `offset`, `fields`, and date/severity/state filters. Rate limited to 60 req/min per key.

Get a key from the dashboard: sign in → **My Dashboard** → *Generate API Key*.

---

## Design system

The **Midnight Infrastructure** palette, shared by both frontends:

| Role | Hex | Usage |
|---|---|---|
| Primary | `#0F172A` | Backgrounds, headers |
| Secondary | `#D97706` | Buttons, active states, accents |
| Accent | `#334155` | Cards, input fields |
| Background | `#F8FAFC` | Light surfaces |
| Surface | `#E2E8F0` | Cards, inputs (light theme) |
| Success | `#10B981` | Resolved hazards, confirmations |
| Error | `#EF4444` | Destructive actions |
| Warning | `#F59E0B` | Pending review |

Severity colours: **high** `#D42424` · **medium** `#EF551D` · **low** `#F1B70B`

---

## Troubleshooting

| Symptom | Cause & fix |
|---|---|
| Mobile: icons/splash blank | Asset filename extension must be lowercase `.png` — Metro matches case-sensitively. Then `npx expo start -c`. |
| Mobile: text shows as `some.key.name` | New translation keys aren't in the running bundle. Restart with `npx expo start -c`. |
| Mobile: can't submit a report | The AI service rejected the photo (no hazard detected) or is unreachable. |
| Mobile: no verification email code | The Supabase email template is missing `{{ .Token }}`. |
| Web: "email or password incorrect" on first sign-in | The account must be created in the mobile app first. |
| Web: map or data empty | Check `VITE_SUPABASE_*` in `.env` and confirm the migrations ran. |
| API: `401 Invalid API key` | Send the **full** `jg_<public_id>_<secret>` string as a Bearer token. |
| API: `500` on startup | `SUPABASE_SERVICE_ROLE_KEY` missing from `api-microservice/.env`. |

---

## Security notes

- **Row Level Security is enabled on every application table.** Users can only read/write their own profile, votes, notifications, and reports. Hazards are publicly readable by design.
- **Privileged operations go through `SECURITY DEFINER` functions** (`grant_account_role`, `mark_my_notifications_read`, `delete_web_account`, the API-key RPCs) rather than broad table grants, so clients can't touch columns they shouldn't — RLS filters *rows*, not *columns*.
- **API keys are encrypted at rest** in Supabase Vault; only a non-secret public ID is stored in plaintext for lookup.
- **The service role key** is used exclusively by `api-microservice`, server-side.

Two advisories are known and intentional:
`spatial_ref_sys` (PostGIS-owned; RLS cannot be enabled, contains only public EPSG definitions) and `postgis` being installed in the `public` schema (Supabase default; relocating it would break the GIS features).

---

## License

Developed as a Final Year Project (FYP).

**JalanGuard** — making Malaysian roads safer, one report at a time. 🇲🇾
