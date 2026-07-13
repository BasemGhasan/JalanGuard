// 1. Imports — External
import { useCallback } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

// 1. Imports — Local constants
import { COLORS, SPACING, SHADOWS } from "../../../constants/theme";

// 2. Interfaces
interface ModalShellProps {
  /** Fired on backdrop click. Pass the same close handler as your buttons. */
  onClose:     () => void;
  /** id of the element that titles the dialog (aria-labelledby). */
  labelledBy?: string;
  /** Dialog width in px. */
  width?:      number;
  /** false → children own all padding (e.g. header/body split layouts). */
  padded?:     boolean;
  children:    ReactNode;
  /** Merged over the dialog card style. */
  cardStyle?:  CSSProperties;
}

// 3. Component
/**
 * Shared modal scaffold: fixed blurred backdrop + centred dialog card with
 * click-outside-to-close. Previously LogoutModal and DeleteAccountModal each
 * re-implemented this (with slightly different overlay colours).
 */
export function ModalShell({
  onClose,
  labelledBy,
  width = 400,
  padded = true,
  children,
  cardStyle,
}: Readonly<ModalShellProps>) {
  /** Close only when the click lands on the backdrop, not inside the card. */
  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <div style={styles.backdrop} onClick={handleBackdropClick}>
      <div
        style={{
          ...styles.card,
          width,
          padding: padded ? SPACING.xl : 0,
          ...cardStyle,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>
  );
}

// 4. Styles
const styles = {
  backdrop: {
    position:             "fixed" as const,
    inset:                0,
    background:           COLORS.overlayDark,
    backdropFilter:       "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    display:              "flex",
    alignItems:           "center",
    justifyContent:       "center",
    zIndex:               9999,
    padding:              SPACING.lg,
  },
  card: {
    position:     "relative" as const,
    maxWidth:     "100%",
    background:   COLORS.surface,
    border:       `1px solid ${COLORS.borderSoft}`,
    borderRadius: 20,
    boxShadow:    SHADOWS.modal,
  },
} as const;
