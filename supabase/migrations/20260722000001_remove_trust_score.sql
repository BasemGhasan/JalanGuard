-- ============================================================
-- JalanGuard — Remove the trust-score concept entirely
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- The trust score was seeded to 50 for citizens and displayed on the Home and
-- Profile screens, but nothing ever changed it — it was a placeholder for a
-- reputation system that is not being built. Removing the column outright
-- rather than leaving a dead field that reads as a real feature.
--
-- Both functions that referenced the column are redefined below; the column is
-- dropped last so neither is left referencing a missing field mid-migration.
-- ============================================================

-- 1. Signup trigger — no longer seeds a trust score.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_dev BOOLEAN;
BEGIN
  -- COALESCE matters: `NULL = 'developer'` is NULL, not false, so without it a
  -- signup with no `role` in its metadata (i.e. every mobile signup) would set
  -- is_dev to NULL and `NOT is_dev` would violate profiles.is_citizen NOT NULL.
  is_dev := COALESCE(NEW.raw_user_meta_data ->> 'role', '') = 'developer';

  INSERT INTO public.profiles (id, full_name, email, is_developer, is_citizen)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    is_dev,
    NOT is_dev
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Role grant — drops the trust_score seeding branch.
CREATE OR REPLACE FUNCTION public.grant_account_role(target_role TEXT)
RETURNS TABLE (is_developer BOOLEAN, is_citizen BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF target_role NOT IN ('citizen', 'developer') THEN
    RAISE EXCEPTION 'Invalid role: %', target_role;
  END IF;

  IF target_role = 'developer' THEN
    UPDATE public.profiles SET is_developer = true WHERE id = v_uid;
  ELSE
    UPDATE public.profiles SET is_citizen = true WHERE id = v_uid;
  END IF;

  RETURN QUERY SELECT p.is_developer, p.is_citizen FROM public.profiles p WHERE p.id = v_uid;
END;
$$;

-- 3. Drop the column now that nothing references it.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS trust_score;
