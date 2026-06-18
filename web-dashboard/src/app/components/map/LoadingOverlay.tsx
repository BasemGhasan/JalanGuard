// 1. Imports
import { COLORS } from "../../../constants/theme";

// 2. Component
/** Transparent pointer-events overlay shown while map data is fetching. */
export function LoadingOverlay() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.pill}>
        <div style={styles.spinner} className="animate-spin" />
        <span style={styles.label}>Loading map data…</span>
      </div>
    </div>
  );
}

// 3. Styles
const styles = {
  wrapper: {
    position:       "absolute" as const,
    inset:          0,
    zIndex:         2000,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    pointerEvents:  "none" as const,
  },
  pill: {
    display:        "flex",
    alignItems:     "center",
    gap:            12,
    padding:        "10px 20px",
    borderRadius:   12,
    background:     COLORS.overlayDark,
    backdropFilter: "blur(8px)",
    border:         `1px solid ${COLORS.borderSoft}`,
  },
  spinner: {
    width:       16,
    height:      16,
    borderRadius: "50%",
    border:      `2px solid ${COLORS.secondary}`,
    borderTopColor: "transparent",
    animation:   "spin 0.8s linear infinite",
  },
  label: {
    fontSize: 14,
    color:    COLORS.textMuted,
  },
} as const;