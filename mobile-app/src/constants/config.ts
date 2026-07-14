/**
 * Runtime configuration for the JalanGuard mobile app.
 *
 * The Supabase anon key is public by design (protected by Row-Level Security)
 * and unavoidably ships inside any mobile binary, so a sensible default is baked
 * in for zero-config dev. Override per-environment with EXPO_PUBLIC_* env vars.
 *
 * Same Supabase project as the web dashboard.
 */
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://kjlxiciskiqezrtmovvw.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqbHhpY2lza2lxZXpydG1vdnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NDI1MzYsImV4cCI6MjA5MzMxODUzNn0.6vUWqY2RME2XS_bCftdN_XTsrUc0_UAnnotPkULtO_8';
