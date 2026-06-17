/**
 * Shared TypeScript interfaces for the JalanGuard map dashboard.
 * No external runtime dependencies — pure type definitions.
 */

export interface StateChoroplethStat {
  id: string;
  state_name: string;
  iso_code: string;
  /** Full GeoJSON geometry object returned by ST_AsGeoJSON */
  geojson: GeoJSON.Geometry;
  total_reports: number;
  high_severity_count: number;
  medium_severity_count: number;
  low_severity_count: number;
  high_severity_ratio: number;
}

export interface Hazard {
  id: string;
  defect_type: string;
  severity: "high" | "medium" | "low";
  status: string;
  latitude: number;
  longitude: number;
  /** Legacy single-image URL — kept for backwards compatibility. */
  image_url: string | null;
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

export type MapView = "choropleth" | "pins";

/**
 * Hazard row with the joined `malaysian_location` relation.
 * Returned by: supabase.from('hazards').select('*, malaysian_location(location_name)')
 */
export interface HazardWithState extends Hazard {
  malaysian_location: { location_name: string } | null;
}

/** Properties embedded in each GeoJSON feature for the choropleth layer. */
export interface ChoroplethFeatureProps {
  state_name: string;
  iso_code: string;
  total_reports: number;
  high_severity_count: number;
  medium_severity_count: number;
  low_severity_count: number;
  high_severity_ratio: number;
}
