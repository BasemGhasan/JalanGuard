// 1. Imports — External
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Loader2 } from "lucide-react";

// 1. Imports — Local constants
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from "../../../constants/theme";

// 2. Types / Interfaces
/**
 * Visual variants:
 *  primary      — amber CTA with glow (Login, Generate Key, Retry…)
 *  outline      — transparent with soft border (Cancel, secondary actions)
 *  ghost        — borderless text button (inline cancels)
 *  danger       — red destructive action (Delete Account, Regenerate)
 *  amberOutline — amber-bordered emphasis without fill (Sign Out)
 */
export type AppButtonVariant = "primary" | "outline" | "ghost" | "danger" | "amberOutline";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   AppButtonVariant;
  /** Shows a spinner and disables the button while an async action runs. */
  loading?:   boolean;
  fullWidth?: boolean;
  children:   ReactNode;
}

// 3. Component
/**
 * The standard JalanGuard button.
 *
 * Replaces ~10 hand-rolled inline button styles that previously lived in
 * Navbar, AuthPage, KeyPage, LogoutModal, DeleteAccountModal, MapFallback
 * and MapErrorBoundary. Owns the disabled/loading presentation so callers
 * never re-implement the opacity + spinner pattern.
 */
export function AppButton({
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  children,
  ...rest
}: Readonly<AppButtonProps>) {
  const isDisabled = disabled || loading;

  const composed: CSSProperties = {
    ...styles.base,
    ...variantStyles[variant],
    ...(fullWidth ? styles.fullWidth : {}),
    opacity: isDisabled ? 0.6 : 1,
    cursor:  isDisabled ? "not-allowed" : "pointer",
    ...style,
  };

  return (
    <button style={composed} disabled={isDisabled} {...rest}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

// 4. Styles
const styles = {
  base: {
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            SPACING.sm,
    padding:        `${SPACING.sm + 4}px ${SPACING.lg}px`,
    borderRadius:   12,
    fontSize:       FONT_SIZES.sm + 2,
    fontWeight:     600,
    border:         "none",
    background:     "transparent",
    transition:     "opacity 0.15s ease",
  },
  fullWidth: {
    width: "100%",
  },
} as const;

const variantStyles: Record<AppButtonVariant, CSSProperties> = {
  primary: {
    background: COLORS.secondary,
    color:      COLORS.white,
    boxShadow:  SHADOWS.glow,
  },
  outline: {
    border: `1px solid ${COLORS.borderSoft}`,
    color:  COLORS.textPrimary,
  },
  ghost: {
    color: COLORS.textMuted,
  },
  danger: {
    background: COLORS.error,
    color:      COLORS.white,
  },
  amberOutline: {
    border: `1px solid ${COLORS.secondary}`,
    color:  COLORS.secondary,
  },
};
