// 1. Imports
import { COLORS } from "../../../constants/theme";

// 2. Types
interface LegendTier {
  color: string;
  label: string;
}

// 3. Constants — exactly mirrors the 4-tier dominantColor() logic in mapHelpers
const LEGEND_TIERS: LegendTier[] = [
  { color: COLORS.sevHigh,   label: "High severity dominant"   },
  { color: COLORS.sevMedium, label: "Medium severity dominant" },
  { color: COLORS.sevLow,    label: "Low severity dominant"    },
  { color: COLORS.sevNone,   label: "No active reports"         },
];

// 4. Styles
const styles = {
  wrapper: {
    position:       "absolute" as const,
    bottom:         24,
    right:          16,
    zIndex:         1000,
    borderRadius:   12,
    padding:        16,
    minWidth:       200,
    background:     COLORS.overlayDark,
    backdropFilter: "blur(8px)",
    border:         `1px solid ${COLORS.borderSoft}`,
  },
  heading: {
    fontSize:      11,
    fontWeight:    600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color:         COLORS.textMuted,
    marginBottom:  12,
  },
  row: {
    display:    "flex",
    alignItems: "center",
    gap:        8,
    marginBottom: 8,
  },
  swatch: {
    width:        12,
    height:       12,
    borderRadius: 3,
    flexShrink:   0,
  },
  rowLabel: {
    fontSize: 12,
    color:    COLORS.textMuted,
  },
} as const;

// 5. Component
/** Legend panel synced exactly to the dominantColor() severity tiers. */
export function HeatmapLegend() {
  return (
    <div style={styles.wrapper}>
      <p style={styles.heading}>Dominant Severity</p>
      {LEGEND_TIERS.map(({ color, label }) => (
        <div key={label} style={styles.row}>
          <div style={{ ...styles.swatch, background: color }} />
          <span style={styles.rowLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}
