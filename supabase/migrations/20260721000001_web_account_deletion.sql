-- ============================================================
-- JalanGuard — Fix account deletion (FK block + differentiated web/mobile
-- deletion semantics)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Bug found: hazards.reported_by → profiles(id) had no ON DELETE action,
-- which defaults to NO ACTION. Any account that had submitted at least one
-- hazard report could not be deleted at all — delete_user() failed with
-- "violates foreign key constraint hazards_reported_by_fkey" the moment it
-- tried to cascade-delete the profiles row. This affected every account on
-- both frontends, not just dual-role ones.
--
-- Product change: web and mobile now delete different things.
--   - Mobile "Delete account" is always a full, permanent deletion — the
--     entire login, both roles, everything. Unchanged: delete_user().
--   - Web "Delete account" only makes sense as "remove my developer access."
--     If the account also has a citizen (mobile) side, deleting on web must
--     NOT touch it — only is_developer and the API key are cleared. Only a
--     legacy developer-only account (no citizen side to preserve) is deleted
--     outright, since there is nothing left to keep.
-- ============================================================

-- 1. hazard reports are public safety data — they should survive a deleted
--    account, just anonymised. reporter_name is already stored separately on
--    the row for display, so nothing user-visible is lost by nulling the FK.
ALTER TABLE public.hazards DROP CONSTRAINT hazards_reported_by_fkey;
ALTER TABLE public.hazards
  ADD CONSTRAINT hazards_reported_by_fkey
  FOREIGN KEY (reported_by) REFERENCES public.profiles (id) ON DELETE SET NULL;

-- 2. delete_web_account() — the web dashboard's "Delete Account" action.
--    Reuses revoke_api_key() (already SECURITY DEFINER, so callable directly)
--    so the vault secret is cleaned up the same way a manual revoke would.
--    Returns which branch ran so the UI can show accurate feedback.
CREATE OR REPLACE FUNCTION public.delete_web_account()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid       UUID := auth.uid();
  v_is_citizen BOOLEAN;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT is_citizen INTO v_is_citizen FROM public.profiles WHERE id = v_uid;

  IF COALESCE(v_is_citizen, false) THEN
    -- Citizen side exists — keep the login, just remove developer access.
    PERFORM public.revoke_api_key();
    UPDATE public.profiles SET is_developer = false WHERE id = v_uid;
    RETURN 'developer_role_removed';
  END IF;

  -- No citizen side to preserve — this really is the whole account.
  DELETE FROM auth.users WHERE id = v_uid;
  RETURN 'account_deleted';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_web_account() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.delete_web_account() TO authenticated;
