// 1. Imports — External
import { useState, useCallback } from "react";
import { Lock }                  from "lucide-react";

// 1. Imports — Constants
import { COLORS, FONT_SIZES, SPACING } from "../../../constants/theme";

// 2. Interfaces
interface ProfileFieldProps {
  /** Left-side label text (e.g. "Full Name"). */
  label:     string;
  /** Current displayed / input value. */
  value:     string;
  /** Leading icon rendered to the left of the value. */
  icon:      React.ComponentType<{ size?: number; color?: string }>;
  /**
   * Whether this field can ever be edited.
   * Defaults to true. When false, a lock icon is shown and no input is rendered.
   */
  editable?: boolean;
  /**
   * Whether the parent is currently in edit mode.
   * Only has an effect when `editable` is also true.
   */
  editing?:  boolean;
  /** Input change handler — required when editable & editing. */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Optional badge node rendered to the right of the value (e.g. "Verified"). */
  badge?:    React.ReactNode;
}

// 3. Component
/**
 * Reusable labeled row for profile data.
 *
 * Renders as a static text row by default. When both `editable` and `editing`
 * are true the value becomes an amber-focused input field.
 *
 * Used in ProfileSection; could be reused in any settings-style form.
 */
export function ProfileField({
  label,
  value,
  icon: Icon,
  editable = true,
  editing  = false,
  onChange,
  badge,
}: ProfileFieldProps) {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => setFocused(true),  []);
  const handleBlur  = useCallback(() => setFocused(false), []);

  const isInput = editable && editing;

  return (
    <div style={styles.row}>
      {/* Label column */}
      <div style={styles.labelCol}>
        <Icon size={13} color={COLORS.textMuted} />
        <span style={styles.label}>{label}</span>
      </div>

      {/* Value column */}
      <div style={styles.valueCol}>
        {isInput ? (
          <div
            style={{
              ...styles.inputWrap,
              borderColor: focused
                ? `${COLORS.secondary}99`
                : COLORS.borderSoft,
            }}
          >
            <input
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={styles.input}
            />
          </div>
        ) : (
          <span style={styles.staticValue}>{value || "—"}</span>
        )}

        {/* Lock icon for permanently non-editable fields */}
        {!editable && (
          <Lock size={12} color={COLORS.textMuted} style={{ opacity: 0.5 }} />
        )}

        {badge}
      </div>
    </div>
  );
}

// 4. Styles
const styles = {
  row: {
    display:     "flex",
    alignItems:  "center",
    gap:         SPACING.md,
    padding:     `${SPACING.sm + 2}px 0`,
    borderBottom: `1px solid ${COLORS.borderFaint}`,
  },
  labelCol: {
    display:    "flex",
    alignItems: "center",
    gap:        SPACING.xs + 2,
    minWidth:   110,
    flexShrink: 0,
  },
  label: {
    color:      COLORS.textMuted,
    fontSize:   FONT_SIZES.sm + 1,
    fontWeight: 600,
  },
  valueCol: {
    flex:        1,
    display:     "flex",
    alignItems:  "center",
    gap:         SPACING.sm,
    minWidth:    0,
  },
  staticValue: {
    color:        COLORS.textPrimary,
    fontSize:     FONT_SIZES.sm + 2,
    overflow:     "hidden",
    textOverflow: "ellipsis",
    whiteSpace:   "nowrap" as const,
    flex:         1,
  },
  inputWrap: {
    flex:         1,
    display:      "flex",
    alignItems:   "center",
    background:   COLORS.primary,
    borderRadius: 8,
    border:       `1px solid ${COLORS.borderSoft}`,
    padding:      `${SPACING.xs + 2}px ${SPACING.sm + 4}px`,
    transition:   "border-color 0.15s ease",
  },
  input: {
    flex:       1,
    background: "transparent",
    border:     "none",
    outline:    "none",
    color:      COLORS.textPrimary,
    fontSize:   FONT_SIZES.sm + 2,
    fontFamily: "inherit",
    minWidth:   0,
  },
} as const;
