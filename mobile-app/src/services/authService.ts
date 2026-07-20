/**
 * Authentication service — direct Supabase BaaS.
 *
 * Ported from the web dashboard (AuthPage + AuthContext auth calls) and adapted
 * for React Native. All auth goes straight to Supabase Auth; there is no custom
 * backend in between. Session persistence is handled by the RN client
 * (AsyncStorage) configured in `./supabase`.
 */
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { supabase } from './supabase';
import { AuthState, UserProfile } from '../types';
import { toFriendlyError } from '../utils/errors';
import i18n from '../i18n';

/**
 * Thrown when credentials are valid but the address was never confirmed.
 *
 * Screens catch this specifically to route the user to the code-entry screen
 * instead of just showing an error, so an unverified account is recoverable
 * rather than a dead end.
 */
export class EmailNotVerifiedError extends Error {
  constructor(readonly email: string) {
    super(i18n.t('auth.alerts.emailNotVerifiedMessage'));
    this.name = 'EmailNotVerifiedError';
  }
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

/**
 * Email + password sign-in. Throws on failure so the screen can surface it.
 *
 * Supabase only rejects unconfirmed logins when "Confirm email" is enabled on
 * the project, and a link pre-fetched by an email scanner can confirm an
 * address the user never actually opened. So we re-check `email_confirmed_at`
 * on the returned user and tear the session back down if it's unset — the
 * client never trusts an unverified account regardless of project config.
 */
export async function signIn(email: string, password: string): Promise<void> {
  const trimmed = email.trim();

  let data;
  try {
    const result = await supabase.auth.signInWithPassword({ email: trimmed, password });
    if (result.error) throw result.error;
    data = result.data;
  } catch (error) {
    // Supabase's own message when confirmations are enforced server-side.
    if (error instanceof Error && error.message.toLowerCase().includes('email not confirmed')) {
      throw new EmailNotVerifiedError(trimmed);
    }
    throw toFriendlyError(error);
  }

  if (!data.user?.email_confirmed_at) {
    await supabase.auth.signOut();
    throw new EmailNotVerifiedError(trimmed);
  }
}

/**
 * Registers a citizen account. Unlike the web dashboard (which sets
 * role: 'developer'), mobile users are citizens, so we omit the role and let
 * the `handle_new_user` trigger assign the default citizen profile.
 *
 * Supabase Auth ties one email to exactly one login identity — it cannot hold
 * a separate "mobile" account and "web" account for the same address. So an
 * email that's already registered (on either frontend) isn't a new signup at
 * all: it's the same person adding the citizen role to their existing login.
 * Supabase signals this by returning a user with an empty `identities` array
 * instead of erroring (for privacy — it never confirms an email exists via an
 * error message). We confirm it's really them, not a stranger who happens to
 * know their email, by attempting to sign in with the password they just
 * typed: only a match proves ownership, so a role can never be granted to an
 * account without its actual password.
 *
 * @returns needsConfirmation — true only for a genuinely new account pending
 *          email confirmation; false whenever a session already exists,
 *          whether from a fresh autoconfirmed signup or a role grant onto an
 *          existing account.
 */
export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<{ needsConfirmation: boolean }> {
  const trimmedEmail = email.trim();

  let data;
  try {
    const result = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (result.error) throw result.error;
    data = result.data;
  } catch (error) {
    throw toFriendlyError(error);
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return grantCitizenRoleToExistingAccount(trimmedEmail, password);
  }

  return { needsConfirmation: !data.session };
}

/**
 * Proves ownership of an already-registered email (by signing in with the
 * password just entered) and grants the citizen role if the account doesn't
 * already have it. See the `signUp` doc comment for why this exists.
 */
async function grantCitizenRoleToExistingAccount(
  email: string,
  password: string,
): Promise<{ needsConfirmation: boolean }> {
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    throw new Error(i18n.t('auth.alerts.emailAlreadyRegistered'));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_citizen')
    .eq('id', signInData.user.id)
    .single();

  if (!profile?.is_citizen) {
    const { error: grantError } = await supabase.rpc('grant_account_role', {
      target_role: 'citizen',
    });
    if (grantError) throw toFriendlyError(grantError);
  }

  // Already signed in with a real session at this point — nothing left to confirm.
  return { needsConfirmation: false };
}

/**
 * Confirms a signup with the 8-digit code from the email.
 *
 * Mobile deliberately verifies by code rather than by the emailed link: the
 * link's `redirect_to` points at the dashboard's web origin, which a phone on
 * another network can't reach. A code has no such dependency and works in Expo
 * Go over Wi-Fi or cellular. On success Supabase returns a session, so the auth
 * listener signs the user straight into the app.
 *
 * Requires `{{ .Token }}` in the project's "Confirm signup" email template.
 */
export async function verifyEmailCode(email: string, code: string): Promise<void> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'signup',
    });
    if (error) throw error;
  } catch (error) {
    if (error instanceof Error && /expired|invalid/i.test(error.message)) {
      throw new Error(i18n.t('auth.alerts.invalidCodeMessage'));
    }
    throw toFriendlyError(error);
  }
}

