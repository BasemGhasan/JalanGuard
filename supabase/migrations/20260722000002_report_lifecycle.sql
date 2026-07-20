-- ============================================================
-- JalanGuard — Report lifecycle: owner delete/resolve + community auto-resolve
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Three related changes:
--   1. Reporters can delete their own reports (there was no DELETE policy at
--      all, so the History screen's delete action would silently no-op).
--   2. The existing "hazards owner update" policy already lets a reporter set
--      their own report to 'fixed' — no change needed there, but the status
--      values are constrained below so a client can't write arbitrary text.
--   3. Community auto-resolve: once a report has enough votes and a strong
--      enough majority saying it's fixed, the status flips to 'fixed'
--      automatically. The map only renders status='active', so a resolved
--      hazard disappears from it without any extra client filtering.
-- ============================================================

-- 1. Owners may delete their own reports.
DROP POLICY IF EXISTS "hazards owner delete" ON public.hazards;
CREATE POLICY "hazards owner delete"
  ON public.hazards FOR DELETE
  USING (reported_by = auth.uid());

-- 2. Auto-resolve thresholds, kept as one place to tune the rule.
--    Deliberately IMMUTABLE + inlined constants rather than a settings table:
--    this is a product rule, not per-deployment configuration.
CREATE OR REPLACE FUNCTION public.hazard_autoresolve_threshold()
RETURNS TABLE (min_votes INT, fixed_ratio NUMERIC)
LANGUAGE sql
IMMUTABLE
AS $$ SELECT 10::INT, 0.80::NUMERIC $$;

/**
 * Recomputes one hazard's status from its current vote tally.
 *
 * Only ever promotes 'active' → 'fixed'. It deliberately does NOT demote a
 * hazard back to active if votes later swing the other way: a report that the
 * community (or its owner) has already closed shouldn't silently reappear on
 * the map, and an actually-recurring hazard should be filed as a new report so
 * it carries a fresh photo and timestamp.
 */
CREATE OR REPLACE FUNCTION public.recompute_hazard_status(p_hazard_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fixed   INT;
  v_total   INT;
  v_min     INT;
  v_ratio   NUMERIC;
BEGIN
  SELECT min_votes, fixed_ratio INTO v_min, v_ratio
    FROM public.hazard_autoresolve_threshold();

  SELECT
    COALESCE(SUM(CASE WHEN vote_type = 'fixed' THEN 1 ELSE 0 END), 0),
    COUNT(*)
  INTO v_fixed, v_total
  FROM public.hazard_votes
  WHERE hazard_id = p_hazard_id;

  IF v_total >= v_min AND (v_fixed::NUMERIC / v_total) >= v_ratio THEN
    UPDATE public.hazards
       SET status = 'fixed', updated_at = now()
     WHERE id = p_hazard_id
       AND status = 'active';
  END IF;
END;
$$;

-- 3. Fire the recompute after any vote change.
--    AFTER (not BEFORE) so the row driving the tally is already committed to
--    the table when we count. Handles DELETE too — retracting a vote changes
--    the denominator.
CREATE OR REPLACE FUNCTION public.on_hazard_vote_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.recompute_hazard_status(COALESCE(NEW.hazard_id, OLD.hazard_id));
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS hazard_votes_recompute_status ON public.hazard_votes;
CREATE TRIGGER hazard_votes_recompute_status
  AFTER INSERT OR UPDATE OR DELETE ON public.hazard_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.on_hazard_vote_changed();

-- 4. Constrain status to the values the app actually understands, so a client
--    with UPDATE rights on its own row can't write a status the UI can't map.
ALTER TABLE public.hazards DROP CONSTRAINT IF EXISTS hazards_status_check;
ALTER TABLE public.hazards
  ADD CONSTRAINT hazards_status_check
  CHECK (status IN ('active', 'in_review', 'pending', 'resolved', 'fixed'));

-- 5. Backfill: apply the rule to any hazard that already met it before the
--    trigger existed.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT hazard_id FROM public.hazard_votes WHERE hazard_id IS NOT NULL LOOP
    PERFORM public.recompute_hazard_status(r.hazard_id);
  END LOOP;
END $$;
