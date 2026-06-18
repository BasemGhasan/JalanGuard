// 1. Imports
import { memo, useCallback } from "react";
import { Marker, Popup } from "react-leaflet";
import { markerDivIcon, severityMarkerColor } from "../../../utils/mapHelpers";
import { COLORS, SEVERITY_BADGE }             from "../../../constants/theme";
import type { Hazard }                        from "../../../types/map";

// 2. Interfaces
interface PinsLayerProps {
  hazards:        Hazard[];
  onSelectHazard: (hazard: Hazard) => void;
}

// 3. Component
export const PinsLayer = memo(function PinsLayer({ hazards, onSelectHazard }: PinsLayerProps) {
  const makeClickHandler = useCallback(
    (hazard: Hazard) => (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation(); 
      onSelectHazard(hazard);
    },
    [onSelectHazard],
  );

  return (
    <>
      {hazards.map((hazard) => {
        const badge       = SEVERITY_BADGE[hazard.severity] ?? SEVERITY_BADGE.low;
        const severityClr = severityMarkerColor(hazard.severity);

        return (
          <Marker
            key={hazard.id}
            position={[hazard.latitude, hazard.longitude]}
            icon={markerDivIcon(hazard.severity)}
          >
            <Popup className="jalanguard-popup">
              <div 
                className="pin-popup" 
                onClick={makeClickHandler(hazard)}
                style={{ cursor: "pointer" }}
              >
                {/* Severity badge */}
                <div className="pin-popup-header">
                  <span
                    className="pin-popup-badge"
                    style={{
                      background: badge.bg,
                      color:      badge.text,
                      border:     `1px solid ${badge.border}`,
                    }}
                  >
                    {hazard.severity.toUpperCase()}
                  </span>
                </div>

                {/* Defect type headline */}
                <p className="pin-popup-type">
                  {hazard.defect_type.replace(/_/g, " ")}
                </p>

                <div className="pin-popup-divider" />

                {/* Meta rows */}
                <div className="pin-popup-meta">
                  <div className="pin-popup-row">
                    <span className="pin-popup-label">STATUS</span>
                    <span className="pin-popup-value">
                      <span
                        className="pin-popup-dot"
                        style={{ background: severityClr, boxShadow: `0 0 5px ${severityClr}` }}
                      />
                      {hazard.status}
                    </span>
                  </div>

                  <div className="pin-popup-row">
                    <span className="pin-popup-label">LAT</span>
                    <span className="pin-popup-value pin-popup-mono">
                      {hazard.latitude.toFixed(4)}
                    </span>
                  </div>

                  <div className="pin-popup-row">
                    <span className="pin-popup-label">LNG</span>
                    <span className="pin-popup-value pin-popup-mono">
                      {hazard.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Hint */}
                <p className="pin-popup-hint" style={{ color: COLORS.textMuted }}>
                  Click here for full details
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
});