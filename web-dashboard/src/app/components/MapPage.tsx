// 1. Imports — External
import { useState, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Globe, Layers, MapPin, MapPinned, Map } from "lucide-react";

// 1. Imports — Local constants / hooks / types
import { MAP_CONFIG, COLORS } from "../../constants/theme";
import { useMapData } from "../../hooks/useMapData";
import type { Hazard, MapView } from "../../types/map";

// 1. Imports — Child components
import { MapErrorBoundary } from "./map/MapErrorBoundary";
import { MapFallback } from "./map/MapFallback";
import { LoadingOverlay } from "./map/LoadingOverlay";
import { MapInner } from "./map/MapInner";
import { ViewToggle, type ToggleOption } from "./map/ViewToggle";
import { ChoroplethLegend } from "./map/ChoroplethLegend";
import { HazardCard } from "./map/HazardCard";

const MAP_VIEW_OPTIONS: ToggleOption<MapView>[] = [
  { value: "choropleth", label: "Choropleth", Icon: Layers },
  { value: "pins", label: "Pins", Icon: MapPinned },
];

const ADM_LEVEL_OPTIONS: ToggleOption<0 | 1 | 2>[] = [
  { value: 0, label: "Country", Icon: Globe },
  { value: 1, label: "States", Icon: Map },
  { value: 2, label: "Districts", Icon: MapPin },
];

// 2. Component
/**
 * Top-level map page — thin orchestrator only.
 * All data fetching lives in useMapData; all rendering lives in sub-components.
 * This component owns only UI state and error/retry coordination.
 */
export function MapPage() {
  const [admLevel, setAdmLevel] = useState<0 | 1 | 2>(1);
  const { stats, hazards, loading, error, retry } = useMapData(admLevel);

  const [mapView, setMapView] = useState<MapView>("choropleth");
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  /** Bumped to force the ErrorBoundary to remount after a retry. */
  const [boundaryKey, setBoundaryKey] = useState(0);

  const handleRetry = useCallback(() => {
    setBoundaryKey((k) => k + 1);
    retry();
  }, [retry]);

  const handleViewChange = useCallback((view: MapView) => {
    setMapView(view);
    setSelectedHazard(null);
  }, []);

  const handleSelectHazard = useCallback((hazard: Hazard) => {
    setSelectedHazard(hazard);
  }, []);

  const handleCloseHazard = useCallback(() => {
    setSelectedHazard(null);
  }, []);

  // Hard data-fetch failure — render blueprint fallback before mounting the map
  if (!loading && error) {
    return <MapFallback error={error} onRetry={handleRetry} />;
  }

  return (
    <MapErrorBoundary key={boundaryKey} onReset={handleRetry}>
      <div style={styles.root}>
        {loading && <LoadingOverlay />}

        <MapContainer
          center={MAP_CONFIG.center}
          zoom={MAP_CONFIG.zoom}
          minZoom={MAP_CONFIG.minZoom}
          maxBounds={MAP_CONFIG.bounds}
          maxBoundsViscosity={MAP_CONFIG.boundsViscosity}
          preferCanvas
          zoomControl={false}
          attributionControl={false}
          style={styles.map}
        >
          <TileLayer
            url={MAP_CONFIG.tileUrl}
            attribution={MAP_CONFIG.tileAttribution}
          />

          {/* MapInner must be inside MapContainer so react-leaflet hooks resolve */}
          {!loading && (
            <MapInner
              mapView={mapView}
              stats={stats}
              hazards={hazards}
              onSelectHazard={handleSelectHazard}
            />
          )}
        </MapContainer>

        <ViewToggle value={mapView} onChange={handleViewChange} options={MAP_VIEW_OPTIONS} position="right" />
        <ViewToggle value={admLevel} onChange={setAdmLevel} options={ADM_LEVEL_OPTIONS} position="left" />

        {mapView === "choropleth" && !loading && stats.length > 0 && (
          <ChoroplethLegend />
        )}

        {mapView === "pins" && selectedHazard !== null && (
          <HazardCard hazard={selectedHazard} onClose={handleCloseHazard} />
        )}
      </div>
    </MapErrorBoundary>
  );
}

// 3. Styles
const styles = {
  root: {
    position: "relative" as const,
    width: "100%",
    height: MAP_CONFIG.containerHeight,
    background: COLORS.background,
  },
  map: {
    width: "100%",
    height: "100%",
  },
} as const;
