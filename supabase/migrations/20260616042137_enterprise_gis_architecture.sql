-- ============================================================
-- JalanGuard — Enterprise GIS Architecture
-- PostGIS Setup, Unified Boundaries, Triggers, and Materialized Views
-- ============================================================

-- 1. Enable PostGIS (Crucial for spatial math)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==========================================
-- 🧹 LEGACY CLEANUP (Fixes the dependency error)
-- ==========================================
-- Drop the old view that relies on state_id
DROP MATERIALIZED VIEW IF EXISTS public.state_heatmap_stats CASCADE;
-- Drop the old states table (we are replacing it with administrative_boundaries)
DROP TABLE IF EXISTS public.malaysian_states CASCADE;

-- 2. Create the Unified Boundaries Table
CREATE TABLE IF NOT EXISTS public.administrative_boundaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    adm_level INT NOT NULL,            -- 0 for Country, 1 for State, 2 for District
    parent_id UUID REFERENCES public.administrative_boundaries(id), 
    geom GEOMETRY(MultiPolygon, 4326)  -- Standard WGS84 map projection
);

-- Index the geometry column so ST_Intersects runs in milliseconds
CREATE INDEX IF NOT EXISTS admin_boundaries_geom_idx
  ON public.administrative_boundaries
  USING GIST (geom);

-- 3. Upgrade the Hazards Table
ALTER TABLE public.hazards
  DROP COLUMN IF EXISTS state_id CASCADE,
  ADD COLUMN IF NOT EXISTS adm0_id UUID REFERENCES public.administrative_boundaries(id),
  ADD COLUMN IF NOT EXISTS adm1_id UUID REFERENCES public.administrative_boundaries(id),
  ADD COLUMN IF NOT EXISTS adm2_id UUID REFERENCES public.administrative_boundaries(id);

-- 4. The Write-Time Spatial Tagging Trigger
-- Intercepts new hazards and calculates Country, State, and District automatically
CREATE OR REPLACE FUNCTION public.auto_tag_hazard_boundaries()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run spatial math if a location point exists
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;

  IF NEW.location_point IS NOT NULL THEN
    NEW.adm0_id := NULL;
    NEW.adm1_id := NULL;
    NEW.adm2_id := NULL;

        -- Find and assign Country (adm_level 0)
        SELECT id INTO NEW.adm0_id 
        FROM public.administrative_boundaries 
        WHERE adm_level = 0 
          AND ST_Intersects(NEW.location_point, geom) 
        LIMIT 1;

        -- Find and assign State (adm_level 1)
        SELECT id INTO NEW.adm1_id 
        FROM public.administrative_boundaries 
        WHERE adm_level = 1 
          AND ST_Intersects(NEW.location_point, geom) 
        LIMIT 1;
        
        -- Find and assign District (adm_level 2)
        SELECT id INTO NEW.adm2_id 
        FROM public.administrative_boundaries 
        WHERE adm_level = 2 
          AND ST_Intersects(NEW.location_point, geom) 
        LIMIT 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Trigger to Hazards Table
DROP TRIGGER IF EXISTS trigger_auto_tag_boundaries ON public.hazards;
CREATE TRIGGER trigger_auto_tag_boundaries
BEFORE INSERT OR UPDATE OF location_point, latitude, longitude ON public.hazards
FOR EACH ROW EXECUTE FUNCTION public.auto_tag_hazard_boundaries();

-- 5. Create High-Performance Materialized Views for the Dashboard

-- View 0: Country (ADM0)
CREATE MATERIALIZED VIEW public.choropleth_stats_adm0 AS
SELECT 
    b.id AS boundary_id,
    b.name AS country_name,
  ST_AsGeoJSON(b.geom)::json AS geojson,
    COUNT(h.id) AS total_reports,
    SUM(CASE WHEN UPPER(h.severity::text) = 'HIGH' THEN 1 ELSE 0 END) AS severity_high_count,
    SUM(CASE WHEN UPPER(h.severity::text) = 'MEDIUM' THEN 1 ELSE 0 END) AS severity_medium_count,
    SUM(CASE WHEN UPPER(h.severity::text) = 'LOW' THEN 1 ELSE 0 END) AS severity_low_count
FROM public.administrative_boundaries b
LEFT JOIN public.hazards h ON b.id = h.adm0_id
WHERE b.adm_level = 0
GROUP BY b.id, b.name;

-- View 1: States (ADM1)
CREATE MATERIALIZED VIEW public.choropleth_stats_adm1 AS
SELECT 
    b.id AS boundary_id,
    b.name AS state_name,
  ST_AsGeoJSON(b.geom)::json AS geojson,
    COUNT(h.id) AS total_reports,
    SUM(CASE WHEN UPPER(h.severity::text) = 'HIGH' THEN 1 ELSE 0 END) AS severity_high_count,
    SUM(CASE WHEN UPPER(h.severity::text) = 'MEDIUM' THEN 1 ELSE 0 END) AS severity_medium_count,
    SUM(CASE WHEN UPPER(h.severity::text) = 'LOW' THEN 1 ELSE 0 END) AS severity_low_count
FROM public.administrative_boundaries b
LEFT JOIN public.hazards h ON b.id = h.adm1_id
WHERE b.adm_level = 1
GROUP BY b.id, b.name;

-- View 2: Districts (ADM2)
CREATE MATERIALIZED VIEW public.choropleth_stats_adm2 AS
SELECT 
    b.id AS boundary_id,
    b.name AS district_name,
  ST_AsGeoJSON(b.geom)::json AS geojson,
    COUNT(h.id) AS total_reports,
    SUM(CASE WHEN UPPER(h.severity::text) = 'HIGH' THEN 1 ELSE 0 END) AS severity_high_count,
    SUM(CASE WHEN UPPER(h.severity::text) = 'MEDIUM' THEN 1 ELSE 0 END) AS severity_medium_count,
    SUM(CASE WHEN UPPER(h.severity::text) = 'LOW' THEN 1 ELSE 0 END) AS severity_low_count
FROM public.administrative_boundaries b
LEFT JOIN public.hazards h ON b.id = h.adm2_id
WHERE b.adm_level = 2
GROUP BY b.id, b.name;

-- Index the materialized views for lightning-fast dashboard reads
CREATE UNIQUE INDEX IF NOT EXISTS idx_choropleth_adm0 ON public.choropleth_stats_adm0(boundary_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_choropleth_adm1 ON public.choropleth_stats_adm1(boundary_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_choropleth_adm2 ON public.choropleth_stats_adm2(boundary_id);