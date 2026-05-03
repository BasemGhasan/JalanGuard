# JalanGuard

A comprehensive road defect reporting system for Malaysia. Citizens report road hazards via the mobile app; authorities and developers view data on the public web dashboard.

## Project Structure

```
/JalanGuard
├── /mobile-app          # React Native (Expo) — Citizen App (not run in Replit)
├── /web-dashboard       # React.js (Vite) — Authority Dashboard (port 5000)
└── /backend             # Python (FastAPI) — API Server (port 8000)
```

## Architecture

### Frontend (`web-dashboard/`)
- **Framework**: React 18 + Vite + TypeScript, port 5000
- **Styling**: Tailwind CSS v4 + inline `style` props with `COLORS` from `src/constants/theme.ts`
- **State**: No global store — auth via `AuthContext`, map data via `useMapData` hook
- **Routing**: Single-page; `App.tsx` owns a `page: Page` state, no React Router
- **Map**: `react-leaflet` + CartoDB dark tiles; heatmap (GeoJSON polygon layer) + pins mode

### Backend (`backend/`)
- FastAPI, port 8000. Vite proxies `/api` requests there.
- JWT verification via Supabase Python client

### Database
- **Supabase** (remote): PostgreSQL, accessed via REST API and `@supabase/supabase-js`
- Direct TCP/pooler connection is not available from Replit (IPv6 / tenant issues) — use REST API for DML and Supabase Dashboard SQL Editor for DDL

## Workflows

| Name              | Command                                                              | Port |
|-------------------|----------------------------------------------------------------------|------|
| Start application | `cd web-dashboard && npm run dev`                                   | 5000 |
| Backend API       | `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload` | 8000 |

## Key Source Files

| File | Purpose |
|------|---------|
| `web-dashboard/src/main.tsx` | Entry point — mounts `<App>` in StrictMode |
| `web-dashboard/src/app/App.tsx` | Root shell — wraps with `AuthProvider`, owns page routing state |
| `web-dashboard/src/context/AuthContext.tsx` | Global Supabase session state (provider + `useAuth` hook) |
| `web-dashboard/src/app/components/Navbar.tsx` | Top nav — reacts to auth state; two-step logout via `LogoutModal` |
| `web-dashboard/src/app/components/auth/AuthPage.tsx` | Unified auth card (Login / Sign Up / Forgot Password) |
| `web-dashboard/src/app/components/auth/LogoutModal.tsx` | Logout confirmation modal — only calls `signOut()` on confirm |
| `web-dashboard/src/app/components/MapPage.tsx` | Map orchestrator — thin; owns UI state only |
| `web-dashboard/src/app/components/KeyPage.tsx` | Developer settings page (API key + account) |
| `web-dashboard/src/app/components/map/HazardCard.tsx` | Floating hazard detail card (compact/expanded) |
| `web-dashboard/src/app/components/map/ImageSlider.tsx` | CSS-only image carousel (correct translateX math) |
| `web-dashboard/src/hooks/useMapData.ts` | Fetches `state_heatmap_stats` + active `hazards` from Supabase |
| `web-dashboard/src/constants/theme.ts` | Single source of truth for COLORS, SPACING, FONT_SIZES, MAP_CONFIG |
| `web-dashboard/src/types/map.ts` | TypeScript interfaces for Hazard, StateHeatmapStat, MapView |
| `web-dashboard/src/lib/supabase.ts` | Supabase JS client (reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) |
| `backend/main.py` | FastAPI entry point |

## Supabase Schema (hazards table)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| defect_type | text | e.g. "pothole" |
| severity | text | "high" \| "medium" \| "low" |
| status | text | "active" \| "resolved" |
| latitude / longitude | float8 | WGS-84 |
| image_url | text | Legacy single image (nullable) |
| image_urls | text[] | Multi-image array (1–5 Unsplash URLs in seed data) |
| description | text | Free-text hazard description |
| reporter_name | text | Display name (not FK — separate from auth.users) |
| reported_by | uuid | FK → auth.users (nullable) |
| created_at | timestamptz | Auto |

`state_heatmap_stats` — view joining hazards → states GeoJSON; queried for heatmap layer.

Migration: `supabase/migrations/20260503_hazards_schema.sql` (already applied).

## Auth Flow

1. `AuthProvider` (`AuthContext.tsx`) calls `getSession()` on mount → rehydrates localStorage session so users stay logged in on refresh. Subscribes to `onAuthStateChange` for login/logout/token-refresh.
2. `useAuth()` hook exposes `{ session, user, loading }` to any component.
3. **Logged out**: Navbar shows "Login" + "Get API Key" — both navigate to `"auth"` page.
4. **Logged in**: Navbar shows "Logout" (opens `LogoutModal`) + "My Dashboard" (toast: under construction).
5. `LogoutModal`: two-step — Cancel closes the modal; "Log Out" calls `supabase.auth.signOut()` then navigates to map.
6. `AuthPage`: single card, 3 views — `"login"` / `"signup"` / `"forgot"` — plus `"signup-sent"` / `"forgot-sent"` success screens.
7. After successful login → navigates to `"key"` (developer settings). After successful sign-up → shows email confirmation screen.

## Coding Standards

- **Colors/spacing**: Always import from `src/constants/theme.ts`. No raw hex in `style` props.
- **Handlers**: All `onClick`/event handlers wrapped in `useCallback`.
- **Derived state**: `useMemo` for any computed values.
- **Types**: Strict TypeScript — no `any`.
- **Component order**: Imports → Interfaces → Sub-components → Main component → Styles.
- **Naming**: `PascalCase` components, `camelCase` variables/functions, `UPPER_SNAKE_CASE` constants.

## Environment Variables

Frontend (`web-dashboard/.env`):
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Public anon key (safe for frontend)

Replit Secrets (server-side):
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`

## Tech Stack

| Layer    | Technology                                 |
|----------|--------------------------------------------|
| Mobile   | React Native (Expo), TypeScript            |
| Web      | React 18, Vite, TypeScript, Tailwind CSS v4 |
| Backend  | Python 3.12, FastAPI                       |
| Database | Supabase (PostgreSQL)                      |
| Auth     | Supabase Auth (`@supabase/supabase-js`)    |
| Map      | react-leaflet, CartoDB dark tiles          |
| Toast    | sonner                                     |
