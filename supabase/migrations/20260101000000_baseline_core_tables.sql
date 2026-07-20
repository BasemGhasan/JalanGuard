-- ============================================================
-- JalanGuard — BASELINE: core tables (hazards, hazard_votes) + delete_user
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- ⚠️ RUN THIS FIRST. It is deliberately timestamped 20260101 so it sorts
--    before every other migration.
--
-- WHY THIS FILE EXISTS
-- --------------------
-- The `hazards` and `hazard_votes` tables were originally created ad-hoc in
-- the Supabase dashboard, so no CREATE TABLE statement was ever committed.
-- Every later migration only ALTERs them — for example
-- 20260503000001_hazards_schema.sql starts with `ALTER TABLE hazards ADD
-- COLUMN ...`, and 20260715000001 notes "a hazard_votes table already
-- existed". The same applies to the `delete_user()` RPC, which the mobile
-- delete-account flow calls but which no migration defined.
--
-- The result: applying the committed migrations to a fresh Supabase project
-- would fail immediately, because the tables they alter do not exist. This
-- file reconstructs those objects exactly as they are in the live database
-- (columns, defaults, constraints, indexes and foreign keys verified against
-- information_schema and pg_constraint), making the migration set complete
-- and reproducible from scratch.
--
-- It is written to be idempotent, so running it against the EXISTING project
-- is a safe no-op.
--
-- NOTE ON COLUMN SET
-- ------------------
-- Only the ORIGINAL columns appear below. Columns added by later migrations
-- (description, image_urls, reporter_name, adm*_id, defect_types,
-- last_checkin_at) are intentionally left to those migrations so the history
-- still reads correctly in order.
-- ============================================================

-- Required by gen_random_uuid(); PostGIS is enabled by the GIS migration.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. hazards — the core reports table
--
--    `location_point` is a PostGIS geometry kept in sync with lat/long; the
--    GIS migration adds the GiST index and the boundary auto-tagging trigger.
--    Foreign keys to profiles/administrative_boundaries are added by the
--    migrations that create those tables, so they are not declared here.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hazards (
  id             UUID             NOT NULL DEFAULT gen_random_uuid(),
  defect_type    TEXT             NOT NULL,
  severity       TEXT             NOT NULL,
  confidence     REAL,
  latitude       DOUBLE PRECISION NOT NULL,
  longitude      DOUBLE PRECISION NOT NULL,
  location_point GEOMETRY,
  status         TEXT             DEFAULT 'active',
  reported_by    UUID,
  created_at     TIMESTAMPTZ      DEFAULT now(),
  updated_at     TIMESTAMPTZ      DEFAULT now(),
  PRIMARY KEY (id)
);

-- Every map query filters on status, so this index carries the main read path.
CREATE INDEX IF NOT EXISTS idx_hazards_status ON public.hazards USING btree (status);

-- ------------------------------------------------------------
-- 2. hazard_votes — community "is it fixed?" verification
--
--    The UNIQUE (hazard_id, user_id) pair is what makes the app's upsert
--    work: casting a second vote updates the existing row rather than adding
--    another, so one user can never count twice.
--
--    The vote_type CHECK constraint is (re)applied by 20260715000001, which
--    migrated the legacy upvote/downvote values to 'fixed'/'broken'.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hazard_votes (
  id         UUID        NOT NULL DEFAULT gen_random_uuid(),
  hazard_id  UUID,
  user_id    UUID,
  vote_type  TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (hazard_id, user_id)
);

CREATE INDEX IF NOT EXISTS hazard_votes_hazard_idx
  ON public.hazard_votes USING btree (hazard_id);

-- A vote is meaningless without its hazard, so it cascades.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hazard_votes_hazard_id_fkey'
  ) THEN
    ALTER TABLE public.hazard_votes
      ADD CONSTRAINT hazard_votes_hazard_id_fkey
      FOREIGN KEY (hazard_id) REFERENCES public.hazards (id) ON DELETE CASCADE;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 3. delete_user() — full account deletion, called by the mobile app.
--
--    Deleting the auth.users row cascades to public.profiles (which has
--    `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE`), which in
--    turn cascades to the user's votes and notifications. Their hazard reports
--    survive as anonymised rows, because hazards.reported_by is ON DELETE SET
--    NULL — public safety data outlives the account that produced it.
--
--    Scoped strictly to auth.uid(): it takes no parameters, so it can only
--    ever delete the caller's own account.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_user() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.delete_user() TO authenticated;
