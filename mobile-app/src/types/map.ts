/**
 * Shared map/hazard types — ported from the web dashboard's `types/map.ts`.
 *
 * These mirror the Supabase `hazards` table and the `choropleth_stats_admX`
 * views, so the mobile map consumes exactly the same data shapes as the web.
 */

/** GeoJSON geometry is passed through to Leaflet untyped (no runtime dep on @types/geojson). */
export type Geometry = unknown;

export interface StateChoroplethStat {
  id: string;
  state_name: string;
  iso_code: string;
  /** Full GeoJSON geometry object returned by ST_AsGeoJSON. */
  geojson: Geometry;
  total_reports: number;
  high_severity_count: number;
  medium_severity_count: number;
  low_severity_count: number;
  high_severity_ratio: number;
}

export type Severity = 'high' | 'medium' | 'low';

export interface Hazard {
  id: string;
  /** Primary (most-severe) type. See `defect_types` for the full set. */
  defect_type: string;
  /**
   * All AI-detected hazard types for this report (e.g. ["crack", "pothole"]).
   * Nullable for legacy rows; fall back to `[defect_type]` when absent.
   */
  defect_types: string[] | null;
  severity: Severity;
  status: string;
  latitude: number;
  longitude: number;
  /** Up to 5 Supabase Storage URLs for multi-image reports. */
  image_urls: string[] | null;
  state_id: number;
  created_at: string;
  /** User-submitted plain-text context for the hazard report. */
  description: string | null;
  /** UUID FK to auth.users — not for display, used for auth linkage. */
  reported_by: string | null;
  /** Human-readable reporter display name, populated at report creation. */
  reporter_name: string | null;
}

export type MapView = 'choropleth' | 'pins';
