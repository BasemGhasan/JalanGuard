-- ============================================================
-- JalanGuard — Hazards schema migration
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add user-submitted plain-text description
ALTER TABLE hazards
  ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Add array of up to 5 Supabase Storage image URLs
--    (image_url is kept for backwards compatibility)
ALTER TABLE hazards
  ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- 3. Add human-readable reporter display name
--    (reported_by UUID FK to auth.users is kept for auth linkage)
ALTER TABLE hazards
  ADD COLUMN IF NOT EXISTS reporter_name TEXT;

-- ============================================================
-- Seed dummy data for dashboard testing
-- ============================================================

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM hazards
)
UPDATE hazards h SET
  description = CASE (numbered.rn % 6)
    WHEN 1 THEN 'Large pothole near the traffic light junction. Road surface has completely collapsed, roughly 40 cm wide and 15 cm deep. Vehicles swerving dangerously during peak hours — immediate repair needed.'
    WHEN 2 THEN 'Severe road erosion along the highway shoulder after heavy rainfall. A large section of tarmac has washed away exposing loose gravel. Risk of vehicles losing control at this stretch.'
    WHEN 3 THEN 'Crack running diagonally across both lanes for approximately 3 metres. Water seeping through indicates subbase failure. Widening observed over the past two weeks.'
    WHEN 4 THEN 'Multiple potholes clustered in a 10-metre stretch. Road surface looks overdue for maintenance. Particular hazard for motorcycles at night as the area has poor lighting.'
    WHEN 5 THEN 'Deep rut along the bus stop kerb — bus tyres have slowly pressed the tarmac down creating a depression that floods after rain. Passengers stepping off buses risk ankle injuries.'
    ELSE 'Broken asphalt at the intersection with sharp exposed edges. Tyre damage risk is high. Observed several motorcycles slowing sharply to avoid this spot during morning rush.'
  END,
  reporter_name = CASE (numbered.rn % 7)
    WHEN 1 THEN 'Ahmad Faizal'
    WHEN 2 THEN 'Nur Aisyah Binti Rahman'
    WHEN 3 THEN 'Tan Wei Liang'
    WHEN 4 THEN 'Muhammad Haziq'
    WHEN 5 THEN 'Rajan s/o Pillai'
    WHEN 6 THEN 'Faridah Hanum'
    ELSE 'Siti Norbaya'
  END,
  image_urls = CASE (numbered.rn % 4)
    WHEN 1 THEN ARRAY[
      'https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=700',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700',
      'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=700'
    ]
    WHEN 2 THEN ARRAY[
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700',
      'https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=700'
    ]
    WHEN 3 THEN ARRAY[
      'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=700',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700',
      'https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=700',
      'https://images.unsplash.com/photo-1579445133558-adc5a7d7e073?w=700'
    ]
    ELSE ARRAY[
      'https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=700'
    ]
  END
FROM numbered
WHERE h.id = numbered.id;
