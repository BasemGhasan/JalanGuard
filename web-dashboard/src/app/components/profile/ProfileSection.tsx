// 1. Imports — External
import { useState, useCallback, useMemo } from "react";
import { User, Mail, Calendar, Pencil, Check, X, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

// 1. Imports — Local hooks / constants / components
import { useAuth }        from "../../../context/AuthContext";
import { useProfile }     from "../../../hooks/useProfile";
import { ProfileField }   from "./ProfileField";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { COLORS, SPACING, FONT_SIZES } from "../../../constants/theme";

// 2. Interfaces
interface VerifiedBadgeProps { confirmed: boolean }

// 3. Sub-components
/** Pill badge indicating email verification status. */
function VerifiedBadge({ confirmed }: VerifiedBadgeProps) {
  const style = useMemo(() => ({
    display:      "inline-flex",
    alignItems:   "center",
    padding:      `${SPACING.xs - 1}px ${SPACING.sm + 2}px`,
    borderRadius: 99,
    fontSize:     FONT_SIZES.sm,
    fontWeight:   600 as const,
    background:   confirmed ? `${COLORS.success}1A` : `${COLORS.warning}1A`,
    color:        confirmed ? COLORS.success : COLORS.warning,
    border:       `1px solid ${confirmed ? `${COLORS.success}33` : `${COLORS.warning}33`}`,
    flexShrink:   0,
  }), [confirmed]);

  return <span style={style}>{confirmed ? "Verified" : "Pending"}</span>;
}

// 4. Component
/**
 * Profile display and editing card.
 *
 * Reads from `useProfile` (data/logic layer) and `useAuth` (session).
 * Owns only the UI state for edit mode and the draft value of the name field.
 *
 * Follows separation of concerns:
 *   - Data fetching / persistence → useProfile hook
 *   - Field layout                → ProfileField component
 *   - Auth session                → useAuth hook
 */
export function ProfileSection() {
  const { session }                        = useAuth();
  const { profile, loading, saving, error, saveProfile } = useProfile();
  const [editing,   setEditing]            = useState(false);
  const [draftName, setDraftName]          = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Derived display values (fall back to auth metadata if row is missing) ─
  const displayName = useMemo(
    () => profile?.full_name
       ?? (session?.user?.user_metadata?.full_name as string | undefined)
       ?? "",
    [profile, session],
  );

  const displayEmail = useMemo(
    () => profile?.email ?? session?.user?.email ?? "",
    [profile, session],
  );

  const memberSince = useMemo(() => {
    const raw = profile?.created_at ?? session?.user?.created_at;
    if (!raw) return "";
    return new Date(raw).toLocaleDateString("en-MY", {
      month: "long", year: "numeric",
    });
  }, [profile, session]);

  const initials = useMemo(
    () => (displayName || displayEmail).charAt(0).toUpperCase() || "?",
    [displayName, displayEmail],
  );

  const isVerified = Boolean(session?.user?.email_confirmed_at);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStartEdit = useCallback(() => {
    setDraftName(displayName);
    setEditing(true);
  }, [displayName]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setDraftName("");
  }, []);

  const handleSave = useCallback(async () => {
    const ok = await saveProfile({ full_name: draftName.trim() || null });
    if (ok) {
      toast.success("Profile updated!", {
        description: "Your display name has been saved.",
      });
      setEditing(false);
    }
  }, [draftName, saveProfile]);

  const handleDraftNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setDraftName(e.target.value),
    [],
  );

  const handleOpenDeleteModal = useCallback(() => setShowDeleteModal(true), []);
  const handleCloseDeleteModal = useCallback(() => setShowDeleteModal(false), []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.card}>

      {/* ── Card header: section title + edit toggle ────────────────────── */}
      <div style={styles.cardHeader}>
        <div style={styles.sectionLabel}>
          <User size={14} color={COLORS.secondary} />
          <span style={styles.sectionLabelText}>Profile</span>
        </div>

        {!editing ? (
          <button style={styles.editBtn} onClick={handleStartEdit} disabled={loading}>
            <Pencil size={13} />
            Edit
          </button>
        ) : (
          <button style={styles.cancelBtn} onClick={handleCancelEdit}>
            <X size={13} />
            Cancel
          </button>
        )}
      </div>

      {/* ── Avatar + identity summary ────────────────────────────────────── */}
      <div style={styles.avatarRow}>
        <div style={styles.avatar}>{initials}</div>
        <div style={styles.identity}>
          {loading ? (
            <div style={styles.skeletonName} />
          ) : (
            <span style={styles.displayName}>{displayName || "No name set"}</span>
          )}
          <span style={styles.displayEmail}>{displayEmail}</span>
          {memberSince && (
            <span style={styles.memberSince}>Member since {memberSince}</span>
          )}
        </div>
        <VerifiedBadge confirmed={isVerified} />
      </div>

      {/* ── Editable fields ──────────────────────────────────────────────── */}
      <div style={styles.fields}>
        <ProfileField
          label="Full Name"
          icon={User}
          value={editing ? draftName : displayName}
          editable
          editing={editing}
          onChange={handleDraftNameChange}
        />
        <ProfileField
          label="Email"
          icon={Mail}
          value={displayEmail}
          editable={false}
          badge={<VerifiedBadge confirmed={isVerified} />}
        />
        {memberSince && (
          <ProfileField
            label="Member Since"
            icon={Calendar}
            value={memberSince}
            editable={false}
          />
        )}
      </div>

      {/* ── Inline error ─────────────────────────────────────────────────── */}
      {error && (
        <p style={styles.errorText}>{error}</p>
      )}

      {/* ── Action buttons ───────────────────────── */}
      <div style={styles.actionRow}>
        <button
          style={styles.deleteLinkBtn}
          onClick={handleOpenDeleteModal}
          disabled={loading}
        >
          <Trash2 size={13} />
          Delete Account
        </button>

        {editing && (
          <button
            style={{
              ...styles.saveBtn,
              opacity: saving ? 0.65 : 1,
              cursor:  saving ? "not-allowed" : "pointer",
            }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" />Saving…</>
            ) : (
              <><Check size={14} />Save Profile</>
            )}
          </button>
        )}
      </div>

      {/* ── Delete Account Modal ─────────────────────────────────────────── */}
      {showDeleteModal && (
        <DeleteAccountModal onClose={handleCloseDeleteModal} />
      )}
    </div>
  );
}

