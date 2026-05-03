// 1. Imports — External
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { ReactNode }     from "react";
import type { Session, User } from "@supabase/supabase-js";

// 1. Imports — Local
import { supabase } from "../lib/supabase";

// 2. Interfaces
interface AuthContextValue {
  /** Active Supabase session, or null when logged out. */
  session:            Session | null;
  /** Convenience alias for session.user — null when logged out. */
  user:               User | null;
  /**
   * True only during the initial getSession() call on first mount.
   * Prevents rendering protected content before the auth state is known.
   */
  loading:            boolean;
  /**
   * True while the user is in a PASSWORD_RECOVERY session — i.e. they clicked
   * the password-reset link in their email and arrived at the app with a
   * short-lived recovery token. Cleared when USER_UPDATED or SIGNED_OUT fires.
   */
  needsPasswordReset: boolean;
}

// 3. Context — default assumes "logged out, not yet loaded"
const AuthContext = createContext<AuthContextValue>({
  session:            null,
  user:               null,
  loading:            true,
  needsPasswordReset: false,
});

// 4. Provider
/**
 * Wraps the application tree and exposes live Supabase session state globally.
 *
 * On mount: calls getSession() once to rehydrate any session stored by the
 * Supabase JS client (localStorage) so users stay logged in on page refresh.
 *
 * During runtime: subscribes to onAuthStateChange to propagate login, logout,
 * token-refresh, and password-recovery events to all consumers.
 *
 * needsPasswordReset lifecycle:
 *   PASSWORD_RECOVERY → true
 *   USER_UPDATED | SIGNED_OUT → false
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session,            setSession]            = useState<Session | null>(null);
  const [loading,            setLoading]            = useState(true);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);

  useEffect(() => {
    // Rehydrate any persisted session — resolves immediately from localStorage
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Keep session current for all auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);

      if (event === "PASSWORD_RECOVERY") {
        // User arrived via a password-reset email link
        setNeedsPasswordReset(true);
      } else if (event === "USER_UPDATED" || event === "SIGNED_OUT") {
        // Password was changed or user signed out — recovery session is over
        setNeedsPasswordReset(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, user: session?.user ?? null, loading, needsPasswordReset }),
    [session, loading, needsPasswordReset],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 5. Hook
/** Returns the current Supabase auth state from anywhere in the component tree. */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
