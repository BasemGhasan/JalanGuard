// 1. Imports — External
import { useState, useCallback } from "react";
import { Key, Shield, Copy, Check, RefreshCw } from "lucide-react";

// 1. Imports — Local context / components / constants
import { useAuth }         from "../../context/AuthContext";
import { LogoutModal }     from "./auth/LogoutModal";
import { ProfileSection }  from "./profile/ProfileSection";
import type { Page }       from "./Navbar";
import { COLORS, SPACING, FONT_SIZES } from "../../constants/theme";

// 2. Interfaces
interface KeyPageProps {
  onNavigate: (p: Page) => void;
}

// 3. Sub-components (internal — not exported, not reused elsewhere)
/**
 * Amber-icon section heading used in the API key card.
 * Kept here because it is specific to this card's layout.
 */
function SectionLabel({
  icon: Icon,
  label,
}: {
  icon:  React.ComponentType<{ size?: number; color?: string }>;
  label: string;
}) {
  return (
    <div style={sectionLabelStyles.wrap}>
      <Icon size={14} color={COLORS.secondary} />
      <span style={sectionLabelStyles.text}>{label}</span>
    </div>
  );
}

const sectionLabelStyles = {
  wrap: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.sm,
    marginBottom: SPACING.md,
  },
  text: {
    color:         COLORS.textMuted,
    fontSize:      FONT_SIZES.sm,
    fontWeight:    600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
} as const;

// 4. Component
/**
 * Developer Settings page.
 *
 * Thin shell — owns only logout-modal visibility and copy state.
 * All profile data + editing logic lives in ProfileSection → useProfile.
 * All auth state lives in AuthContext → useAuth.
 */
export function KeyPage({ onNavigate }: KeyPageProps) {
  const { session }                 = useAuth();
  const [copied, setCopied]         = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const apiKey = session?.access_token ?? "pk_live_*******************";

  const handleOpenLogout  = useCallback(() => setShowLogout(true),  []);
  const handleCloseLogout = useCallback(() => setShowLogout(false), []);
  const handleLoggedOut   = useCallback(() => {
    setShowLogout(false);
    onNavigate("map");
  }, [onNavigate]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [apiKey]);

  return (
    <>
      <div style={styles.page}>
        <div style={styles.inner}>

          {/* ── Page header ───────────────────────────────────────────── */}
          <div style={styles.headerWrap}>
            <div style={styles.badge}>DASHBOARD</div>
            <h1 style={styles.heading}>Developer Settings</h1>
            <p style={styles.subheading}>
              Manage your account profile and API access keys.
            </p>
          </div>

          {/* ── Profile card (self-contained — data + UI via ProfileSection) */}
          <ProfileSection />

          {/* ── API key card ──────────────────────────────────────────── */}
          <div style={styles.card}>

            {/* Top-right logout shortcut */}
            <div style={styles.topRight}>
              <button style={styles.logoutSmallBtn} onClick={handleOpenLogout}>
                <RefreshCw size={13} />
                Logout
              </button>
            </div>

            <SectionLabel icon={Key} label="Your Access Token" />

            {/* Token display row */}
            <div style={styles.keyRow}>
              <Key size={14} color={COLORS.textMuted} style={{ flexShrink: 0 }} />
              <input
                readOnly
                value={session ? apiKey : "pk_live_*******************"}
                style={styles.keyInput}
              />
              <button
                onClick={handleCopy}
                disabled={!session}
                title="Copy"
                style={{
                  ...styles.copyBtn,
                  opacity: session ? 1 : 0.4,
                  cursor:  session ? "pointer" : "not-allowed",
                }}
              >
                {copied
                  ? <Check size={14} color={COLORS.success} />
                  : <Copy  size={14} color={COLORS.textMuted} />
                }
              </button>
            </div>

            {/* Explanatory note */}
            <div style={styles.shieldRow}>
              <Shield
                size={14}
                color={COLORS.textMuted}
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <p style={styles.shieldText}>
                This is your Supabase JWT access token. Use it as a Bearer token
                in API requests. It expires periodically and refreshes automatically.
              </p>
            </div>

            {/* Primary sign-out button */}
            <button style={styles.logoutFullBtn} onClick={handleOpenLogout}>
              <RefreshCw size={14} />
              Sign Out &amp; Refresh Session
            </button>
          </div>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <p style={styles.footer}>
            Powered by{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.secondary }}
            >
              Supabase Auth
            </a>
          </p>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showLogout && (
        <LogoutModal
          onClose={handleCloseLogout}
          onLoggedOut={handleLoggedOut}
        />
      )}
    </>
  );
}

