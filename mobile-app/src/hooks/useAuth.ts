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
    } = authService.onAuthStateChange(setAuthState);
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

  return { ...authState, loadingState, checkAuthStatus, login, register, logout };
}