// 5. Styles
const styles = {
  card: {
    background:   COLORS.surface,
    borderRadius: 24,
    padding:      SPACING.xl,
    border:       `1px solid ${COLORS.borderFaint}`,
    boxShadow:    `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${COLORS.accentLine}`,
  },
  cardHeader: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   SPACING.lg,
  },
  sectionLabel: {
    display:    "flex",
    alignItems: "center",
    gap:        SPACING.sm,
  },
  sectionLabelText: {
    color:         COLORS.textMuted,
    fontSize:      FONT_SIZES.sm,
    fontWeight:    600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
  editBtn: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.xs + 2,
    padding:      `${SPACING.xs}px ${SPACING.sm + 4}px`,
    borderRadius: 8,
    background:   COLORS.accentSoft,
    border:       `1px solid ${COLORS.accentLine}`,
    color:        COLORS.secondary,
    fontSize:     FONT_SIZES.sm + 1,
    fontWeight:   600,
    cursor:       "pointer",
  },
  cancelBtn: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.xs + 2,
    padding:      `${SPACING.xs}px ${SPACING.sm + 4}px`,
    borderRadius: 8,
    background:   "transparent",
    border:       `1px solid ${COLORS.borderSoft}`,
    color:        COLORS.textMuted,
    fontSize:     FONT_SIZES.sm + 1,
    fontWeight:   600,
    cursor:       "pointer",
  },
  avatarRow: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.md,
    padding:      `${SPACING.md}px`,
    background:   COLORS.primary,
    borderRadius: 16,
    border:       `1px solid ${COLORS.borderFaint}`,
    marginBottom: SPACING.md,
  },
  avatar: {
    width:          48,
    height:         48,
    borderRadius:   "50%",
    background:     `linear-gradient(135deg, ${COLORS.secondary}, #92400E)`,
    color:          COLORS.white,
    fontSize:       FONT_SIZES.lg,
    fontWeight:     700,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
    boxShadow:      `0 4px 12px ${COLORS.accentGlow}`,
  },
  identity: {
    flex:          1,
    display:       "flex",
    flexDirection: "column" as const,
    gap:           2,
    minWidth:      0,
  },
  displayName: {
    color:        COLORS.textPrimary,
    fontSize:     FONT_SIZES.sm + 3,
    fontWeight:   600,
    overflow:     "hidden",
    textOverflow: "ellipsis",
    whiteSpace:   "nowrap" as const,
  },
  displayEmail: {
    color:        COLORS.textMuted,
    fontSize:     FONT_SIZES.sm + 1,
    overflow:     "hidden",
    textOverflow: "ellipsis",
    whiteSpace:   "nowrap" as const,
  },
  memberSince: {
    color:    COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    opacity:  0.7,
  },
  skeletonName: {
    height:       16,
    width:        120,
    borderRadius: 4,
    background:   COLORS.accent,
    opacity:      0.4,
  },
  fields: {
    display:       "flex",
    flexDirection: "column" as const,
  },
  errorText: {
    color:     COLORS.error,
    fontSize:  FONT_SIZES.sm + 1,
    marginTop: SPACING.sm,
  },
  actionRow: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    marginTop:      SPACING.md,
    paddingTop:     SPACING.md,
    borderTop:      `1px solid ${COLORS.borderFaint}`,
  },
  deleteLinkBtn: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.xs,
    padding:      `${SPACING.xs}px ${SPACING.sm}px`,
    background:   "transparent",
    border:       "none",
    color:        COLORS.error,
    fontSize:     FONT_SIZES.sm + 1,
    fontWeight:   600,
    cursor:       "pointer",
    opacity:      0.8,
    transition:   "opacity 0.2s ease",
  },
  saveBtn: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.xs + 2,
    padding:      `${SPACING.sm}px ${SPACING.lg}px`,
    borderRadius: 10,
    background:   COLORS.secondary,
    border:       "none",
    color:        COLORS.white,
    fontSize:     FONT_SIZES.sm + 2,
    fontWeight:   600,
    boxShadow:    `0 4px 16px ${COLORS.accentGlow}`,
  },
} as const;