// 5. Styles — all values from COLORS / SPACING / FONT_SIZES
const styles = {
  page: {
    minHeight:      "calc(100vh - 64px)",
    padding:        `${SPACING.xl * 2}px ${SPACING.xl}px`,
    display:        "flex",
    justifyContent: "center",
    background:     COLORS.background,
  },
  inner: {
    width:         "100%",
    maxWidth:      720,
    display:       "flex",
    flexDirection: "column" as const,
    gap:           SPACING.lg,
  },
  headerWrap: {
    textAlign:    "center" as const,
    marginBottom: SPACING.xs,
  },
  badge: {
    display:       "inline-block",
    padding:       `${SPACING.xs}px ${SPACING.md - 4}px`,
    borderRadius:  99,
    background:    COLORS.surface,
    color:         COLORS.textMuted,
    fontSize:      FONT_SIZES.sm,
    fontWeight:    600,
    letterSpacing: "0.05em",
    border:        `1px solid ${COLORS.borderFaint}`,
    marginBottom:  SPACING.md,
  },
  heading: {
    color:      COLORS.textPrimary,
    fontSize:   40,
    fontWeight: 700,
    lineHeight: 1.1,
    margin:     `${SPACING.xs}px 0 ${SPACING.sm}px`,
  },
  subheading: {
    color:    COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    margin:   0,
  },
  card: {
    background:   COLORS.surface,
    borderRadius: 24,
    padding:      SPACING.xl,
    border:       `1px solid ${COLORS.borderFaint}`,
    boxShadow:    `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${COLORS.accentLine}`,
  },
  topRight: {
    display:        "flex",
    justifyContent: "flex-end",
    marginBottom:   SPACING.sm,
  },
  logoutSmallBtn: {
    display:     "flex",
    alignItems:  "center",
    gap:         SPACING.xs,
    padding:     `${SPACING.xs}px ${SPACING.sm + 4}px`,
    borderRadius: 8,
    background:  "transparent",
    border:      "none",
    color:       COLORS.textMuted,
    fontSize:    FONT_SIZES.sm + 1,
    fontWeight:  600,
    cursor:      "pointer",
  },
  keyRow: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.sm + 4,
    background:   COLORS.primary,
    borderRadius: 12,
    border:       `1px solid ${COLORS.borderFaint}`,
    padding:      `${SPACING.sm}px ${SPACING.sm}px ${SPACING.sm}px ${SPACING.md + 4}px`,
    marginBottom: SPACING.md,
  },
  keyInput: {
    flex:          1,
    background:    "transparent",
    border:        "none",
    outline:       "none",
    color:         COLORS.textPrimary,
    fontFamily:    "monospace",
    fontSize:      FONT_SIZES.sm + 1,
    letterSpacing: "0.03em",
    minWidth:      0,
  },
  copyBtn: {
    width:          40,
    height:         40,
    borderRadius:   8,
    background:     COLORS.surface,
    border:         "none",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  shieldRow: {
    display:      "flex",
    alignItems:   "flex-start",
    gap:          SPACING.sm,
    marginBottom: SPACING.lg,
  },
  shieldText: {
    color:      COLORS.textMuted,
    fontSize:   FONT_SIZES.sm + 1,
    lineHeight: 1.5,
    margin:     0,
  },
  logoutFullBtn: {
    width:          "100%",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            SPACING.sm,
    padding:        `${SPACING.sm + 4}px ${SPACING.lg}px`,
    borderRadius:   12,
    background:     "transparent",
    border:         `1px solid ${COLORS.secondary}`,
    color:          COLORS.secondary,
    fontWeight:     600,
    fontSize:       FONT_SIZES.sm + 2,
    cursor:         "pointer",
  },
  footer: {
    textAlign: "center" as const,
    color:     COLORS.textMuted,
    fontSize:  FONT_SIZES.sm + 1,
    margin:    0,
  },
} as const;
