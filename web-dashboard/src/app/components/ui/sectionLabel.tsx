// 1. Imports — External
import type { ComponentType } from "react";

// 1. Imports — Local constants
import { COLORS, SPACING, FONT_SIZES } from "../../../constants/theme";

// 2. Interfaces
interface SectionLabelProps {
  icon:  ComponentType<{ size?: number; color?: string }>;
  label: string;
}

// 3. Component
/**
 * Amber-icon uppercase section heading used at the top of cards
 * (e.g. "PROFILE", "YOUR API KEY"). Previously duplicated in KeyPage
 * and ProfileSection.
 */
export function SectionLabel({ icon: Icon, label }: Readonly<SectionLabelProps>) {
  return (
    <div style={styles.wrap}>
      <Icon size={14} color={COLORS.secondary} />
      <span style={styles.text}>{label}</span>
    </div>
  );
}

// 4. Styles
const styles = {
  wrap: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.sm,
    marginBottom: SPACING.md,
  },
  text: {
    color:         COLORS.textMuted,
    fontSize:      FONT_SIZES.sm,
    fontWeight:    600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
} as const;
