-- ============================================================
-- JalanGuard — Mobile submission + community voting
--   * Storage bucket for citizen-uploaded hazard images
--   * Row-Level Security on hazards (public read, authed insert)
--   * hazard_votes table (one vote per user per hazard)
-- Safe for the web dashboard: it only READS hazards, so a
-- permissive SELECT policy keeps every existing query working.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Storage bucket for hazard images
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('hazard-images', 'hazard-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read: hazard photos are shown on public maps/detail screens.
DROP POLICY IF EXISTS "hazard-images public read" ON storage.objects;
CREATE POLICY "hazard-images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hazard-images');

-- Authenticated upload, but only into a folder named after the user's own id
-- (path convention: "<uid>/<file>"), so users can't write over each other.
DROP POLICY IF EXISTS "hazard-images owner upload" ON storage.objects;
CREATE POLICY "hazard-images owner upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'hazard-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow owners to replace/remove their own uploads (e.g. failed submit retry).
DROP POLICY IF EXISTS "hazard-images owner modify" ON storage.objects;
CREATE POLICY "hazard-images owner modify"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'hazard-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "hazard-images owner delete" ON storage.objects;
CREATE POLICY "hazard-images owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'hazard-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- 2. Row-Level Security on hazards
--    Reads stay open (public map + Open Data API rely on this);
--    writes are locked to the authenticated reporter.
-- ------------------------------------------------------------
ALTER TABLE public.hazards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hazards public read" ON public.hazards;
CREATE POLICY "hazards public read"
  ON public.hazards FOR SELECT
  USING (true);

-- A citizen may only create a hazard attributed to themselves.
DROP POLICY IF EXISTS "hazards owner insert" ON public.hazards;
CREATE POLICY "hazards owner insert"
  ON public.hazards FOR INSERT TO authenticated
  WITH CHECK (reported_by = auth.uid());

-- A reporter may edit/withdraw their own report (status changes, corrections).
DROP POLICY IF EXISTS "hazards owner update" ON public.hazards;
CREATE POLICY "hazards owner update"
  ON public.hazards FOR UPDATE TO authenticated
  USING (reported_by = auth.uid())
  WITH CHECK (reported_by = auth.uid());

-- ------------------------------------------------------------
-- 3. Community voting
--    A hazard_votes table already existed (legacy upvote/downvote model,
--    empty, unreferenced). We adapt it in place — non-destructively — to the
--    "is it fixed?" model the mobile app needs: repoint the CHECK constraint,
--    then lock writes down with RLS. Column stays `vote_type`; user_id already
--    FKs profiles(id), which mirrors auth.users(id).
-- ------------------------------------------------------------
ALTER TABLE public.hazard_votes
  DROP CONSTRAINT IF EXISTS hazard_votes_vote_type_check;
ALTER TABLE public.hazard_votes
  ADD CONSTRAINT hazard_votes_vote_type_check CHECK (vote_type IN ('fixed', 'broken'));

-- user_id → profiles(id). On the original project this FK already existed on
-- the legacy table, so it was never written down; it is declared here (the
-- first migration that runs after profiles exists) so a fresh install ends up
-- with the same shape. Deleting an account removes that account's votes.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hazard_votes_user_id_fkey'
  ) THEN
    ALTER TABLE public.hazard_votes
      ADD CONSTRAINT hazard_votes_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.hazard_votes ENABLE ROW LEVEL SECURITY;

-- Any signed-in user can read votes (needed for tallies + "my vote").
DROP POLICY IF EXISTS "hazard_votes read" ON public.hazard_votes;
CREATE POLICY "hazard_votes read"
  ON public.hazard_votes FOR SELECT TO authenticated
  USING (true);

-- Users manage only their own vote row.
DROP POLICY IF EXISTS "hazard_votes owner insert" ON public.hazard_votes;
CREATE POLICY "hazard_votes owner insert"
  ON public.hazard_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "hazard_votes owner update" ON public.hazard_votes;
CREATE POLICY "hazard_votes owner update"
  ON public.hazard_votes FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "hazard_votes owner delete" ON public.hazard_votes;
CREATE POLICY "hazard_votes owner delete"
  ON public.hazard_votes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Public vote tallies per hazard. SECURITY DEFINER so anon map/detail views can
-- show counts without exposing individual rows.
CREATE OR REPLACE FUNCTION public.hazard_vote_summary(p_hazard_id UUID)
RETURNS TABLE (fixed_count INT, broken_count INT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(SUM(CASE WHEN v.vote_type = 'fixed'  THEN 1 ELSE 0 END), 0)::INT,
    COALESCE(SUM(CASE WHEN v.vote_type = 'broken' THEN 1 ELSE 0 END), 0)::INT
  FROM public.hazard_votes AS v
  WHERE v.hazard_id = p_hazard_id;
$$;

GRANT EXECUTE ON FUNCTION public.hazard_vote_summary(UUID) TO anon, authenticated;
