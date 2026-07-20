-- ============================================================
-- JalanGuard — Enable RLS everywhere + security hardening
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Fixes the issues reported by the Supabase database linter, most importantly:
--
--   `public.profiles` had TWO RLS POLICIES DEFINED BUT RLS TURNED OFF.
--   Policies are inert unless RLS is enabled on the table, so the
--   "owner select" / "owner update" rules were doing nothing at all: every
--   signed-in user (and `anon`, which PostgREST exposes publicly) could read
--   every row in profiles — including all users' email addresses — and write
--   to any column they still held a grant on. Enabling RLS is what actually
--   activates the policies that were already written.
--
-- Also here: RLS on the remaining public tables, pinned search_path on the
-- three functions that lacked it, and EXECUTE revoked on functions that exist
-- only to back triggers or cron and were reachable as REST RPC endpoints.
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles — activate the existing owner-scoped policies.
--
--    No INSERT policy is added on purpose: rows are created solely by the
--    `handle_new_user` trigger, which is SECURITY DEFINER and owned by the
--    table owner, so it bypasses RLS. A client has no legitimate reason to
--    insert a profile directly.
--
--    Cross-user reads aren't needed anywhere: a hazard's reporter name is
--    denormalised onto `hazards.reporter_name`, and the server-side triggers
--    that scan profiles (nearby notifications, preference checks) are all
--    SECURITY DEFINER and therefore unaffected.
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2. administrative_boundaries — public reference GIS data.
--
--    Readable by everyone (the choropleth depends on it), but with RLS off it
--    was also *writable* by any client holding the default grants. Enabling
--    RLS with a read-only policy keeps the map working while removing the
--    write path.
-- ------------------------------------------------------------
ALTER TABLE public.administrative_boundaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "administrative_boundaries public read" ON public.administrative_boundaries;
CREATE POLICY "administrative_boundaries public read"
  ON public.administrative_boundaries FOR SELECT
  USING (true);

REVOKE INSERT, UPDATE, DELETE ON public.administrative_boundaries FROM anon, authenticated;

-- ------------------------------------------------------------
-- 3. Pin search_path on the functions that lacked it.
--
--    A SECURITY DEFINER function without a fixed search_path can be tricked
--    into resolving an unqualified name against a schema the caller controls.
--    ALTER (rather than CREATE OR REPLACE) so the bodies stay untouched.
-- ------------------------------------------------------------
ALTER FUNCTION public.hazard_autoresolve_threshold()   SET search_path = public;
ALTER FUNCTION public.auto_tag_hazard_boundaries()     SET search_path = public;
ALTER FUNCTION public.set_updated_at()                 SET search_path = public;

-- ------------------------------------------------------------
-- 4. Trigger- and cron-only functions must not be REST-callable.
--
--    Supabase exposes every function in `public` as `/rest/v1/rpc/<name>`.
--    These exist purely to back triggers or the scheduler, and several are
--    genuinely dangerous when called directly — `enqueue_notification` would
--    let anyone forge a notification into any user's inbox, and
--    `queue_report_checkins` could be spammed to flood the queue.
--
--    Revoking EXECUTE does NOT stop them working as triggers: a trigger
--    function runs under the table owner's context, not the caller's, so no
--    EXECUTE grant on the calling role is required.
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.handle_new_user()            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_tag_hazard_boundaries() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_hazard_vote_changed()     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_hazard_vote()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_hazard_resolved()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_nearby_users()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.queue_report_checkins()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_hazard_status(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_notification(UUID, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.hazard_autoresolve_threshold() FROM PUBLIC, anon, authenticated;

-- `delete_user` is called by the mobile app's own delete-account flow, so
-- signed-in users keep it — but `anon` has no business reaching it.
REVOKE EXECUTE ON FUNCTION public.delete_user() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.delete_user() TO authenticated;

-- The vote tally is only ever read by the signed-in mobile app.
REVOKE EXECUTE ON FUNCTION public.hazard_vote_summary(UUID) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.hazard_vote_summary(UUID) TO authenticated;
