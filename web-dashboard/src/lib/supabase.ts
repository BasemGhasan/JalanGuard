import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const IS_SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

function createSupabaseUnavailableError() {
  return new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable auth and data loading.",
  );
}

function createMissingQuery() {
  const query: any = {
    select() {
      return query;
    },
    eq() {
      return query;
    },
    order() {
      return query;
    },
    limit() {
      return query;
    },
    single() {
      return Promise.resolve({ data: null, error: createSupabaseUnavailableError() });
    },
    maybeSingle() {
      return Promise.resolve({ data: null, error: createSupabaseUnavailableError() });
    },
    upsert() {
      return query;
    },
    insert() {
      return query;
    },
    update() {
      return query;
    },
    delete() {
      return query;
    },
    then(onFulfilled: (value: { data: unknown[]; error: null }) => unknown, onRejected?: (reason: unknown) => unknown) {
      return Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
    },
  };

  return query;
}

/**
 * The `type` field from the URL hash fragment that Supabase appends to redirect
 * URLs (e.g. `#access_token=...&type=signup`).
 *
 * Captured at module-evaluation time — BEFORE createClient() processes the hash
 * and removes it via history.replaceState — so it reliably contains the original
 * value even after Supabase clears the URL.
 *
 * Possible values:
 *   "signup"       — email-confirmation redirect
 *   "recovery"     — password-reset redirect
 *   "magiclink"    — magic-link login (not currently used)
 *   "email_change" — email-address change confirmation
 *   null           — normal page load with no Supabase redirect
 *
 * NOTE: all auth emails in this project now carry an 8-digit `{{ .Token }}`
 * rather than a link, so in practice this is always null. It is kept as a
 * safety net for any legacy link still sitting in someone's inbox.
 */
export const INITIAL_HASH_TYPE: string | null =
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.hash.slice(1)).get("type")
    : null;

const fallbackSupabase: any = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() { } } } }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: createSupabaseUnavailableError() }),
    updateUser: async () => ({ data: { user: null }, error: createSupabaseUnavailableError() }),
    signOut: async () => ({ error: null }),
  },
  from() {
    return createMissingQuery();
  },
  rpc: async () => ({ data: null, error: createSupabaseUnavailableError() }),
};

export const supabase = IS_SUPABASE_CONFIGURED && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : fallbackSupabase;

export type { User, Session } from "@supabase/supabase-js";
