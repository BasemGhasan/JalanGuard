/**
 * Shared TypeScript interfaces for the JalanGuard map dashboard.
 * No external runtime dependencies — pure type definitions.
 */

export interface StateHeatmapStat {
  id: number;
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
  image_url: string;
  state_id: number;
  created_at: string;
}

export type MapView = "heatmap" | "pins";

/** Properties embedded in each GeoJSON feature for the heatmap layer. */
export interface HeatmapFeatureProps {
  state_name: string;
  iso_code: string;
  total_reports: number;
  high_severity_count: number;
  medium_severity_count: number;
  low_severity_count: number;
  high_severity_ratio: number;
}
