// 1. Imports — External
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { ReactNode }     from "react";
import type { Session, User } from "@supabase/supabase-js";

// 1. Imports — Local
import { supabase } from "../lib/supabase";

// 2. Interfaces
interface AuthContextValue {
  /** Active Supabase session, or null when logged out. */
  session: Session | null;
  /** Convenience alias for session.user — null when logged out. */
  user:    User | null;
  /**
   * True only during the initial getSession() call on first mount.
   * Use this to avoid rendering protected content before the auth state is known.
   */
  loading: boolean;
}

// 3. Context — default assumes "logged out, not yet loaded"
const AuthContext = createContext<AuthContextValue>({
  session: null,
  user:    null,
  loading: true,
});

// 4. Provider
/**
 * Wraps the application tree and exposes live Supabase session state globally.
 *
 * On mount: calls getSession() once to rehydrate any session stored by the
 * Supabase JS client (localStorage) so users stay logged in on page refresh.
 *
 * During runtime: subscribes to onAuthStateChange to propagate login, logout,
 * and token-refresh events to all consumers.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate any persisted session — resolves immediately from localStorage
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Keep session current for login / logout / token-refresh events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, user: session?.user ?? null, loading }),
    [session, loading],
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
