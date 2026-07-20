// 1. Imports — External
import { useState, useCallback, useEffect, useRef } from "react";
import { Toaster } from "sonner";

// 1. Imports — Local context / hooks
import { AuthProvider, useAuth } from "../context/AuthContext";
import { INITIAL_HASH_TYPE, IS_SUPABASE_CONFIGURED } from "../lib/supabase";

// 1. Imports — Components
import { Navbar } from "./components/Navbar";
import type { Page } from "./components/Navbar";
import { MapPage } from "./components/MapPage";
import { DocsPage } from "./components/DocsPage";
import { KeyPage } from "./components/KeyPage";
import { AuthPage } from "./components/auth/AuthPage";
import { DataExplorer } from "./components/dataExplorer/DataExplorer";

// 1. Imports — Constants
import { COLORS } from "../constants/theme";

// 2. Inner shell — must live inside AuthProvider to call useAuth()
/**
 * AppInner owns the page routing state and wires up four redirect effects:
 *
 * 1. Email confirmation — when the user arrives from a signup confirmation email
 *    (INITIAL_HASH_TYPE === "signup"), redirect to developer settings once the
 *    session is established.
 *
 * 2. Password recovery — when needsPasswordReset is true (PASSWORD_RECOVERY event
 *    fired), force-navigate to the auth page in "password-reset" mode. AuthPage
 *    calls supabase.auth.updateUser(); on success onNavigate("key") is called and
 *    the USER_UPDATED event clears needsPasswordReset in the context.
 *
 * 3. Session expiry — redirect away from the protected "key" and "docs" pages if
 *    the session is lost (e.g. token expired, manual sign-out from another tab).
 *    Docs covers the developer API, so it's gated the same as the key page —
 *    not just unlinked from the navbar, but unreachable once logged out.
 *
 * 4. Post-auth redirect — the authoritative router to "key" once a session
 *    exists. AuthPage's own handlers also call onNavigate("key") right after
 *    a successful sign-in, but that update and the session update from
 *    onAuthStateChange land as two separate state updates; if this effect's
 *    session update were to land after the handler's setPage("key"), Effect 3
 *    above would see (page==="key" && !session) for one render and bounce
 *    straight back to "auth", leaving the user stuck on the login form despite
 *    a real session existing until they refreshed manually. This effect is the
 *    fallback that guarantees a hand-off to "key" always completes, regardless
 *    of which of the two updates lands first.
 */
function AppInner() {
  const { session, loading: authLoading, needsPasswordReset } = useAuth();
  const [page, setPage] = useState<Page>("map");

  /**
   * Guard against running the email-confirmation redirect more than once.
   * useRef persists across renders without causing a re-render of its own.
   */
  const emailConfirmHandledRef = useRef(false);

  // ── Effect 1: Email-confirmation redirect ────────────────────────────────
  useEffect(() => {
    if (emailConfirmHandledRef.current) return;
    if (!authLoading && session && INITIAL_HASH_TYPE === "signup") {
      emailConfirmHandledRef.current = true;
      setPage("key");
    }
  }, [authLoading, session]);

  // ── Effect 2: Password-recovery redirect ─────────────────────────────────
  useEffect(() => {
    if (needsPasswordReset && page !== "auth") {
      setPage("auth");
    }
  }, [needsPasswordReset, page]);

  // ── Effect 3: Session-expiry guard ───────────────────────────────────────
  useEffect(() => {
    if (!session && (page === "key" || page === "docs")) setPage("auth");
  }, [session, page]);

  // ── Effect 4: Post-auth redirect ─────────────────────────────────────────
  useEffect(() => {
    if (session && page === "auth" && !needsPasswordReset) setPage("key");
  }, [session, page, needsPasswordReset]);

  /** Central navigation handler. The session guard logic was moved to render. */
  const navigate = useCallback(
    (p: Page) => {
      setPage(p);
    },
    [],
  );

  return (
    <div style={styles.root}>
      <Navbar active={page} onNavigate={navigate} />

      {!IS_SUPABASE_CONFIGURED && (
        <div style={styles.notice}>
          Supabase env vars are missing. The dashboard shell still loads, but auth and live data stay disabled until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
        </div>
      )}

      {page === "map" && <MapPage />}
      {/* Route guards during render */}
      {page === "docs" && session && <DocsPage />}
      {page === "key" && session && <KeyPage onNavigate={navigate} />}
      {(page === "auth" || (page === "key" && !session) || (page === "docs" && !session)) && (
        <AuthPage
          /**
           * key forces a fresh mount (and therefore a fresh useState) whenever
           * the recovery flag changes, ensuring the password-reset view is shown
           * even if the user was already on the auth page.
           */
          key={needsPasswordReset ? "password-reset" : "auth"}
          initialView={needsPasswordReset ? "password-reset" : undefined}
          onNavigate={navigate}
        />
      )}
      {page === "explorer" && <DataExplorer />}

      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: COLORS.surface,
            border: `1px solid ${COLORS.borderSoft}`,
            color: COLORS.textPrimary,
          },
        }}
      />
    </div>
  );
}

// 3. Root App — wraps the whole tree in the auth provider
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

// 4. Styles
const styles = {
  root: {
    width: "100%",
    minHeight: "100vh",
    background: COLORS.background,
    fontFamily: "Inter, system-ui, sans-serif",
    overflow: "hidden",
  },
  notice: {
    padding: "12px 32px",
    background: COLORS.surface,
    borderBottom: `1px solid ${COLORS.borderSoft}`,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 1.5,
  },
} as const;
