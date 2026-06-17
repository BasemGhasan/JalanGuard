/**
 * Pure helper functions for the JalanGuard map dashboard.
 * No React — these are stateless utility functions only.
 */

import L from "leaflet";
import { COLORS, POLY_STYLE } from "../constants/theme";
import type { ChoroplethFeatureProps, Hazard, StateChoroplethStat } from "../types/map";

/**
 * Returns a fill colour for a state polygon based on which severity tier
 * has the most active reports (dominant-tier logic).
 *
 * Why dominant instead of ratio: a state with 1 high + 10 low reports is
 * NOT a "high severity" state; the dominant tier reflects ground reality.
 */
export function dominantColor(props: ChoroplethFeatureProps): string {
  const { total_reports, high_severity_count, medium_severity_count, low_severity_count } = props;

  if (total_reports === 0) return COLORS.sevNone;

  const max = Math.max(high_severity_count, medium_severity_count, low_severity_count);

  if (high_severity_count   === max && high_severity_count   > 0) return COLORS.sevHigh;
  if (medium_severity_count === max && medium_severity_count > 0) return COLORS.sevMedium;
  return COLORS.sevLow;
}

/**
 * Maps a hazard severity string to its corresponding brand colour.
 * Kept separate from dominantColor so pin colours can diverge from
 * polygon colours independently in the future.
 */
export function severityMarkerColor(severity: Hazard["severity"]): string {
  const SEVERITY_COLOR_MAP: Record<Hazard["severity"], string> = {
    high:   COLORS.sevHigh,
    medium: COLORS.sevMedium,
    low:    COLORS.sevLow,
  };
  return SEVERITY_COLOR_MAP[severity] ?? COLORS.sevLow;
}

/** Lazy-cached marker icons keyed by severity to avoid re-creating DivIcons on every render. */
const ICON_CACHE = new Map<string, L.DivIcon>();

/** Returns a Leaflet DivIcon coloured by severity, with a glowing halo effect. */
export function markerDivIcon(severity: Hazard["severity"]): L.DivIcon {
  if (ICON_CACHE.has(severity)) return ICON_CACHE.get(severity) as L.DivIcon;

  const color = severityMarkerColor(severity);
  const icon = L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};
      border:2.5px solid ${COLORS.white};
      box-shadow:0 0 8px ${color}99;
    "></div>`,
    iconSize:   [14, 14],
    iconAnchor: [7, 7],
  });

  ICON_CACHE.set(severity, icon);
  return icon;
}

/**
 * Converts an array of StateChoroplethStat rows into a typed GeoJSON FeatureCollection.
 * The geojson column (ST_AsGeoJSON result) is already a parsed JS object from
 * supabase-js and can be used directly as the geometry.
 */
export function buildGeoJSON(
  stats: StateChoroplethStat[],
): GeoJSON.FeatureCollection<GeoJSON.Geometry, ChoroplethFeatureProps> {
  return {
    type: "FeatureCollection",
    features: stats.map((s) => ({
      type:    "Feature",
      properties: {
        state_name:            s.state_name,
        iso_code:              s.iso_code,
        total_reports:         s.total_reports,
        high_severity_count:   s.high_severity_count,
        medium_severity_count: s.medium_severity_count,
        low_severity_count:    s.low_severity_count,
        high_severity_ratio:   s.high_severity_ratio,
      },
      geometry: s.geojson,
    })),
  };
}

/** Default polygon path options applied before any interaction. */
export const defaultPolyStyle: L.PathOptions = {
  fillOpacity: POLY_STYLE.fillOpacity,
  color:       COLORS.polyBorder,
  weight:      POLY_STYLE.weight,
};

/** Polygon path options applied on mouseover. */
export const hoverPolyStyle: L.PathOptions = {
  fillOpacity: POLY_STYLE.fillOpacityHover,
  color:       COLORS.polyBorderHover,
  weight:      POLY_STYLE.weightHover,
};
