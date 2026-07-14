/**
 * Authentication service — direct Supabase BaaS.
 *
 * Ported from the web dashboard (AuthPage + AuthContext auth calls) and adapted
 * for React Native. All auth goes straight to Supabase Auth; there is no custom
 * backend in between. Session persistence is handled by the RN client
 * (AsyncStorage) configured in `./supabase`.
 */
import type { Session } from '@supabase/supabase-js';

import { supabase } from './supabase';
import { AuthState, UserProfile } from '../types';

/**
 * Normalises the low-level errors supabase-js surfaces on a stalled/aborted
 * request (the timeout wrapper in `./supabase` aborts after 15s) into a single
 * human-readable message, so screens show "check your connection" instead of a
 * cryptic "Aborted" / "Network request failed".
 */
function toFriendlyError(error: unknown): Error {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      error.name === 'AbortError' ||
      msg.includes('abort') ||
      msg.includes('network request failed') ||
      msg.includes('failed to fetch')
    ) {
      return new Error(
        'Could not reach the server. Check your internet connection and try again.',
      );
    }
    return error;
  }
  return new Error('Something went wrong. Please try again.');
}

/** Maps a Supabase session to the app's AuthState shape. */
function toAuthState(session: Session | null): AuthState {
  if (!session?.user) {
    return { isAuthenticated: false, user: null };
  }

  const { id, email, user_metadata } = session.user;
  const user: UserProfile = {
    id,
    email: email ?? '',
    name: (user_metadata?.full_name as string | undefined) ?? email?.split('@')[0] ?? 'User',
  };

  return { isAuthenticated: true, user };
}

/** Current auth state, rehydrated from the persisted session on cold start. */
export async function getAuthState(): Promise<AuthState> {
  const { data } = await supabase.auth.getSession();
  return toAuthState(data.session);
}

/** Email + password sign-in. Throws on failure so the screen can surface it. */
export async function signIn(email: string, password: string): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  } catch (error) {
    throw toFriendlyError(error);
  }
}

/**
 * Registers a citizen account. Unlike the web dashboard (which sets
 * role: 'developer'), mobile users are citizens, so we omit the role and let
 * the `handle_new_user` trigger assign the default citizen profile.
 *
 * @returns needsConfirmation — true when email confirmation is required (no
 *          session was returned), so the UI can tell the user to check email.
 */
export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<{ needsConfirmation: boolean }> {
  let data;
  try {
    const result = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (result.error) throw result.error;
    data = result.data;
  } catch (error) {
    throw toFriendlyError(error);
  }

  // Supabase returns a user with an empty identities array when the email is
  // already registered (it does not error, for privacy reasons).
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error('This email is already registered. Please log in.');
  }

  return { needsConfirmation: !data.session };
}

/** Sends a password-reset email. */
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
  if (error) throw error;
}

/** Ends the session and clears the persisted tokens. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Permanently deletes the current account. Ported from the web dashboard's
 * `useDeleteAccount`:
 *   1. Re-authenticates with the supplied password to confirm identity.
 *   2. Calls the `delete_user` RPC (removes the auth user; cascades to profiles).
 *   3. Signs out locally.
 *
 * Throws with a user-facing message on any failure so the modal can show it.
 */
export async function deleteAccount(email: string, password: string): Promise<void> {
  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) throw new Error('Incorrect password. Please try again.');

    const { error: rpcError } = await supabase.rpc('delete_user');
    if (rpcError) throw new Error(`Failed to delete account: ${rpcError.message}`);

    await supabase.auth.signOut();
  } catch (error) {
    throw toFriendlyError(error);
  }
}

/**
 * Subscribes to auth changes (login / logout / token refresh) so the app tree
 * updates reactively. Mirrors the web AuthContext's onAuthStateChange listener.
 */
export function onAuthStateChange(callback: (state: AuthState) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(toAuthState(session)));
}
