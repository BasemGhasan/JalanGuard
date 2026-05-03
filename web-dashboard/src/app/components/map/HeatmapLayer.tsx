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

// 3. Helpers (defined outside component to avoid recreating on every render)
/** Returns per-feature fill colour based on dominant severity tier. */
function styleFeature(feature: Feature<Geometry, HeatmapFeatureProps> | undefined): PathOptions {
  if (!feature?.properties) return defaultPolyStyle;
  return {
    ...defaultPolyStyle,
    fillColor: dominantColor(feature.properties),
  };
}

/** Binds mouse-enter/leave highlight handlers and a rich tooltip to each layer. */
function onEachFeature(
  feature: Feature<Geometry, HeatmapFeatureProps>,
  layer: Layer,
): void {
  const p = feature.properties;
  if (!p) return;

  const tooltipHtml = `
    <div class="map-tooltip">
      <strong>${p.state_name}</strong>
      <div class="tt-row"><span>Total</span><span>${p.total_reports}</span></div>
      <div class="tt-row"><span>High</span><span>${p.high_severity_count}</span></div>
      <div class="tt-row"><span>Medium</span><span>${p.medium_severity_count}</span></div>
      <div class="tt-row"><span>Low</span><span>${p.low_severity_count}</span></div>
    </div>`;

  layer.bindTooltip(tooltipHtml, {
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
 * (not on zoom/pan which would cause flicker on the Canvas renderer).
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