/** Re-sends the signup confirmation email (and a fresh code). */
export async function resendVerificationCode(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    if (error) throw error;
  } catch (error) {
    throw toFriendlyError(error);
  }
}

/**
 * Sends a password-reset email carrying an 8-digit recovery code.
 *
 * No `redirectTo` is passed: the project's templates emit codes rather than
 * links, so there is no URL for the user to land on.
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) throw error;
  } catch (error) {
    throw toFriendlyError(error);
  }
}

/**
 * Exchanges a recovery code for a session so the password can be changed.
 *
 * This emits Supabase's PASSWORD_RECOVERY event, which `useAuth` deliberately
 * does *not* treat as being signed in — otherwise the app would drop the user
 * into the main tabs before they've chosen a new password, leaving the
 * forgotten one still active.
 */
export async function verifyPasswordResetCode(email: string, code: string): Promise<void> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'recovery',
    });
    if (error) throw error;
  } catch (error) {
    if (error instanceof Error && /expired|invalid/i.test(error.message)) {
      throw new Error(i18n.t('auth.alerts.invalidCodeMessage'));
    }
    throw toFriendlyError(error);
  }
}

/**
 * Commits a new password during recovery.
 *
 * Unlike `changePassword` this takes no current password — the recovery code
 * already proved control of the mailbox.
 */
export async function setNewPassword(password: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  } catch (error) {
    throw toFriendlyError(error);
  }
}

/**
 * Updates the signed-in user's display name.
 *
 * Written to auth metadata (the source `toAuthState` reads) and mirrored to the
 * `profiles` row so hazards listed by other users show the new name too.
 */
export async function updateDisplayName(userId: string, fullName: string): Promise<void> {
  const name = fullName.trim();
  try {
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (error) throw error;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', userId);
    if (profileError) throw profileError;
  } catch (error) {
    throw toFriendlyError(error);
  }
}

/**
 * Starts an email change: Supabase emails an 8-digit code to the NEW address.
 *
 * Nothing changes until `verifyEmailChange` accepts that code, so a typo is
 * harmless — the account keeps its current address.
 */
export async function requestEmailChange(newEmail: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) throw error;
  } catch (error) {
    throw toFriendlyError(error);
  }
}

/**
 * Completes an email change with the code sent to the new address, then
 * mirrors the new address onto the `profiles` row so anything reading the
 * profile (rather than the auth user) stays consistent.
 *
 * Token-only, like every other flow in this app — the project's email
 * templates emit `{{ .Token }}` rather than a link.
 */
export async function verifyEmailChange(newEmail: string, code: string): Promise<void> {
  const trimmed = newEmail.trim();
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: trimmed,
      token: code.trim(),
      type: 'email_change',
    });
    if (error) throw error;

    if (data.user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: trimmed })
        .eq('id', data.user.id);
      if (profileError) throw profileError;
    }
  } catch (error) {
    if (error instanceof Error && /expired|invalid/i.test(error.message)) {
      throw new Error(i18n.t('auth.alerts.invalidCodeMessage'));
    }
    throw toFriendlyError(error);
  }
}

/**
 * Changes the account password after re-confirming the current one.
 *
 * Supabase's `updateUser` doesn't require the old password, so we re-sign-in
 * first — otherwise anyone with an unlocked phone could silently take over the
 * account.
 */
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: currentPassword,
    });
    if (signInError) throw new Error(i18n.t('auth.alerts.incorrectPassword'));

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  } catch (error) {
    throw toFriendlyError(error);
  }
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
    if (signInError) throw new Error(i18n.t('auth.alerts.incorrectPassword'));

    const { error: rpcError } = await supabase.rpc('delete_user');
    if (rpcError) throw new Error(i18n.t('profile.delete.failedMessage', { message: rpcError.message }));

    await supabase.auth.signOut();
  } catch (error) {
    throw toFriendlyError(error);
  }
}

/**
 * Subscribes to auth changes (login / logout / token refresh) so the app tree
 * updates reactively. Mirrors the web AuthContext's onAuthStateChange listener.
 *
 * The raw event name is forwarded because PASSWORD_RECOVERY carries a real
 * session that must *not* count as being signed in — see `useAuth`.
 */
export function onAuthStateChange(
  callback: (state: AuthState, event: AuthChangeEvent) => void,
) {
  return supabase.auth.onAuthStateChange((event, session) =>
    callback(toAuthState(session), event),
  );
}
