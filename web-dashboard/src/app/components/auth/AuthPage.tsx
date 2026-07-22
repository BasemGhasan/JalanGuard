// 1. Imports — External
import { useState, useCallback, useMemo } from "react";
import {
  Shield, Mail, Lock, KeyRound,
} from "lucide-react";
import { toast } from "sonner";

// 1. Imports — Local constants / hooks / types
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from "../../../constants/theme";
import { supabase } from "../../../lib/supabase";
import type { Page } from "../Navbar";

// 1. Imports — Local components
import ErrorBanner from "../ui/errorBanner";
import { Card } from "../ui/card";
import { AppButton } from "../ui/appButton";

// 2. Constants / Interfaces / Types

/** Length of the token Supabase emits via `{{ .Token }}` in the email templates. */
const CODE_LENGTH = 8;

/**
 * Internal view states.
 *
 * There is no independent web signup. A JalanGuard account can only be
 * *created* on mobile — the web dashboard exists to add developer access to
 * an account that already exists, using the same email/password. Logging in
 * here for the first time grants that access automatically; every later
 * login is a normal sign-in. See `handleLogin`.
 *
 * "forgot-code"    — exchange the recovery code for a session.
 * "password-reset" — set the new password (reached via PASSWORD_RECOVERY, which
 *                    verifyOtp fires once the recovery code is accepted).
 */
export type AuthView =
  | "login"
  | "forgot"
  | "forgot-code"
  | "password-reset";

interface AuthPageProps {
  onNavigate: (p: Page) => void;
  /** Override the starting view — used by AppInner for the password-recovery flow. */
  initialView?: AuthView;
}

interface AuthFieldProps {
  icon: React.ComponentType<{ size?: number | string; color?: string }>;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

// 3. Sub-components — shared UI atoms

/**
 * Labeled input row with a leading icon and amber focus-border feedback.
 * Manages its own focused state so the border color can be driven from
 * COLORS constants rather than being hardcoded in a Tailwind class.
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

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

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

/** Styles shared between AuthField */
const fieldStyles = {
  label: {
    display: "block",
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm + 1,
    fontWeight: 600,
    marginBottom: SPACING.xs,
  },
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: SPACING.sm + 4,
    background: COLORS.primary,
    borderRadius: 12,
    border: `1px solid ${COLORS.borderSoft}`,
    padding: `${SPACING.sm + 4}px ${SPACING.md}px`,
    transition: "border-color 0.15s ease",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md - 1,
    fontFamily: "inherit",
  },
} as const;

// 4. Main Component
/**
 * Centralised authentication page.
 *
 * Hosts all auth views inside a single dark-themed card:
 * login          — email + password → signInWithPassword, then grants the
 *                  developer role if this is the account's first web login
 * forgot         — email → resetPasswordForEmail
 * forgot-code    — 8-digit code → verifyOtp({ type: "recovery" })
 * password-reset — new-password + confirm → updateUser (PASSWORD_RECOVERY flow)
 *
 * No flow uses an emailed link: every confirmation is a typed code, so nothing
 * depends on a redirect URL being reachable from the user's device.
 *
 * The parent passes `initialView` to force the card into a specific view, and
 * `onNavigate` to redirect the user after a successful action.
 */
