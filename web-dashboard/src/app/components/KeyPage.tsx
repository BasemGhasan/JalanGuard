// 1. Imports — External
import { useState, useCallback, useMemo } from "react";
import {
  Key, Shield, Copy, Check, RefreshCw, LogOut,
  Eye, EyeOff, Loader2, Plus, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// 1. Imports — Local context / components / hooks / constants
import { useAuth }         from "../../context/AuthContext";
import { useApiKey }       from "../../hooks/useApiKey";
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
 * Amber-icon section heading used in the cards.
 * Kept here because it is specific to this page's card layout.
 */
function SectionLabel({
  icon: Icon,
  label,
}: Readonly<{
  icon:  React.ComponentType<{ size?: number; color?: string }>;
  label: string;
}>) {
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

/** Fixed-width dotted mask so the field width does not jump between states. */
const SECRET_MASK = "•".repeat(48);

// 4. Component
/**
 * Developer Settings page.
 *
 * Owns logout-modal visibility, copy feedback, and the regenerate confirm gate.
 * All API-key logic (generate / reveal-decrypt / copy / rotate) lives in
 * useApiKey → Supabase Vault RPCs. All profile logic lives in ProfileSection.
 */
export function KeyPage({ onNavigate }: Readonly<KeyPageProps>) {
  const { session } = useAuth();
  const {
    status, publicId, lastRotatedAt, plaintext,
    isRevealed, isBusy, error,
    generate, reveal, hide, copy,
  } = useApiKey();

  const [copied, setCopied]           = useState(false);
  const [showLogout, setShowLogout]   = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);

  // ── Derived display value for the key field ────────────────────────────────
  const displayValue = useMemo(() => {
    if (status !== "ready") return "";
    if (isRevealed && plaintext) return plaintext;
    return `jg_${publicId ?? "••••••••"}_${SECRET_MASK}`;
  }, [status, isRevealed, plaintext, publicId]);

  const rotatedLabel = useMemo(() => {
    if (!lastRotatedAt) return null;
    return new Date(lastRotatedAt).toLocaleDateString("en-MY", {
      day: "numeric", month: "long", year: "numeric",
    });
  }, [lastRotatedAt]);

  // Icon for the show/hide toggle — extracted to avoid a nested ternary in JSX.
  const revealIcon = useMemo(() => {
    if (isBusy && !isRevealed) {
      return <Loader2 size={14} color={COLORS.textMuted} className="animate-spin" />;
    }
    return isRevealed
      ? <EyeOff size={14} color={COLORS.textMuted} />
      : <Eye    size={14} color={COLORS.textMuted} />;
  }, [isBusy, isRevealed]);

  // ── Logout handlers ────────────────────────────────────────────────────────
  const handleOpenLogout  = useCallback(() => setShowLogout(true),  []);
  const handleCloseLogout = useCallback(() => setShowLogout(false), []);
  const handleLoggedOut   = useCallback(() => {
    setShowLogout(false);
    onNavigate("map");
  }, [onNavigate]);

  // ── Key lifecycle handlers ─────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    await generate();
    toast.success("API key generated. Copy it now — keep it secret.");
  }, [generate]);

  const handleToggleReveal = useCallback(async () => {
    if (isRevealed) { hide(); return; }
    await reveal();
  }, [isRevealed, hide, reveal]);

  const handleCopy = useCallback(async () => {
    const ok = await copy();
    if (!ok) { toast.error("Could not copy the API key."); return; }
    setCopied(true);
    toast.success("API key copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  }, [copy]);

  const handleRotate = useCallback(async () => {
    await generate();
    setConfirmRotate(false);
    toast.success("API key regenerated. The previous key no longer works.");
  }, [generate]);

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

            <SectionLabel icon={Key} label="Your API Key" />

            {status === "loading" && (
              <div style={styles.loadingRow}>
                <Loader2 size={16} color={COLORS.textMuted} className="animate-spin" />
                <span style={styles.mutedText}>Checking for an existing key…</span>
              </div>
            )}

            {/* No key yet — prompt to generate */}
            {status === "none" && (
              <div style={styles.emptyState}>
                <p style={styles.shieldText}>
                  You don't have an API key yet. Generate one to start calling the
                  JalanGuard Open Data API.
                </p>
                <button
                  style={{ ...styles.primaryBtn, opacity: isBusy ? 0.6 : 1 }}
                  onClick={handleGenerate}
                  disabled={isBusy || !session}
                >
                  {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Generate API Key
                </button>
              </div>
            )}

            {/* Key exists — reveal / copy / rotate */}
            {status === "ready" && (
              <>
                <div style={styles.keyRow}>
                  <Key size={14} color={COLORS.textMuted} style={{ flexShrink: 0 }} />
                  <input
                    readOnly
                    value={displayValue}
                    style={styles.keyInput}
                    aria-label="API key"
                  />
                  <button
                    onClick={handleToggleReveal}
                    disabled={isBusy}
                    title={isRevealed ? "Hide" : "Show"}
                    style={styles.iconBtn}
                  >
                    {revealIcon}
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={isBusy}
                    title="Copy"
                    style={styles.iconBtn}
                  >
                    {copied
                      ? <Check size={14} color={COLORS.success} />
                      : <Copy  size={14} color={COLORS.textMuted} />
                    }
                  </button>
                </div>

                {rotatedLabel && (
                  <p style={styles.metaText}>Last generated on {rotatedLabel}</p>
                )}

                {/* Explanatory note */}
                <div style={styles.shieldRow}>
                  <Shield
                    size={14}
                    color={COLORS.textMuted}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <p style={styles.shieldText}>
                    Your key is stored encrypted in Supabase Vault and revealed only
                    on request. Send it as a Bearer token:{" "}
                    <code style={styles.code}>Authorization: Bearer &lt;key&gt;</code>.
                  </p>
                </div>

                {/* Regenerate — two-step confirm (rotation invalidates the old key) */}
                {confirmRotate ? (
                  <div style={styles.confirmBox}>
                    <div style={styles.confirmHeader}>
                      <AlertTriangle size={14} color={COLORS.warning} />
                      <span style={styles.confirmTitle}>Regenerate this key?</span>
                    </div>
                    <p style={styles.mutedText}>
                      The current key stops working immediately. Any integration using
                      it must be updated with the new key.
                    </p>
                    <div style={styles.confirmActions}>
                      <button
                        style={styles.ghostBtn}
                        onClick={() => setConfirmRotate(false)}
                        disabled={isBusy}
                      >
                        Cancel
                      </button>
                      <button
                        style={{ ...styles.dangerBtn, opacity: isBusy ? 0.6 : 1 }}
                        onClick={handleRotate}
                        disabled={isBusy}
                      >
                        {isBusy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Regenerate
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    style={styles.secondaryBtn}
                    onClick={() => setConfirmRotate(true)}
                    disabled={isBusy}
                  >
                    <RefreshCw size={14} />
                    Regenerate Key
                  </button>
                )}
              </>
            )}

            {error && <p style={styles.errorText}>{error}</p>}

            {/* Primary sign-out button */}
            <button style={styles.logoutFullBtn} onClick={handleOpenLogout}>
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
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
  loadingRow: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.sm,
    marginBottom: SPACING.md,
  },
  emptyState: {
    display:       "flex",
    flexDirection: "column" as const,
    gap:           SPACING.md,
    marginBottom:  SPACING.md,
  },
  keyRow: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.sm + 4,
    background:   COLORS.primary,
    borderRadius: 12,
    border:       `1px solid ${COLORS.borderFaint}`,
    padding:      `${SPACING.sm}px ${SPACING.sm}px ${SPACING.sm}px ${SPACING.md + 4}px`,
    marginBottom: SPACING.sm,
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
    textOverflow:  "ellipsis",
  },
  iconBtn: {
    width:          40,
    height:         40,
    borderRadius:   8,
    background:     COLORS.surface,
    border:         "none",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
    cursor:         "pointer",
  },
  metaText: {
    color:        COLORS.textMuted,
    fontSize:     FONT_SIZES.sm,
    opacity:      0.75,
    margin:       0,
    marginBottom: SPACING.md,
  },
  mutedText: {
    color:      COLORS.textMuted,
    fontSize:   FONT_SIZES.sm + 1,
    lineHeight: 1.5,
    margin:     0,
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
  code: {
    fontFamily:   "monospace",
    fontSize:     FONT_SIZES.sm,
    color:        COLORS.textPrimary,
    background:   COLORS.primary,
    padding:      "2px 6px",
    borderRadius: 6,
  },
  primaryBtn: {
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            SPACING.sm,
    padding:        `${SPACING.sm + 4}px ${SPACING.lg}px`,
    borderRadius:   12,
    background:     COLORS.secondary,
    border:         "none",
    color:          COLORS.white,
    fontWeight:     600,
    fontSize:       FONT_SIZES.sm + 2,
    cursor:         "pointer",
    boxShadow:      `0 0 20px ${COLORS.accentGlow}`,
    alignSelf:      "flex-start" as const,
  },
  secondaryBtn: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            SPACING.sm,
    width:          "100%",
    padding:        `${SPACING.sm + 4}px ${SPACING.lg}px`,
    borderRadius:   12,
    background:     "transparent",
    border:         `1px solid ${COLORS.borderSoft}`,
    color:          COLORS.textPrimary,
    fontWeight:     600,
    fontSize:       FONT_SIZES.sm + 2,
    cursor:         "pointer",
    marginBottom:   SPACING.md,
  },
  confirmBox: {
    display:       "flex",
    flexDirection: "column" as const,
    gap:           SPACING.sm,
    padding:       SPACING.md,
    borderRadius:  12,
    background:    `${COLORS.warning}12`,
    border:        `1px solid ${COLORS.warning}40`,
    marginBottom:  SPACING.md,
  },
  confirmHeader: {
    display:    "flex",
    alignItems: "center",
    gap:        SPACING.sm,
  },
  confirmTitle: {
    color:      COLORS.textPrimary,
    fontSize:   FONT_SIZES.sm + 2,
    fontWeight: 600,
  },
  confirmActions: {
    display:        "flex",
    justifyContent: "flex-end",
    gap:            SPACING.sm,
    marginTop:      SPACING.xs,
  },
  ghostBtn: {
    padding:      `${SPACING.sm}px ${SPACING.md}px`,
    borderRadius: 10,
    background:   "transparent",
    border:       `1px solid ${COLORS.borderSoft}`,
    color:        COLORS.textMuted,
    fontWeight:   600,
    fontSize:     FONT_SIZES.sm + 1,
    cursor:       "pointer",
  },
  dangerBtn: {
    display:        "flex",
    alignItems:     "center",
    gap:            SPACING.xs,
    padding:        `${SPACING.sm}px ${SPACING.md}px`,
    borderRadius:   10,
    background:     COLORS.error,
    border:         "none",
    color:          COLORS.white,
    fontWeight:     600,
    fontSize:       FONT_SIZES.sm + 1,
    cursor:         "pointer",
  },
  errorText: {
    color:     COLORS.error,
    fontSize:  FONT_SIZES.sm + 1,
    marginTop: SPACING.sm,
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
    marginTop:      SPACING.md,
  },
} as const;
