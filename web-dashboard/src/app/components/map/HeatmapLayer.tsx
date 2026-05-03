// 1. Imports
import { memo, useMemo, useCallback } from "react";
import { GeoJSON } from "react-leaflet";
import type { Layer, LeafletMouseEvent, PathOptions } from "leaflet";
import type { Feature, Geometry } from "geojson";
import { buildGeoJSON, dominantColor, defaultPolyStyle, hoverPolyStyle } from "../../../utils/mapHelpers";
import type { HeatmapFeatureProps, StateHeatmapStat } from "../../../types/map";

// 2. Interfaces
interface HeatmapLayerProps {
  stats: StateHeatmapStat[];
}

// 3. Helpers — defined outside the component to prevent recreation on every render

/** Returns per-feature fill colour based on the dominant severity tier. */
function styleFeature(feature: Feature<Geometry, HeatmapFeatureProps> | undefined): PathOptions {
  if (!feature?.properties) return defaultPolyStyle;
  return { ...defaultPolyStyle, fillColor: dominantColor(feature.properties) };
}

/**
 * Builds the tooltip HTML string for a state polygon.
 * Colour-coded severity rows with glowing dot indicators mirror the
 * 3-tier severity palette from src/constants/theme.ts.
 * CSS classes are defined in src/styles/map.css.
 */
function buildTooltipHtml(p: HeatmapFeatureProps): string {
  return `
    <div class="map-tooltip">
      <div class="tt-header">${p.state_name}</div>
      <div class="tt-divider"></div>

      <div class="tt-total-row">
        <span class="tt-total-label">Total Reports</span>
        <span class="tt-total-value">${p.total_reports}</span>
      </div>

      <div class="tt-sev-row tt-high">
        <span class="tt-dot"></span>
        <span class="tt-sev-label">High</span>
        <span class="tt-count">${p.high_severity_count}</span>
      </div>

      <div class="tt-sev-row tt-medium">
        <span class="tt-dot"></span>
        <span class="tt-sev-label">Medium</span>
        <span class="tt-count">${p.medium_severity_count}</span>
      </div>

      <div class="tt-sev-row tt-low">
        <span class="tt-dot"></span>
        <span class="tt-sev-label">Low</span>
        <span class="tt-count">${p.low_severity_count}</span>
      </div>
    </div>`;
}

/**
 * Binds mouse-enter / mouse-leave highlight handlers and a rich tooltip
 * to each GeoJSON layer.
 */
function onEachFeature(
  feature: Feature<Geometry, HeatmapFeatureProps>,
  layer: Layer,
): void {
  const p = feature.properties;
  if (!p) return;

  layer.bindTooltip(buildTooltipHtml(p), {
    className: "leaflet-tooltip-jalanguard",
    direction: "top",
    sticky:    true,
  });

  layer.on("mouseover", (e: LeafletMouseEvent) => {
    (e.target as { setStyle: (s: PathOptions) => void }).setStyle(hoverPolyStyle);
  });

  layer.on("mouseout", (e: LeafletMouseEvent) => {
    (e.target as { setStyle: (s: PathOptions) => void }).setStyle({
      ...defaultPolyStyle,
      fillColor: dominantColor(p),
    });
  });
}

// 4. Component
/**
 * Choropleth GeoJSON layer — one polygon per Malaysian state, coloured by
 * the dominant severity tier from `state_heatmap_stats`.
 *
 * Memoised so it only re-renders when the stats array reference changes
 * (not on zoom/pan, which would cause flicker on the Canvas renderer).
 */
export const HeatmapLayer = memo(function HeatmapLayer({ stats }: HeatmapLayerProps) {
  const geoData = useMemo(() => buildGeoJSON(stats), [stats]);

  const style = useCallback(
    (f: Feature<Geometry, HeatmapFeatureProps> | undefined) => styleFeature(f),
    [],
  );

  if (!geoData.features.length) return null;

  return (
    <GeoJSON
      key={stats.length}
      data={geoData}
      style={style as (feature: Feature | undefined) => PathOptions}
      onEachFeature={onEachFeature as (feature: Feature, layer: Layer) => void}
    />
  );
});
