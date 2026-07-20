-- ============================================================
-- JalanGuard — Drop push delivery; keep notifications in-app only
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Remote push required a paid Apple Developer membership on iOS (and a custom
-- EAS dev build on both platforms), which isn't worth it for this project. The
-- notification *content* pipeline is unchanged and still valuable — triggers
-- still enqueue rows for votes on your reports, nearby hazards, and the 30-day
-- check-in — but delivery is now purely in-app: the Notifications screen reads
-- the queue directly.
--
-- Removed: push_tokens, the send-push dispatcher, its cron job, and the
-- private settings that held its URL/secret.
-- Kept:    notification_outbox, all three enqueue triggers, the per-user
--          preferences, and the daily 30-day check-in job.
-- ============================================================

-- 1. Stop and remove the push dispatcher.
SELECT cron.unschedule('jalanguard-dispatch-push')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'jalanguard-dispatch-push');

DROP FUNCTION IF EXISTS public.dispatch_pending_notifications();

-- 2. Device tokens are meaningless without push.
DROP TABLE IF EXISTS public.push_tokens;

-- 3. These only ever held the dispatcher's URL and shared secret.
DROP TABLE IF EXISTS private.app_settings;
DROP SCHEMA IF EXISTS private CASCADE;

-- pg_net was installed solely to POST to the Edge Function. pg_cron stays —
-- the 30-day check-in job still needs it.
DROP EXTENSION IF EXISTS pg_net;

-- 4. Swap the delivery marker for a read marker.
--    `sent_at` tracked "handed to Expo" and nothing sets it any more.
--    `read_at` drives the unread badge on the Home screen.
ALTER TABLE public.notification_outbox DROP COLUMN IF EXISTS sent_at;
ALTER TABLE public.notification_outbox ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

DROP INDEX IF EXISTS public.notification_outbox_pending_idx;
-- Powers the unread count, which runs on every Home screen focus.
CREATE INDEX IF NOT EXISTS notification_outbox_unread_idx
  ON public.notification_outbox (user_id) WHERE read_at IS NULL;

-- 5. Marking read.
--    An RPC rather than an UPDATE policy: users should be able to set read_at
--    and nothing else, and a row-scoped UPDATE policy would let a client
--    rewrite the title/body of its own notifications (RLS filters rows, not
--    columns). SECURITY DEFINER keeps the write surface to exactly this.
CREATE OR REPLACE FUNCTION public.mark_my_notifications_read()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   UUID := auth.uid();
  v_count INT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  UPDATE public.notification_outbox
     SET read_at = now()
   WHERE user_id = v_uid AND read_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_my_notifications_read() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.mark_my_notifications_read() TO authenticated;

-- 6. Defence in depth on the outbox.
--    RLS already blocks client writes (there is no INSERT/UPDATE/DELETE policy,
--    and RLS denies by default when nothing matches — verified directly), but
--    `authenticated` still carried table-level write grants from Supabase's
--    default privileges. Revoking them means a future permissive policy added
--    by mistake can't silently open a path to rewriting notification content.
REVOKE INSERT, UPDATE, DELETE ON public.notification_outbox FROM authenticated, anon;
