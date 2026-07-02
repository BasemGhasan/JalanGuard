// 1. Imports — External
import { useMemo } from "react";
import { Calendar, Mail, User } from "lucide-react";

// 1. Imports — Local hooks / constants / components
import { COLORS, FONT_SIZES, SPACING } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";
import { useProfile } from "../../../hooks/useProfile";
import { ProfileField } from "./ProfileField";

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

export function ProfileSection() {
  const { session } = useAuth();
  const { profile, loading, error, saveProfile, requestEmailUpdate, verifyEmailOtp } = useProfile();

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

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.sectionLabel}>
          <User size={14} color={COLORS.secondary} />
          <span style={styles.sectionLabelText}>Profile</span>
        </div>
      </div>

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
        <ProfileField
          label="Full Name"
          icon={User}
          value={displayName}
          editable
          onSave={async (newValue) => {
            const ok = await saveProfile({ full_name: newValue.trim() || null });
            if (!ok) {
              throw new Error(error ?? "Failed to update full name.");
            }
          }}
        />
        <ProfileField
          label="Email"
          icon={Mail}
          value={displayEmail}
          editable
          isEmailUpdate
          onRequestOtp={requestEmailUpdate}
          onVerifyOtp={verifyEmailOtp}
        />
        {memberSince && <ProfileField label="Member Since" icon={Calendar} value={memberSince} editable={false} />}
      </div>

      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
}

const styles = {
  card: {
    background: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.xl,
    border: `1px solid ${COLORS.borderFaint}`,
    boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${COLORS.accentLine}`,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: SPACING.sm,
  },
  sectionLabelText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
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
    background: `linear-gradient(135deg, ${COLORS.secondary}, #92400E)`,
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
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm + 1,
    marginTop: SPACING.sm,
  },
} as const;
