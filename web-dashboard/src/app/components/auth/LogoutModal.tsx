// 1. Imports — External
import { useState, useCallback } from "react";
import { LogOut, X, Loader2 }    from "lucide-react";

// 1. Imports — Local
import { COLORS, SPACING, FONT_SIZES } from "../../../constants/theme";
import { supabase }                    from "../../../lib/supabase";

// 2. Interfaces
interface LogoutModalProps {
  onClose:     () => void;
  /** Called after signOut resolves so the parent can redirect the user. */
  onLoggedOut: () => void;
}

// 3. Component
/**
 * Dark-themed confirmation modal for signing out.
 *
 * Calls supabase.auth.signOut() ONLY when the user clicks the final
 * "Log Out" button. Clicking "Cancel" or the backdrop closes the modal
 * without any side effects.
 */
export function LogoutModal({ onClose, onLoggedOut }: LogoutModalProps) {
  const [loading, setLoading] = useState(false);

  /** Guard: only sign out on explicit user confirmation. */
  const handleConfirm = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    onLoggedOut();
  }, [onLoggedOut]);

  /** Close when clicking the semi-transparent backdrop (not the card itself). */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <div
      style={styles.backdrop}
      onClick={handleBackdropClick}
    >
      <div
        style={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        {/* Close X button */}
        <button
          style={styles.closeX}
          onClick={onClose}
          aria-label="Cancel logout"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div style={styles.iconWrap}>
          <LogOut size={24} color={COLORS.secondary} />
        </div>

        <h2 id="logout-title" style={styles.title}>Sign out?</h2>
        <p style={styles.body}>
          Your session will end. You can always log back in at any time.
        </p>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            style={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            style={{
              ...styles.confirmBtn,
              opacity: loading ? 0.7 : 1,
              cursor:  loading ? "not-allowed" : "pointer",
            }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Signing out…
              </>
            ) : (
              "Sign Out"
            )}
          </button>
        </div>
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
  },
  card: {
    position:     "relative" as const,
    width:        360,
    background:   COLORS.surface,
    border:       `1px solid ${COLORS.borderSoft}`,
    borderRadius: 20,
    padding:      SPACING.xl,
    boxShadow:    "0 24px 60px rgba(0,0,0,0.6)",
    textAlign:    "center" as const,
  },
  closeX: {
    position:     "absolute" as const,
    top:          SPACING.md,
    right:        SPACING.md,
    background:   "transparent",
    border:       "none",
    color:        COLORS.textMuted,
    cursor:       "pointer",
    padding:      SPACING.xs,
    borderRadius: 6,
    display:      "flex",
    alignItems:   "center",
  },
  iconWrap: {
    width:          56,
    height:         56,
    borderRadius:   "50%",
    background:     COLORS.accentSoft,
    border:         `1px solid ${COLORS.accentLine}`,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    margin:         "0 auto",
    marginBottom:   SPACING.md,
  },
  title: {
    color:        COLORS.textPrimary,
    fontSize:     FONT_SIZES.xl,
    fontWeight:   700,
    margin:       `0 0 ${SPACING.sm}px`,
  },
  body: {
    color:      COLORS.textMuted,
    fontSize:   FONT_SIZES.sm,
    lineHeight: 1.6,
    margin:     `0 0 ${SPACING.lg}px`,
  },
  actions: {
    display: "flex",
    gap:     SPACING.sm,
  },
  cancelBtn: {
    flex:         1,
    padding:      `${SPACING.sm + 4}px`,
    borderRadius: 12,
    background:   "transparent",
    border:       `1px solid ${COLORS.borderSoft}`,
    color:        COLORS.textMuted,
    fontSize:     FONT_SIZES.sm + 1,
    fontWeight:   600,
    cursor:       "pointer",
  },
  confirmBtn: {
    flex:           1,
    padding:        `${SPACING.sm + 4}px`,
    borderRadius:   12,
    background:     COLORS.secondary,
    border:         "none",
    color:          COLORS.white,
    fontSize:       FONT_SIZES.sm + 1,
    fontWeight:     600,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            SPACING.xs,
  },
} as const;
