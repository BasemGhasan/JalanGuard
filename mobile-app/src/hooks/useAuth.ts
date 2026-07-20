import { useCallback, useEffect, useState } from 'react';
import { AuthState } from '../types';
import * as authService from '../services';

const INITIAL_STATE: AuthState = { isAuthenticated: false, user: null };

/**
 * Global auth hook backed by Supabase.
 *
 * Ported from the web dashboard's AuthContext: rehydrates the persisted session
 * on mount and subscribes to Supabase auth events so login/logout anywhere
 * propagates reactively — no manual state juggling after each action.
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(INITIAL_STATE);
  const [loadingState, setLoadingState] = useState(false);
  // A recovery code produces a real session, but the user hasn't chosen a new
  // password yet — treating it as signed in would drop them into the app with
  // the forgotten password still active. Held until USER_UPDATED commits one.
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);

  // Rehydrate the persisted session (used by App.tsx during the splash gate).
  const checkAuthStatus = useCallback(async () => {
    setLoadingState(true);
    try {
      setAuthState(await authService.getAuthState());
    } finally {
      setLoadingState(false);
    }
  }, []);

  // Keep auth state in sync with Supabase for the lifetime of the app.
  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange((state, event) => {
      setAuthState(state);
      // Any subsequent event (USER_UPDATED after the new password is set, a
      // normal sign-in, or a sign-out) ends the recovery hold.
      setNeedsPasswordReset(event === 'PASSWORD_RECOVERY');
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoadingState(true);
    try {
      await authService.signIn(email, password);
    } finally {
      setLoadingState(false);
    }
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      setLoadingState(true);
      try {
        return await authService.signUp(fullName, email, password);
      } finally {
        setLoadingState(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setLoadingState(true);
    try {
      await authService.signOut();
    } finally {
      setLoadingState(false);
    }
  }, []);

  return {
    ...authState,
    // Hold the user in the auth stack until the recovery password is committed.
    isAuthenticated: authState.isAuthenticated && !needsPasswordReset,
    needsPasswordReset,
    loadingState,
    checkAuthStatus,
    login,
    register,
    logout,
  };
}
