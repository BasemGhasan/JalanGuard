// 1. Imports — External
import { useState, useCallback } from "react";
import { LogOut, X } from "lucide-react";

// 1. Imports — Local components / constants
import { ModalShell } from "../ui/modalShell";
import { AppButton }  from "../ui/appButton";
import { COLORS, SPACING, FONT_SIZES } from "../../../constants/theme";
import { supabase }   from "../../../lib/supabase";

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
 * "Sign Out" button. Clicking "Cancel" or the backdrop closes the modal
 * without any side effects.
 */
export function LogoutModal({ onClose, onLoggedOut }: Readonly<LogoutModalProps>) {
  const [loading, setLoading] = useState(false);

  /** Guard: only sign out on explicit user confirmation. */
  const handleConfirm = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    onLoggedOut();
  }, [onLoggedOut]);

  return (
    <ModalShell onClose={onClose} labelledBy="logout-title" width={360} cardStyle={styles.card}>
      {/* Close X button */}
      <button style={styles.closeX} onClick={onClose} aria-label="Cancel logout">
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
        <AppButton variant="outline" onClick={onClose} disabled={loading} style={styles.actionBtn}>
          Cancel
        </AppButton>
        <AppButton variant="primary" onClick={handleConfirm} loading={loading} style={styles.actionBtn}>
          {loading ? "Signing out…" : "Sign Out"}
        </AppButton>
      </div>
    </ModalShell>
  );
}

// 4. Styles
const styles = {
  card: {
    textAlign: "center" as const,
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
    color:      COLORS.textPrimary,
    fontSize:   FONT_SIZES.xl,
    fontWeight: 700,
    margin:     `0 0 ${SPACING.sm}px`,
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
  actionBtn: {
    flex: 1,
  },
} as const;
