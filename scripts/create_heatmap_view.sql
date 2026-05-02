-- ============================================================
-- JalanGuard: Materialized View — state_heatmap_stats
-- Run this once in Supabase SQL Editor
-- ============================================================

-- Drop and recreate cleanly
DROP MATERIALIZED VIEW IF EXISTS state_heatmap_stats;

CREATE MATERIALIZED VIEW state_heatmap_stats AS
SELECT
    s.id,
    s.state_name,
    s.iso_code,

    -- Geometry as GeoJSON — React Leaflet reads this natively
    ST_AsGeoJSON(s.geom)::jsonb                                         AS geojson,

    -- Aggregate hazard counts (active only)
    COUNT(h.id)                                                          AS total_reports,
    COUNT(h.id) FILTER (WHERE h.severity = 'high')                      AS high_severity_count,
    COUNT(h.id) FILTER (WHERE h.severity = 'medium')                    AS medium_severity_count,
    COUNT(h.id) FILTER (WHERE h.severity = 'low')                       AS low_severity_count,

    -- Ratio: percentage of active reports that are high severity
    CASE
        WHEN COUNT(h.id) > 0 THEN
            ROUND(
                (COUNT(h.id) FILTER (WHERE h.severity = 'high')::numeric
                 / COUNT(h.id)) * 100,
                1
            )
        ELSE 0
    END                                                                  AS high_severity_ratio

FROM  malaysian_states s
LEFT  JOIN hazards h
      ON  h.state_id = s.id
      AND h.status   = 'active'

GROUP BY s.id, s.state_name, s.iso_code, s.geom;

-- Index on id for fast single-state lookups
CREATE UNIQUE INDEX ON state_heatmap_stats (id);

-- Verify: preview the first few rows
SELECT
    state_name,
    total_reports,
    high_severity_count,
    medium_severity_count,
    low_severity_count,
    high_severity_ratio
FROM state_heatmap_stats
ORDER BY total_reports DESC;
