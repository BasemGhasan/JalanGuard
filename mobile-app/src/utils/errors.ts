/**
 * Shared error normalisation for the data layer.
 *
 * The Supabase client (see `services/supabase`) aborts any request after 15s and
 * RN surfaces stalled connections as cryptic "Network request failed" / "Aborted"
 * errors. These helpers turn those into a single, human-readable message so every
 * screen can show "check your connection" instead of leaking internals.
 *
 * Messages are resolved through the i18n singleton rather than a `t` passed in
 * from a component, so services and hooks (which have no hook context) still
 * produce text in the user's chosen language.
 */
import i18n from '../i18n';

/** True when an error looks like a connectivity/timeout failure rather than a real API error. */
export function isOfflineError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    error.name === 'AbortError' ||
    msg.includes('abort') ||
    msg.includes('network request failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('timeout')
  );
}

/** Normalises any thrown value into an Error carrying a user-facing message. */
export function toFriendlyError(error: unknown, fallback?: string): Error {
  if (isOfflineError(error)) {
    return new Error(i18n.t('errors.offline'));
  }
  if (error instanceof Error) return error;
  return new Error(fallback ?? i18n.t('errors.generic'));
}
