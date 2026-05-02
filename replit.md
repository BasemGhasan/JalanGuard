# JalanGuard

A comprehensive road defect reporting system for Malaysia, enabling citizens to report road issues and authorities to manage them efficiently.

## Project Structure

```
/JalanGuard
├── /mobile-app          # React Native (Expo) - Citizen App (not run in Replit)
├── /web-dashboard       # React.js (Vite) - Authority Dashboard (port 5000)
└── /backend             # Python (FastAPI) - API Server (port 8000)
```

## Architecture

- **Frontend**: React + Vite + TypeScript, running on port 5000
  - Uses Tailwind CSS v4, shadcn/ui, MUI components
  - Vite proxies `/api` requests to the backend at port 8000
- **Backend**: FastAPI (Python), running on port 8000
  - RESTful API with JWT authentication
  - PostgreSQL via Replit's managed database
  - Endpoints: `/api/v1/auth`, `/api/v1/reports`, `/api/v1/users`
- **Database**: Replit PostgreSQL (DATABASE_URL env var)
  - Tables: `users`, `reports`, `report_images`

## Workflows

- `Start application` — `cd web-dashboard && npm run dev` (port 5000, webview)
- `Backend API` — `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload` (port 8000, console)

## Key Files

- `web-dashboard/src/main.tsx` — Frontend entry point
- `web-dashboard/src/app/App.tsx` — Main React app with page routing
- `web-dashboard/vite.config.ts` — Vite config with proxy to backend
- `backend/main.py` — FastAPI app with CORS and routers
- `backend/app/core/config.py` — Settings loaded from environment
- `backend/app/models/database.py` — SQLAlchemy ORM models
- `backend/.env` — Local backend env overrides (no DATABASE_URL, uses system env)

## Supabase Integration

- **Frontend**: `@supabase/supabase-js` client in `web-dashboard/src/lib/supabase.ts`
  - Auth: `supabase.auth.signInWithPassword`, `signUp`, `signOut`, `onAuthStateChange`
  - Session passed from `App.tsx` down to `Navbar`, `KeyPage`
  - Login/Register pages in `AuthPages.tsx` use real Supabase Auth
- **Backend**: `supabase` Python client in `backend/app/core/supabase.py`
  - JWT verification helper in `backend/app/core/supabase_auth.py`
- **Env vars**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `web-dashboard/.env` (safe for frontend — anon key is public by design)
- **Secrets**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` stored in Replit Secrets

## Environment Variables

Set automatically by Replit:
- `DATABASE_URL` — PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

Supabase (set as Replit Secrets):
- `SUPABASE_URL` — Project URL (e.g. `https://xxxx.supabase.co`)
- `SUPABASE_ANON_KEY` — Public anon/API key

## Tech Stack

| Layer    | Technology                      |
| -------- | ------------------------------- |
| Mobile   | React Native (Expo), TypeScript |
| Web      | React.js (Vite), TypeScript     |
| Backend  | Python 3.12, FastAPI            |
| Database | PostgreSQL (Replit managed)     |

## Theme: Midnight Infrastructure Palette

- Primary: `#0F172A` (Deep Midnight)
- Secondary: `#D97706` (Burnt Amber)
- Background: `#F8FAFC` (Ghost White)
