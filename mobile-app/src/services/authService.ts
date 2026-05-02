import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, UserProfile } from '../types';

const AUTH_KEY = 'jalanguard.auth';

const defaultState: AuthState = {
  isAuthenticated: false,
  user: null,
};

export async function getAuthState(): Promise<AuthState> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) return defaultState;

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return defaultState;
  }
}

export async function signIn(email: string): Promise<AuthState> {
  const user: UserProfile = {
    id: `user-${Date.now()}`,
    name: email.split('@')[0] || 'User',
    email,
  };

  const state: AuthState = {
    isAuthenticated: true,
    user,
  };

  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
  return state;
}

export async function signOut(): Promise<AuthState> {
  await AsyncStorage.removeItem(AUTH_KEY);
  return defaultState;
}
