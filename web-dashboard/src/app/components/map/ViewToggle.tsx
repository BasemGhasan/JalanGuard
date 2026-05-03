// 1. Imports
import { useCallback } from "react";
import { Layers, MapPin } from "lucide-react";
import { COLORS } from "../../../constants/theme";
import type { MapView } from "../../../types/map";

// 2. Interfaces
interface ViewToggleProps {
  view:     MapView;
  onChange: (view: MapView) => void;
}

// 3. Styles
const styles = {
  wrapper: {
    position:  "absolute" as const,
    top:       16,
    right:     16,
    zIndex:    1000,
    display:   "flex",
    borderRadius: 12,
    overflow:  "hidden",
    background: COLORS.surface,
    border:    `1px solid ${COLORS.borderSoft}`,
    boxShadow: "0 8px 32px rgba(0,0,0,0.50)",
  },
  btnBase: {
    display:    "flex",
    alignItems: "center",
    gap:        8,
    padding:    "10px 20px",
    fontSize:   14,
    fontWeight: 500,
    border:     "none",
    cursor:     "pointer",
    transition: "all 0.15s ease",
  },
} as const;

const TABS: { view: MapView; label: string; Icon: typeof Layers }[] = [
  { view: "heatmap", label: "Heatmap", Icon: Layers  },
  { view: "pins",    label: "Pins",    Icon: MapPin  },
];

// 4. Component
/** Toggle control that switches between Heatmap and Pins views. */
export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const handleClick = useCallback(
    (v: MapView) => () => onChange(v),
    [onChange],
  );

  return (
    <div style={styles.wrapper}>
      {TABS.map(({ view: tabView, label, Icon }) => {
        const isActive = view === tabView;
        return (
          <button
            key={tabView}
            onClick={handleClick(tabView)}
            style={{
              ...styles.btnBase,
              background: isActive ? COLORS.secondary : "transparent",
              color:      isActive ? COLORS.white     : COLORS.textMuted,
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
