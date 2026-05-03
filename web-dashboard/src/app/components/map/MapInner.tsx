// 1. Imports
import { memo } from "react";
import { HeatmapLayer } from "./HeatmapLayer";
import { PinsLayer }    from "./PinsLayer";
import type { Hazard, MapView, StateHeatmapStat } from "../../../types/map";

// 2. Interfaces
interface MapInnerProps {
  mapView:        MapView;
  stats:          StateHeatmapStat[];
  hazards:        Hazard[];
  onSelectHazard: (hazard: Hazard) => void;
}

// 3. Component
/**
 * Renders the active layer (heatmap or pins) plus map controls.
 * Separated from MapPage so that react-leaflet hooks (useMap etc.) are
 * only called inside the MapContainer context.
 *
 * Memoised — only re-renders when its props change.
 */
export const MapInner = memo(function MapInner({
  mapView,
  stats,
  hazards,
  onSelectHazard,
}: MapInnerProps) {
  return (
    <>
      {mapView === "heatmap" && <HeatmapLayer stats={stats} />}
      {mapView === "pins"    && <PinsLayer hazards={hazards} onSelectHazard={onSelectHazard} />}
    </>
  );
});
