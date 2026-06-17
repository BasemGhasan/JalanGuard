// 1. Imports
import { useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { COLORS } from "../../../constants/theme";
import type { MapView } from "../../../types/map";

export type ToggleValue = MapView | 0 | 1 | 2;

export interface ToggleOption<T extends ToggleValue> {
  value: T;
  label: string;
  Icon: LucideIcon;
}

// 2. Interfaces
interface ViewToggleProps<T extends ToggleValue> {
  value: T;
  onChange: (value: T) => void;
  options: ToggleOption<T>[];
  position?: "left" | "right";
}


// 3. Component
/** Toggle control that switches between Choropleth and Pins views. */
export function ViewToggle<T extends ToggleValue>({
  value,
  onChange,
  options,
  position = "right",
}: ViewToggleProps<T>) {
  const handleClick = useCallback(
    (v: T) => () => onChange(v),
    [onChange],
  );

  return (
    <div style={{ ...styles.wrapper, ...(position === "left" ? styles.wrapperLeft : {}) }}>
      {options.map(({ value: optionValue, label, Icon }) => {
        const isActive = value === optionValue;
        return (
          <button
            key={String(optionValue)}
            onClick={handleClick(optionValue)}
            style={{
              ...styles.btnBase,
              background: isActive ? COLORS.secondary : "transparent",
              color: isActive ? COLORS.white : COLORS.textMuted,
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

// 4. Styles
const styles = {
  wrapper: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1000,
    display: "flex",
    borderRadius: 12,
    overflow: "hidden",
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderSoft}`,
    boxShadow: "0 8px 32px rgba(0,0,0,0.50)",
  },
  wrapperLeft: {
    left: 16,
    right: "auto" as const,
  },
  btnBase: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
} as const;

