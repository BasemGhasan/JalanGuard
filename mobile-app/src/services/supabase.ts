/**
 * Supabase client for React Native.
 *
 * Ported from the web dashboard's `lib/supabase.ts`, adapted for RN:
 *   - `react-native-url-polyfill` provides the URL API supabase-js expects.
 *   - Sessions persist via AsyncStorage (the web uses localStorage).
 *   - `detectSessionInUrl: false` — there is no URL bar on native; email-link
 *     callbacks are handled by deep links, not hash parsing.
 *   - A timeout-wrapped `fetch` is injected globally. React Native's `fetch`
 *     has no default timeout, and supabase-js issues auth requests (e.g.
 *     `signUp`) with no retry/timeout of its own, so a stalled connection would
 *     otherwise leave the promise pending forever — the "Creating…" hang. The
 *     wrapper aborts after REQUEST_TIMEOUT_MS so requests fail loudly with a
 *     surfaced error instead of hanging.
 */
import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/config';

/** Hard ceiling for any single Supabase request before it is aborted. */
const REQUEST_TIMEOUT_MS = 15000;

/**
 * `fetch` with an AbortController-backed timeout.
 *
 * Aborts the request after REQUEST_TIMEOUT_MS while still honouring any signal
 * supabase-js passes in, so a network stall surfaces as an error the UI can
 * show rather than an indefinite pending promise.
 */
const fetchWithTimeout: typeof fetch = (input, init = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Chain any caller-provided signal into our controller.
  const callerSignal = init.signal;
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener('abort', () => controller.abort());
  }

  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId),
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetchWithTimeout,
  },
});

/**
 * Official RN guidance: only auto-refresh the session while the app is in the
 * foreground. Refreshing in the background wastes work and can race the OS
 * suspending the JS engine.
 */
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
