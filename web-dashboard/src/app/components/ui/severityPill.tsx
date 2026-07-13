// 1. Imports — Local constants
import { SEVERITY_BADGE, SPACING } from "../../../constants/theme";

// 2. Interfaces
interface SeverityPillProps {
  severity: "high" | "medium" | "low";
}

// 3. Component
/**
 * Colour-coded severity pill (HIGH / MEDIUM / LOW).
 * Single source of truth for the badge previously duplicated between
 * HazardTable and HazardCard. Colours come only from SEVERITY_BADGE.
 */
export function SeverityPill({ severity }: Readonly<SeverityPillProps>) {
  const badge = SEVERITY_BADGE[severity] ?? SEVERITY_BADGE.low;

  return (
    <span
      style={{
        ...styles.pill,
        background: badge.bg,
        color:      badge.text,
        border:     `1px solid ${badge.border}`,
      }}
    >
      {severity}
    </span>
  );
}

// 4. Styles
const styles = {
  pill: {
    display:       "inline-block",
    padding:       `3px ${SPACING.sm + 2}px`,
    borderRadius:  20,
    fontSize:      11,
    fontWeight:    700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    whiteSpace:    "nowrap" as const,
  },
} as const;
