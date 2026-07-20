// 1. Imports — External
import { useMemo, useState, useCallback} from "react";
import { User, Mail, Calendar, Trash2 } from "lucide-react";

// 1. Imports — Local hooks / constants / components
import { COLORS, FONT_SIZES, SPACING } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";
import { useProfile } from "../../../hooks/useProfile";
import { Card } from "../ui/card";
import { SectionLabel } from "../ui/sectionLabel";
import { ProfileField } from "./ProfileField";
import { DeleteAccountModal } from "./DeleteAccountModal";
import type { Page } from "../Navbar";

interface VerifiedBadgeProps {
  confirmed: boolean;
}

function VerifiedBadge({ confirmed }: Readonly<VerifiedBadgeProps>) {
  const borderColor = confirmed ? `${COLORS.success}33` : `${COLORS.warning}33`;
  const style = useMemo(
    () => ({
      display: "inline-flex",
      alignItems: "center",
      padding: `${SPACING.xs - 1}px ${SPACING.sm + 2}px`,
      borderRadius: 99,
      fontSize: FONT_SIZES.sm,
      fontWeight: 600 as const,
      background: confirmed ? `${COLORS.success}1A` : `${COLORS.warning}1A`,
      color: confirmed ? COLORS.success : COLORS.warning,
      border: `1px solid ${borderColor}`,
      flexShrink: 0,
    }),
    [borderColor, confirmed],
  );

  return <span style={style}>{confirmed ? "Verified" : "Pending"}</span>;
}

interface ProfileSectionProps {
  onNavigate: (p: Page) => void;
}

/**
 * Read-only profile card.
 *
 * Name and email are edited in the mobile app only (Settings → Account), so
 * this section displays them without any editing affordance — see the note on
 * ProfileField for why editing lives in one place.
 */
export function ProfileSection({ onNavigate }: Readonly<ProfileSectionProps>) {
  const { session } = useAuth();
  const { profile, loading, error } = useProfile();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const displayName = useMemo(
    () => profile?.full_name ?? (session?.user?.user_metadata?.full_name as string | undefined) ?? "",
    [profile, session],
  );

  const displayEmail = useMemo(() => profile?.email ?? session?.user?.email ?? "", [profile, session]);

  const memberSince = useMemo(() => {
    const raw = profile?.created_at ?? session?.user?.created_at;
    if (!raw) return "";
    return new Date(raw).toLocaleDateString("en-MY", {
      month: "long",
      year: "numeric",
    });
  }, [profile, session]);

  const initials = useMemo(() => (displayName || displayEmail).charAt(0).toUpperCase() || "?", [displayName, displayEmail]);
  const isVerified = Boolean(session?.user?.email_confirmed_at);

  const handleOpenDeleteModal = useCallback(() => setShowDeleteModal(true), []);
  const handleCloseDeleteModal = useCallback(() => setShowDeleteModal(false), []);

  return (
    <Card>
      <SectionLabel icon={User} label="Profile" />

      <div style={styles.avatarRow}>
        <div style={styles.avatar}>{initials}</div>
        <div style={styles.identity}>
          {loading ? <div style={styles.skeletonName} /> : <span style={styles.displayName}>{displayName || "No name set"}</span>}
          <span style={styles.displayEmail}>{displayEmail}</span>
          {memberSince && <span style={styles.memberSince}>Member since {memberSince}</span>}
        </div>
        <VerifiedBadge confirmed={isVerified} />
      </div>

      <div style={styles.fields}>
        <ProfileField label="Full Name" icon={User} value={displayName} />
        <ProfileField label="Email" icon={Mail} value={displayEmail} />
        {memberSince && <ProfileField label="Member Since" icon={Calendar} value={memberSince} />}
      </div>

      <p style={styles.editHint}>
        To change your name or email, open the JalanGuard mobile app and go to
        Settings → Account.
      </p>

      {error && <p style={styles.errorText}>{error}</p>}

      {/* ── Action buttons ───────────────────────── */}
      <div style={styles.actionRow}>
        <button
          style={styles.deleteLinkBtn}
          onClick={handleOpenDeleteModal}
          disabled={loading}
        >
          <Trash2 size={14} />
          {profile?.is_citizen ? "Remove Developer Access" : "Delete Account"}
        </button>
      </div>

      {/* ── Delete Account Modal ─────────────────────────────────────────── */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={handleCloseDeleteModal}
          onDeleted={() => onNavigate("map")}
          isCitizen={profile?.is_citizen ?? false}
        />
      )}
    </Card>
  );
}

const styles = {
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: SPACING.md,
    padding: `${SPACING.md}px`,
    background: COLORS.primary,
    borderRadius: 16,
    border: `1px solid ${COLORS.borderFaint}`,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondaryDeep})`,
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: `0 4px 12px ${COLORS.accentGlow}`,
  },
  identity: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    minWidth: 0,
  },
  displayName: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm + 3,
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  displayEmail: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm + 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  memberSince: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    opacity: 0.7,
  },
  skeletonName: {
    height: 16,
    width: 120,
    borderRadius: 4,
    background: COLORS.accent,
    opacity: 0.4,
  },
  fields: {
    display: "flex",
    flexDirection: "column" as const,
  },
  editHint: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    lineHeight: 1.5,
    margin: `${SPACING.md}px 0 0`,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm + 1,
    marginTop: SPACING.sm,
  },
  actionRow: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    marginTop:      SPACING.sm,
    paddingTop:     SPACING.md,
  },
  deleteLinkBtn: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.xs,
    padding:      `${SPACING.xs}px ${SPACING.sm}px`,
    background:   "transparent",
    border:       "none",
    color:        COLORS.error,
    fontSize:     FONT_SIZES.sm + 2,
    fontWeight:   600,
    cursor:       "pointer",
    opacity:      0.8,
    transition:   "opacity 0.2s ease",
  },
} as const;