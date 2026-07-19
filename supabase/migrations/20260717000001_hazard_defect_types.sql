-- ============================================================
-- JalanGuard — multi-type hazard support
-- Adds `defect_types text[]` so a single report can carry more than one
-- AI-detected hazard type (e.g. a pothole AND a crack in the same photo).
--
-- The legacy single-value `defect_type` column is KEPT and stays populated
-- with the primary (most-severe) type so existing dashboard/API filters and
-- the Open Data API continue to work unchanged.
-- ============================================================

-- 1. New array column (nullable; existing readers ignore it).
ALTER TABLE public.hazards
  ADD COLUMN IF NOT EXISTS defect_types TEXT[];

-- 2. Backfill existing rows so every hazard has a consistent array form.
--    Wrap the current single type in a one-element array.
UPDATE public.hazards
SET defect_types = ARRAY[defect_type]
WHERE defect_types IS NULL
  AND defect_type IS NOT NULL;

COMMENT ON COLUMN public.hazards.defect_types IS
  'All AI-detected hazard types for this report (e.g. {crack,pothole}). '
  'defect_type holds the primary/most-severe type for backwards compatibility.';
