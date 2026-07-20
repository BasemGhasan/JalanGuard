-- ============================================================
-- JalanGuard — Push notification infrastructure
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Delivery path:
--   DB event (vote / new hazard / cron) → notification_outbox row
--     → pg_cron drains the outbox every minute via pg_net
--       → Edge Function `send-push`
--         → Expo Push API → device
--
-- Why an outbox rather than firing pg_net directly from each trigger:
--   - A trigger that makes an HTTP call inside the writing transaction ties
--     the user's action (casting a vote, submitting a report) to the latency
--     and availability of an external service. An outbox row is a cheap local
--     insert; delivery happens out-of-band and can be retried without the
--     original write ever having failed.
--   - It also gives an audit trail of what was sent and why, which is what the
--     in-app Notifications screen reads.
--
-- The three user-facing categories map to `kind`:
--   my_reports     — activity on a hazard you reported (votes, auto-resolve)
--   nearby_hazards — a new hazard reported close to your last known location
--   report_checkin — the 30-day "is this still broken?" reminder
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ------------------------------------------------------------
-- 1. Device push tokens. One row per (user, token) — a user may sign in on
--    more than one device, and a device may be reassigned to another user.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id         UUID        NOT NULL DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  token      TEXT        NOT NULL,
  platform   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (token)
);
CREATE INDEX IF NOT EXISTS push_tokens_user_idx ON public.push_tokens (user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_tokens owner select" ON public.push_tokens;
CREATE POLICY "push_tokens owner select" ON public.push_tokens
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "push_tokens owner insert" ON public.push_tokens;
CREATE POLICY "push_tokens owner insert" ON public.push_tokens
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_tokens owner update" ON public.push_tokens;
CREATE POLICY "push_tokens owner update" ON public.push_tokens
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "push_tokens owner delete" ON public.push_tokens;
CREATE POLICY "push_tokens owner delete" ON public.push_tokens
  FOR DELETE USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 2. Per-user notification preferences, mirrored server-side.
--    The app also keeps a local copy for instant toggle feedback, but the
--    server needs its own copy — triggers can't read the device's storage.
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_my_reports     BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_nearby_hazards BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_report_checkin BOOLEAN NOT NULL DEFAULT true;

-- Last known coarse location, used only to decide "is this hazard near me".
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_latitude   DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS last_longitude  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS last_seen_at    TIMESTAMPTZ;

-- Clients may write their own preferences and location, but still not the
-- role flags (see 20260720000001) — re-grant explicitly per column.
GRANT UPDATE (
  notify_my_reports, notify_nearby_hazards, notify_report_checkin,
  last_latitude, last_longitude, last_seen_at
) ON public.profiles TO authenticated;

-- ------------------------------------------------------------
-- 3. Outbox. `sent_at IS NULL` is the work queue.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_outbox (
  id         UUID        NOT NULL DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  kind       TEXT        NOT NULL CHECK (kind IN ('my_reports', 'nearby_hazards', 'report_checkin')),
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  hazard_id  UUID        REFERENCES public.hazards (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at    TIMESTAMPTZ,
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS notification_outbox_pending_idx
  ON public.notification_outbox (created_at) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS notification_outbox_user_idx
  ON public.notification_outbox (user_id, created_at DESC);

ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;

-- Users read their own notification history (powers the Notifications screen).
-- No client INSERT policy: rows are only ever created by SECURITY DEFINER
-- triggers and the cron job, so a client can't fabricate notifications.
DROP POLICY IF EXISTS "notification_outbox owner select" ON public.notification_outbox;
CREATE POLICY "notification_outbox owner select" ON public.notification_outbox
  FOR SELECT USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 4. Enqueue helper — respects the recipient's preference and never
--    self-notifies (you don't need a push about your own vote).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enqueue_notification(
  p_user_id   UUID,
  p_kind      TEXT,
  p_title     TEXT,
  p_body      TEXT,
  p_hazard_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wants BOOLEAN;
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;

  SELECT CASE p_kind
           WHEN 'my_reports'     THEN notify_my_reports
           WHEN 'nearby_hazards' THEN notify_nearby_hazards
           WHEN 'report_checkin' THEN notify_report_checkin
           ELSE false
         END
    INTO v_wants
    FROM public.profiles WHERE id = p_user_id;

  IF COALESCE(v_wants, false) THEN
    INSERT INTO public.notification_outbox (user_id, kind, title, body, hazard_id)
    VALUES (p_user_id, p_kind, p_title, p_body, p_hazard_id);
  END IF;
END;
$$;

-- ------------------------------------------------------------
-- 5. "my_reports" — someone voted on, or the community auto-resolved, a
--    hazard you reported.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_hazard_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_voter UUID := COALESCE(NEW.user_id, OLD.user_id);
  v_hid   UUID := COALESCE(NEW.hazard_id, OLD.hazard_id);
BEGIN
  SELECT reported_by INTO v_owner FROM public.hazards WHERE id = v_hid;

  -- Don't notify someone about their own vote on their own report.
  IF v_owner IS NOT NULL AND v_owner IS DISTINCT FROM v_voter THEN
    PERFORM public.enqueue_notification(
      v_owner, 'my_reports',
      'New vote on your report',
      'Someone in the community voted on a hazard you reported.',
      v_hid
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS hazard_votes_notify_owner ON public.hazard_votes;
CREATE TRIGGER hazard_votes_notify_owner
  AFTER INSERT ON public.hazard_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_hazard_vote();

CREATE OR REPLACE FUNCTION public.notify_on_hazard_resolved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'fixed' AND OLD.status IS DISTINCT FROM 'fixed' THEN
    PERFORM public.enqueue_notification(
      NEW.reported_by, 'my_reports',
      'Your report was marked fixed',
      'Enough people confirmed this hazard is fixed, so it has been resolved.',
      NEW.id
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS hazards_notify_resolved ON public.hazards;
CREATE TRIGGER hazards_notify_resolved
  AFTER UPDATE OF status ON public.hazards
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_hazard_resolved();

-- ------------------------------------------------------------
-- 6. "nearby_hazards" — a new report near your last known location.
--    ~5 km, using an equirectangular approximation. Good enough at Malaysian
--    latitudes for a proximity ping and far cheaper than PostGIS distance on
--    every insert. Only considers users seen in the last 30 days so we don't
--    ping dormant accounts based on a stale location.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_nearby_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN
    SELECT id FROM public.profiles
    WHERE id IS DISTINCT FROM NEW.reported_by
      AND last_latitude IS NOT NULL
      AND last_longitude IS NOT NULL
      AND last_seen_at > now() - INTERVAL '30 days'
      AND (
        111.0 * SQRT(
          POW(last_latitude - NEW.latitude, 2) +
          POW((last_longitude - NEW.longitude) * COS(RADIANS(NEW.latitude)), 2)
        )
      ) <= 5.0
  LOOP
    PERFORM public.enqueue_notification(
      v_user.id, 'nearby_hazards',
      'New hazard reported nearby',
      'A new road hazard was reported close to your location.',
      NEW.id
    );
  END LOOP;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS hazards_notify_nearby ON public.hazards;
CREATE TRIGGER hazards_notify_nearby
  AFTER INSERT ON public.hazards
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_nearby_users();

-- ------------------------------------------------------------
-- 7. "report_checkin" — the 30-day friendly reminder.
--    Only fires for reports that are still 'active' (i.e. neither the owner
--    nor the vote threshold has resolved them), and at most once per 30 days
--    per report, tracked by last_checkin_at.
-- ------------------------------------------------------------
ALTER TABLE public.hazards ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.queue_report_checkins()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row   RECORD;
  v_count INT := 0;
BEGIN
  FOR v_row IN
    SELECT id, reported_by
      FROM public.hazards
     WHERE status = 'active'
       AND reported_by IS NOT NULL
       AND created_at <= now() - INTERVAL '30 days'
       AND (last_checkin_at IS NULL OR last_checkin_at <= now() - INTERVAL '30 days')
  LOOP
    PERFORM public.enqueue_notification(
      v_row.reported_by, 'report_checkin',
      'Is this hazard still there?',
      'You reported this 30 days ago. If it has been fixed, you can mark it resolved — no action needed otherwise.',
      v_row.id
    );
    UPDATE public.hazards SET last_checkin_at = now() WHERE id = v_row.id;
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ------------------------------------------------------------
-- 8. Dispatcher + schedules.
--    The function URL and shared secret live in a private table rather than
--    inline in the cron command, because cron.job.command is world-readable to
--    anyone who can query the cron schema.
-- ------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
REVOKE ALL ON private.app_settings FROM anon, authenticated;

-- Replace <project-ref> if this is ever run against a different project.
INSERT INTO private.app_settings (key, value) VALUES
  ('push_function_url', 'https://kjlxiciskiqezrtmovvw.supabase.co/functions/v1/send-push'),
  ('push_dispatch_secret', encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.dispatch_pending_notifications()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_url    TEXT;
  v_secret TEXT;
  v_req_id BIGINT;
  v_pending INT;
BEGIN
  -- Skip the HTTP call entirely when there's nothing queued.
  SELECT count(*) INTO v_pending FROM public.notification_outbox WHERE sent_at IS NULL;
  IF v_pending = 0 THEN RETURN NULL; END IF;

  SELECT value INTO v_url    FROM private.app_settings WHERE key = 'push_function_url';
  SELECT value INTO v_secret FROM private.app_settings WHERE key = 'push_dispatch_secret';
  IF v_url IS NULL OR v_secret IS NULL THEN RETURN NULL; END IF;

  SELECT net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer ' || v_secret
               ),
    body    := '{}'::jsonb
  ) INTO v_req_id;

  RETURN v_req_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.dispatch_pending_notifications() FROM PUBLIC, anon, authenticated;

-- Drain the outbox every minute.
SELECT cron.schedule('jalanguard-dispatch-push', '* * * * *',
  $$ SELECT public.dispatch_pending_notifications() $$);

-- Daily at 09:00 UTC (~17:00 Malaysia) — a reminder shouldn't arrive at 3am.
SELECT cron.schedule('jalanguard-report-checkins', '0 9 * * *',
  $$ SELECT public.queue_report_checkins() $$);
