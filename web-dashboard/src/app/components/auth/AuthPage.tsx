// 1. Imports — External
import { useState, useCallback, useMemo } from "react";
import {
  Shield, Mail, Lock, User,
  AlertCircle, Loader2, CheckCircle, ChevronRight,
} from "lucide-react";

// 1. Imports — Local constants / hooks / types
import { COLORS, SPACING, FONT_SIZES } from "../../../constants/theme";
import { supabase }                    from "../../../lib/supabase";
import type { Page }                   from "../Navbar";

// 2. Interfaces / Types
/** Internal view states — "signup-sent" and "forgot-sent" are success screens. */
type AuthView = "login" | "signup" | "forgot" | "signup-sent" | "forgot-sent";

interface AuthPageProps {
  onNavigate: (p: Page) => void;
}

interface AuthFieldProps {
  icon:        React.ComponentType<{ size?: number; color?: string }>;
  label:       string;
  type:        string;
  placeholder: string;
  value:       string;
  onChange:    (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?:   boolean;
}

// 3. Sub-components — shared UI atoms

/**
 * Labeled input row with a leading icon and amber focus-border feedback.
 * Uses local focus state instead of CSS pseudo-classes so all color tokens
 * stay in the theme file rather than being hardcoded in className strings.
 */
function AuthField({
  icon: Icon,
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled,
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => setFocused(true),  []);
  const handleBlur  = useCallback(() => setFocused(false), []);

  const wrapStyle = useMemo(() => ({
    ...fieldStyles.wrap,
    borderColor: focused ? `${COLORS.secondary}99` : COLORS.borderSoft,
  }), [focused]);

  return (
    <div>
      <label style={fieldStyles.label}>{label}</label>
      <div style={wrapStyle}>
        <Icon size={16} color={COLORS.textMuted} />
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          style={fieldStyles.input}
        />
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={fieldStyles.errorBanner}>
      <AlertCircle size={15} color={COLORS.error} style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
}

/** Styles shared between AuthField and ErrorBanner sub-components. */
const fieldStyles = {
  label: {
    display:      "block",
    color:        COLORS.textMuted,
    fontSize:     FONT_SIZES.sm + 1,
    fontWeight:   600,
    marginBottom: SPACING.xs,
  },
  wrap: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.sm + 4,
    background:   COLORS.primary,
    borderRadius: 12,
    border:       `1px solid ${COLORS.borderSoft}`,
    padding:      `${SPACING.sm + 4}px ${SPACING.md}px`,
    transition:   "border-color 0.15s ease",
  },
  input: {
    flex:       1,
    background: "transparent",
    border:     "none",
    outline:    "none",
    color:      COLORS.textPrimary,
    fontSize:   FONT_SIZES.md - 1,
    fontFamily: "inherit",
  },
  errorBanner: {
    display:      "flex",
    alignItems:   "center",
    gap:          SPACING.sm,
    padding:      `${SPACING.sm + 2}px ${SPACING.md}px`,
    borderRadius: 12,
    background:   COLORS.errorBg,
    border:       `1px solid ${COLORS.errorBorder}`,
    color:        COLORS.error,
    fontSize:     FONT_SIZES.sm + 1,
  },
} as const;

// 4. Main Component
/**
 * Centralized authentication page.
 *
 * Hosts three distinct form views — Login, Sign Up, Forgot Password — inside
 * a single dark-themed card. View toggling is managed by local state; the
 * parent only receives `onNavigate` to redirect after a successful action.
 *
 * Success states ("signup-sent", "forgot-sent") replace the form with a
 * confirmation screen without unmounting the card.
 */
export function AuthPage({ onNavigate }: AuthPageProps) {
  const [view,     setView]     = useState<AuthView>("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // ── Input change handlers ────────────────────────────────────────────────
  const handleEmailChange    = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    [],
  );
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    [],
  );
  const handleFullNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value),
    [],
  );

  // ── View switching — always clear errors when changing views ────────────
  const switchTo = useCallback((v: AuthView) => {
    setView(v);
    setError(null);
  }, []);

  const handleSwitchToLogin  = useCallback(() => switchTo("login"),  [switchTo]);
  const handleSwitchToSignUp = useCallback(() => switchTo("signup"), [switchTo]);
  const handleSwitchToForgot = useCallback(() => switchTo("forgot"), [switchTo]);

  // ── Auth actions ─────────────────────────────────────────────────────────
  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      onNavigate("key");
    }
  }, [email, password, onNavigate]);

  const handleSignUp = useCallback(async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signUp({
      email:    email.trim(),
      password,
      options:  { data: { full_name: fullName.trim() } },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setView("signup-sent");
    }
  }, [fullName, email, password]);

  const handleForgot = useCallback(async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/auth/reset` },
    );
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setView("forgot-sent");
    }
  }, [email]);

  /** Submit the active form when the user presses Enter. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter" || loading) return;
      if (view === "login")  void handleLogin();
      if (view === "signup") void handleSignUp();
      if (view === "forgot") void handleForgot();
    },
    [view, loading, handleLogin, handleSignUp, handleForgot],
  );

  // ── Derived: card title and subtitle per view ────────────────────────────
  const { title, subtitle } = useMemo(() => {
    const map: Record<AuthView, { title: string; subtitle: string }> = {
      "login":       { title: "Welcome Back",       subtitle: "Sign in to your developer account."          },
      "signup":      { title: "Create Account",     subtitle: "Join the open-source road safety ecosystem." },
      "forgot":      { title: "Reset Password",     subtitle: "We'll email you a secure reset link."        },
      "signup-sent": { title: "Check Your Email",   subtitle: "Tap the confirmation link to activate."      },
      "forgot-sent": { title: "Reset Link Sent",    subtitle: "Check your inbox and click the link."        },
    };
    return map[view];
  }, [view]);

  // ── Derived: CTA button label ────────────────────────────────────────────
  const ctaLabel = useMemo(() => {
    if (view === "signup") return "Create Account";
    if (view === "forgot") return "Send Reset Link";
    return "Login";
  }, [view]);

  // ── Derived: which action the CTA button fires ───────────────────────────
  const handleCta = useMemo(() => {
    if (view === "signup") return handleSignUp;
    if (view === "forgot") return handleForgot;
    return handleLogin;
  }, [view, handleSignUp, handleForgot, handleLogin]);

  const isFormView = view === "login" || view === "signup" || view === "forgot";

  return (
    <div style={styles.page}>
      <div style={styles.card} onKeyDown={handleKeyDown}>

        {/* ── Brand header ──────────────────────────────────────────────── */}
        <div style={styles.brand}>
          <div style={styles.iconWrap}>
            <Shield size={28} color={COLORS.white} />
          </div>
          <span style={styles.brandTag}>JalanGuard</span>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>

        {/* ── Success states ────────────────────────────────────────────── */}
        {!isFormView && (
          <div style={styles.successWrap}>
            <div style={styles.successIcon}>
              <CheckCircle size={28} color={COLORS.success} />
            </div>
            <button style={styles.linkBtn} onClick={handleSwitchToLogin}>
              Back to Login{" "}
              <ChevronRight size={13} style={{ display: "inline", verticalAlign: "middle" }} />
            </button>
          </div>
        )}

        {/* ── Active form views ─────────────────────────────────────────── */}
        {isFormView && (
          <div style={styles.form}>
            {error && <ErrorBanner message={error} />}

            {/* Sign Up only: Full Name */}
            {view === "signup" && (
              <AuthField
                icon={User}
                label="Full Name"
                type="text"
                placeholder="Ada Lovelace"
                value={fullName}
                onChange={handleFullNameChange}
                disabled={loading}
              />
            )}

            {/* All views: Email */}
            <AuthField
              icon={Mail}
              label="Email Address"
              type="email"
              placeholder="developer@example.com"
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
            />

            {/* Login + Sign Up only: Password */}
            {(view === "login" || view === "signup") && (
              <AuthField
                icon={Lock}
                label="Password"
                type="password"
                placeholder={view === "signup" ? "At least 8 characters" : "••••••••••••"}
                value={password}
                onChange={handlePasswordChange}
                disabled={loading}
              />
            )}

            {/* Login only: forgot-password link */}
            {view === "login" && (
              <div style={{ textAlign: "right" }}>
                <button
                  style={styles.linkBtn}
                  onClick={handleSwitchToForgot}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Primary CTA */}
            <button
              style={{
                ...styles.ctaBtn,
                opacity: loading ? 0.65 : 1,
                cursor:  loading ? "not-allowed" : "pointer",
              }}
              onClick={handleCta}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing…
                </>
              ) : (
                ctaLabel
              )}
            </button>

            {/* Footer: view toggle links */}
            <div style={styles.footer}>
              {view === "login" && (
                <>
                  <span style={styles.footerText}>Don't have an account?</span>
                  <button style={styles.footerLink} onClick={handleSwitchToSignUp}>
                    Register here
                  </button>
                </>
              )}
              {view === "signup" && (
                <>
                  <span style={styles.footerText}>Already have an account?</span>
                  <button style={styles.footerLink} onClick={handleSwitchToLogin}>
                    Login here
                  </button>
                </>
              )}
              {view === "forgot" && (
                <button style={styles.footerLink} onClick={handleSwitchToLogin}>
                  ← Back to Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 5. Styles
const styles = {
  page: {
    minHeight:      "calc(100vh - 64px)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    padding:        `${SPACING.xl}px ${SPACING.lg}px`,
    background:     COLORS.background,
  },
  card: {
    width:        440,
    background:   COLORS.surface,
    border:       `1px solid ${COLORS.borderFaint}`,
    borderRadius: 24,
    padding:      `${SPACING.xl + SPACING.md}px ${SPACING.xl}px`,
    boxShadow:    `0 24px 60px rgba(0,0,0,0.5), 0 0 80px ${COLORS.accentLine}`,
  },
  brand: {
    textAlign:    "center" as const,
    marginBottom: SPACING.xl,
  },
  iconWrap: {
    width:          56,
    height:         56,
    borderRadius:   16,
    background:     `linear-gradient(135deg, ${COLORS.secondary}, #92400E)`,
    boxShadow:      `0 8px 24px ${COLORS.accentGlow}`,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    margin:         "0 auto",
    marginBottom:   SPACING.md,
  },
  brandTag: {
    display:       "block",
    color:         COLORS.textMuted,
    fontSize:      FONT_SIZES.sm,
    fontWeight:    600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    marginBottom:  SPACING.xs,
  },
  title: {
    color:      COLORS.textPrimary,
    fontSize:   FONT_SIZES.xl + 4,
    fontWeight: 700,
    margin:     `${SPACING.xs}px 0`,
  },
  subtitle: {
    color:    COLORS.textMuted,
    fontSize: FONT_SIZES.sm + 2,
    margin:   0,
  },
  form: {
    display:       "flex",
    flexDirection: "column" as const,
    gap:           SPACING.md,
  },
  ctaBtn: {
    width:          "100%",
    padding:        `${SPACING.sm + 6}px`,
    borderRadius:   12,
    background:     COLORS.secondary,
    border:         "none",
    color:          COLORS.white,
    fontSize:       FONT_SIZES.md - 1,
    fontWeight:     600,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            SPACING.sm,
    boxShadow:      `0 8px 24px ${COLORS.accentGlow}`,
    marginTop:      SPACING.xs,
  },
  footer: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            SPACING.sm,
    paddingTop:     SPACING.md,
    borderTop:      `1px solid ${COLORS.borderFaint}`,
  },
  footerText: {
    color:    COLORS.textMuted,
    fontSize: FONT_SIZES.sm + 2,
  },
  footerLink: {
    background: "transparent",
    border:     "none",
    color:      COLORS.secondary,
    fontSize:   FONT_SIZES.sm + 2,
    fontWeight: 600,
    cursor:     "pointer",
    padding:    0,
  },
  linkBtn: {
    background: "transparent",
    border:     "none",
    color:      COLORS.textMuted,
    fontSize:   FONT_SIZES.sm + 2,
    cursor:     "pointer",
    padding:    0,
  },
  successWrap: {
    display:       "flex",
    flexDirection: "column" as const,
    alignItems:    "center",
    gap:           SPACING.md,
    paddingBottom: SPACING.md,
  },
  successIcon: {
    width:          64,
    height:         64,
    borderRadius:   "50%",
    background:     "rgba(16,185,129,0.12)",
    border:         "1px solid rgba(16,185,129,0.25)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
  },
} as const;