export function AuthPage({ onNavigate, initialView }: AuthPageProps) {
  const [view, setView] = useState<AuthView>(initialView ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // ── Input change handlers ────────────────────────────────────────────────
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), [],
  );
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), [],
  );
  const handleNewPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value), [],
  );
  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value), [],
  );
  /** Digits only, capped at CODE_LENGTH — the emailed token is always an 8-digit number. */
  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH)), [],
  );

  // ── View switching — always clear errors on transition ───────────────────
  const switchTo = useCallback((v: AuthView) => {
    setView(v);
    setError(null);
    setNotice(null);
  }, []);

  const handleSwitchToLogin = useCallback(() => switchTo("login"), [switchTo]);
  const handleSwitchToForgot = useCallback(() => switchTo("forgot"), [switchTo]);

  // ── Auth actions ─────────────────────────────────────────────────────────
  /**
   * The only way in on web. A JalanGuard account can only be *created* on
   * mobile (auth.users ties one email to one login, so there's nothing left
   * for a web "sign up" to create); this sign-in doubles as developer
   * registration by granting the role the first time it succeeds for an
   * account that doesn't have it yet.
   */
  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(), password,
    });

    if (authError) {
      setLoading(false);
      setError("Incorrect email or password.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_developer")
      .eq("id", data.user.id)
      .single();

    if (!profile?.is_developer) {
      const { error: grantError } = await supabase.rpc("grant_account_role", { target_role: "developer" });
      if (grantError) {
        setLoading(false);
        setError(grantError.message);
        return;
      }
      toast.success("Developer access added to your JalanGuard account.");
    }

    setLoading(false);
    onNavigate("key");
  }, [email, password, onNavigate]);

  const handleForgot = useCallback(async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);

    // No redirectTo: the recovery email carries a code, not a link.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setCode("");
      switchTo("forgot-code");
    }
  }, [email, switchTo]);

  /**
   * Exchanges the recovery code for a session.
   *
   * verifyOtp with type "recovery" fires PASSWORD_RECOVERY, which flips
   * `needsPasswordReset` in AuthContext — App then re-renders this page in
   * "password-reset" mode, so there's no manual view switch here.
   */
  const handleVerifyRecovery = useCallback(async () => {
    if (code.length !== CODE_LENGTH) {
      setError(`Please enter the ${CODE_LENGTH}-digit code from your email.`);
      return;
    }
    setLoading(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "recovery",
    });

    setLoading(false);

    if (verifyError) setError(verifyError.message);
  }, [code, email]);

  /** Re-sends the recovery code. */
  const handleResendCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);

    const { error: resendError } = await supabase.auth.resetPasswordForEmail(email.trim());

    setLoading(false);

    if (resendError) setError(resendError.message);
    else setNotice(`We sent a new code to ${email.trim()}.`);
  }, [email]);

  /**
   * Commits the new password on the live recovery session established by
   * handleVerifyRecovery. The USER_UPDATED event clears needsPasswordReset in
   * AuthContext automatically.
   */
  const handlePasswordReset = useCallback(async () => {
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      toast.success("Password updated!", {
        description: "You're now signed in with your new password.",
      });
      onNavigate("key");
    }
  }, [newPassword, confirmPassword, onNavigate]);

  /** Submit the active form on Enter key. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter" || loading) return;
      if (view === "login") void handleLogin();
      if (view === "forgot") void handleForgot();
      if (view === "forgot-code") void handleVerifyRecovery();
      if (view === "password-reset") void handlePasswordReset();
    },
    [view, loading, handleLogin, handleForgot, handleVerifyRecovery, handlePasswordReset],
  );

  // ── Derived: card title / subtitle per view ──────────────────────────────
  const { title, subtitle } = useMemo(() => {
    const map: Record<AuthView, { title: string; subtitle: string }> = {
      "login": {
        title: "Developer Dashboard",
        subtitle: "Sign in with your mobile JalanGuard account.",
      },
      "forgot": { title: "Reset Password", subtitle: `We'll email you an ${CODE_LENGTH}-digit reset code.` },
      "forgot-code": { title: "Enter Reset Code", subtitle: `Enter the ${CODE_LENGTH}-digit code we sent to ${email.trim()}.` },
      "password-reset": { title: "Set New Password", subtitle: "Choose a strong password for your account." },
    };
    return map[view];
  }, [view, email]);

  // ── Derived: CTA label ───────────────────────────────────────────────────
  const ctaLabel = useMemo(() => {
    if (view === "forgot") return "Send Reset Code";
    if (view === "forgot-code") return "Verify Code";
    if (view === "password-reset") return "Set New Password";
    return "Login";
  }, [view]);

  // ── Derived: which action the CTA fires ─────────────────────────────────
  const handleCta = useMemo(() => {
    if (view === "forgot") return handleForgot;
    if (view === "forgot-code") return handleVerifyRecovery;
    if (view === "password-reset") return handlePasswordReset;
    return handleLogin;
  }, [view, handleForgot, handleVerifyRecovery, handlePasswordReset, handleLogin]);

  const isCodeView = view === "forgot-code";
  /** Views that ask for an email address up front. */
  const showsEmailField = view === "login" || view === "forgot";

  return (
    <div style={styles.page} className="jg-auth-page jg-page-shell">
      <Card style={styles.card} className="jg-auth-card" onKeyDown={handleKeyDown}>

        {/* ── Brand header ──────────────────────────────────────────────── */}
        <div style={styles.brand}>
          <div style={styles.iconWrap}>
            <Shield size={28} color={COLORS.white} />
          </div>
          <span style={styles.brandTag}>JalanGuard</span>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>

        {/* ── Form views ───────────────────────────────────────────────────
            Every view is a form: the old "check your email" dead ends are
            replaced by code-entry views. */}
        <div style={styles.form}>
            {error && <ErrorBanner message={error} />}
            {notice && <p style={styles.notice}>{notice}</p>}

            {/* Login + Forgot: Email */}
            {showsEmailField && (
              <AuthField
                icon={Mail} label="Email Address" type="email"
                placeholder="you@example.com"
                value={email} onChange={handleEmailChange} disabled={loading}
              />
            )}

            {/* Code view: the 8-digit token from the email */}
            {isCodeView && (
              <AuthField
                icon={KeyRound} label="Verification Code" type="text"
                placeholder={"0".repeat(CODE_LENGTH)}
                value={code} onChange={handleCodeChange} disabled={loading}
              />
            )}

            {/* Login only: Password */}
            {view === "login" && (
              <AuthField
                icon={Lock} label="Password" type="password"
                placeholder="••••••••••••"
                value={password} onChange={handlePasswordChange} disabled={loading}
              />
            )}

            {/* Password Reset: New Password + Confirm */}
            {view === "password-reset" && (
              <>
                <AuthField
                  icon={Lock} label="New Password" type="password"
                  placeholder="At least 8 characters"
                  value={newPassword} onChange={handleNewPasswordChange} disabled={loading}
                />
                <AuthField
                  icon={Lock} label="Confirm Password" type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword} onChange={handleConfirmPasswordChange} disabled={loading}
                />
              </>
            )}

            {/* Login only: forgot-password link */}
            {view === "login" && (
              <div style={{ textAlign: "right" }}>
                <button style={styles.linkBtn} onClick={handleSwitchToForgot} disabled={loading}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Primary CTA */}
            <AppButton
              variant="primary"
              fullWidth
              onClick={handleCta}
              loading={loading}
              style={styles.ctaBtn}
            >
              {loading ? "Processing…" : ctaLabel}
            </AppButton>

            {/* Code view: resend */}
            {isCodeView && (
              <button style={styles.linkBtn} onClick={handleResendCode} disabled={loading}>
                Didn't get the code? Resend
              </button>
            )}

            {/* Footer */}
            {view !== "password-reset" && (
              <div style={styles.footer}>
                {view === "login" && (
                  <span style={styles.footerText}>
                    Don't have a JalanGuard account? Create one in the mobile app.
                  </span>
                )}
                {(view === "forgot" || isCodeView) && (
                  <button style={styles.footerLink} onClick={handleSwitchToLogin}>
                    ← Back to Login
                  </button>
                )}
              </div>
            )}
        </div>
      </Card>
    </div>
  );
}

