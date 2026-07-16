/**
 * Shared error normalisation for the data layer.
 *
 * The Supabase client (see `services/supabase`) aborts any request after 15s and
 * RN surfaces stalled connections as cryptic "Network request failed" / "Aborted"
 * errors. These helpers turn those into a single, human-readable message so every
 * screen can show "check your connection" instead of leaking internals.
 */

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
export function toFriendlyError(error: unknown, fallback = 'Something went wrong. Please try again.'): Error {
  if (isOfflineError(error)) {
    return new Error('Could not reach the server. Check your internet connection and try again.');
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
}
