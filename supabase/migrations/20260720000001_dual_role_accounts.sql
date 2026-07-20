-- ============================================================
-- JalanGuard — Dual-role accounts (one login, both frontends)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Background
-- ----------
-- auth.users has a partial UNIQUE index on email (WHERE is_sso_user = false),
-- so Supabase Auth can never hold two separate accounts for the same address.
-- The old is_developer flag treated "citizen" and "developer" as mutually
-- exclusive on signup, which meant an email already used on one frontend could
-- never sign up on the other — signUp() correctly reports the email as taken,
-- because at the auth layer it genuinely is.
--
-- This migration makes the two roles independent flags on ONE profile instead
-- of exclusive states, so the same login can hold both:
--   is_developer — has a web dashboard / API-key account
--   is_citizen   — has a mobile citizen-reporting account
--
-- Adding the second role to an existing account happens through
-- grant_account_role(), which only ever touches auth.uid()'s own row. The
-- calling app is responsible for proving the caller owns that email first —
-- by having them sign in with it — before calling this RPC. See the app-level
-- signUp() changes in both frontends.
-- ============================================================

-- 1. Add the second role flag. Existing rows backfill from the old exclusive
--    meaning of is_developer, so today's accounts are unaffected.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_citizen BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles SET is_citizen = (is_developer = false);

-- 2. Signup trigger — set both flags at creation, mirroring the previous
--    exclusive behaviour for a brand-new single-role account.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_dev BOOLEAN;
  initial_trust INT;
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'developer' THEN
    is_dev := true;
    initial_trust := NULL; -- Developers do not get a trust score
  ELSE
    is_dev := false;
    initial_trust := 50;   -- Citizens default to a 50 trust score
  END IF;

  INSERT INTO public.profiles (id, full_name, email, trust_score, is_developer, is_citizen)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    initial_trust,
    is_dev,
    NOT is_dev
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. grant_account_role() — adds a role to the CALLER's own account only.
--    Scoped strictly to auth.uid(); there is no email/user_id parameter, so it
--    is impossible to affect anyone else's profile no matter what a client
--    passes in. The calling app must already hold a real session for this
--    user (i.e. it verified the password) before calling this.
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
    -- First time gaining the citizen role: seed a starting trust score
    -- instead of leaving it NULL (NULL was reserved for developer-only rows).
    UPDATE public.profiles
       SET is_citizen  = true,
           trust_score = COALESCE(trust_score, 50)
     WHERE id = v_uid;
  END IF;

  RETURN QUERY SELECT p.is_developer, p.is_citizen FROM public.profiles p WHERE p.id = v_uid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.grant_account_role(TEXT) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.grant_account_role(TEXT) TO authenticated;

-- 4. Lock down direct client writes to the role/trust columns.
--
--    Pre-existing gap found while building this: the "profiles: owner update"
--    RLS policy only checks row ownership (auth.uid() = id), not which
--    columns are being written — so any signed-in user could currently run
--    `.from('profiles').update({ is_developer: true, trust_score: 999999 })`
--    from the browser console and self-grant developer access or forge their
--    trust score. RLS restricts ROWS; it does not restrict COLUMNS. Column-
--    level REVOKE does, checked independently of RLS, and SECURITY DEFINER
--    functions like grant_account_role() are unaffected since they run with
--    the function owner's privileges, not the caller's.
REVOKE UPDATE (is_developer, is_citizen, trust_score) ON public.profiles FROM authenticated;
REVOKE INSERT (is_developer, is_citizen, trust_score) ON public.profiles FROM authenticated;