// 5. Styles
const styles = {
    page: {
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: `${SPACING.xl}px ${SPACING.lg}px`,
      background: COLORS.background,
    },
    /** Page-specific overrides merged over the shared Card base. */
    card: {
      width: 440,
      padding: `${SPACING.xl + SPACING.md}px ${SPACING.xl}px`,
    },
    brand: {
      textAlign: "center" as const,
      marginBottom: SPACING.xl,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 16,
      background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondaryDeep})`,
      boxShadow: `0 8px 24px ${COLORS.accentGlow}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto",
      marginBottom: SPACING.md,
    },
    brandTag: {
      display: "block",
      color: COLORS.textMuted,
      fontSize: FONT_SIZES.sm,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      marginBottom: SPACING.xs,
    },
    title: {
      color: COLORS.textPrimary,
      fontSize: FONT_SIZES.xl + 4,
      fontWeight: 700,
      margin: `${SPACING.xs}px 0`,
    },
    subtitle: {
      color: COLORS.textMuted,
      fontSize: FONT_SIZES.sm + 2,
      margin: 0,
    },
    form: {
      display: "flex",
      flexDirection: "column" as const,
      gap: SPACING.md,
    },
    /** Overrides merged over the shared AppButton primary variant. */
    ctaBtn: {
      boxShadow: SHADOWS.glowLg,
      marginTop: SPACING.xs,
    },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.sm,
      paddingTop: SPACING.md,
      borderTop: `1px solid ${COLORS.borderFaint}`,
      textAlign: "center" as const,
    },
    footerText: {
      color: COLORS.textMuted,
      fontSize: FONT_SIZES.sm + 2,
    },
    footerLink: {
      background: "transparent",
      border: "none",
      color: COLORS.secondary,
      fontSize: FONT_SIZES.sm + 2,
      fontWeight: 600,
      cursor: "pointer",
      padding: 0,
    },
    linkBtn: {
      background: "transparent",
      border: "none",
      color: COLORS.textMuted,
      fontSize: FONT_SIZES.sm + 2,
      cursor: "pointer",
      padding: 0,
    },
    /** Non-error feedback, e.g. confirmation that a new code was sent. */
    notice: {
      margin: 0,
      color: COLORS.success,
      fontSize: FONT_SIZES.sm + 2,
      textAlign: "center" as const,
    },
  } as const;
