import { COLORS, SPACING, FONT_SIZES } from "../../../constants/theme";
import type { ElementType, ReactNode } from "react";

interface ProfileFieldProps {
  readonly icon: ElementType;
  readonly label: string;
  readonly value: string;
  readonly badge?: ReactNode;
}

/**
 * Read-only profile row: icon, label, value, optional badge.
 *
 * Deliberately has no editing affordance. Profile details (name and email) are
 * edited exclusively in the mobile app — a single editing surface keeps one set
 * of validation rules and removes any chance of the two clients disagreeing
 * about what a valid name or address is. The dashboard only displays.
 */
export function ProfileField({ icon: Icon, label, value, badge }: ProfileFieldProps) {
  return (
    <div style={styles.row}>
      <div style={styles.iconWrap}>
        <Icon size={20} color={COLORS.secondary} />
      </div>

      <div style={styles.textWrap}>
        <div style={styles.labelRow}>
          <span style={styles.label}>{label}</span>
          {badge}
        </div>
        <span style={styles.value}>{value || "Not set"}</span>
      </div>
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    padding: `${SPACING.sm}px 0`,
    borderBottom: `1px solid ${COLORS.borderFaint}`,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: COLORS.glintFaint,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  textWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
    marginBottom: 4,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: 500,
  },
} as const;
