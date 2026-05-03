// 1. Imports
import { memo, useCallback } from "react";
import { Marker, Popup } from "react-leaflet";
import { markerDivIcon, severityMarkerColor } from "../../../utils/mapHelpers";
import { COLORS, SEVERITY_BADGE } from "../../../constants/theme";
import type { Hazard } from "../../../types/map";

// 2. Interfaces
interface PinsLayerProps {
  hazards:        Hazard[];
  onSelectHazard: (hazard: Hazard) => void;
}

// 3. Component
/**
 * Renders one DivIcon marker per active hazard.
 * Clicking a marker calls `onSelectHazard` to show the HazardCard overlay;
 * a compact Leaflet Popup also appears for quick context without opening the card.
 *
 * Memoised — only re-renders when the hazards array reference changes.
 */
export const PinsLayer = memo(function PinsLayer({ hazards, onSelectHazard }: PinsLayerProps) {
  const makeClickHandler = useCallback(
    (hazard: Hazard) => () => onSelectHazard(hazard),
    [onSelectHazard],
  );

  return (
    <>
      {hazards.map((hazard) => {
        const badge = SEVERITY_BADGE[hazard.severity] ?? SEVERITY_BADGE.low;

        return (
          <Marker
            key={hazard.id}
            position={[hazard.latitude, hazard.longitude]}
            icon={markerDivIcon(hazard.severity)}
            eventHandlers={{ click: makeClickHandler(hazard) }}
          >
            <Popup className="jalanguard-popup">
              <div style={popupStyles.root}>
                <span
                  style={{
                    ...popupStyles.badge,
                    background: badge.bg,
                    color:      badge.text,
                    border:     `1px solid ${badge.border}`,
                  }}
                >
                  {hazard.severity.toUpperCase()}
                </span>
                <p style={popupStyles.type}>{hazard.defect_type}</p>
                <p style={popupStyles.coords}>
                  {hazard.latitude.toFixed(4)}, {hazard.longitude.toFixed(4)}
                </p>
                <div
                  style={{
                    ...popupStyles.dot,
                    background: severityMarkerColor(hazard.severity),
                  }}
                />
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
});

// 4. Styles
const popupStyles = {
  root: {
    minWidth:   120,
    padding:    4,
    background: COLORS.surface,
    color:      COLORS.textPrimary,
  },
  badge: {
    display:      "inline-block",
    padding:      "2px 8px",
    borderRadius: 20,
    fontSize:     10,
    fontWeight:   700,
    letterSpacing: "0.06em",
    marginBottom: 6,
  },
  type: {
    fontSize:   13,
    fontWeight: 600,
    margin:     "0 0 4px",
    color:      COLORS.textPrimary,
  },
  coords: {
    fontSize: 11,
    color:    COLORS.textMuted,
    margin:   0,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: "50%",
    marginTop:    6,
  },
} as const;
