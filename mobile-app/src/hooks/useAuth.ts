import { useCallback, useState } from 'react';
import { AuthState } from '../types';
import * as authService from '../services';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [loadingState, setLoadingState] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    setLoadingState(true);
    try {
      const state = await authService.getAuthState();
      setAuthState(state);
    } finally {
      setLoadingState(false);
    }
  }, []);

  const login = useCallback(async (email: string) => {
    setLoadingState(true);
    try {
      const state = await authService.signIn(email);
      setAuthState(state);
    } finally {
      setLoadingState(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoadingState(true);
    try {
      const state = await authService.signOut();
      setAuthState(state);
    } finally {
      setLoadingState(false);
    }
  }, []);

  return {
    ...authState,
    loadingState,
    checkAuthStatus,
    login,
    logout,
  };
}
