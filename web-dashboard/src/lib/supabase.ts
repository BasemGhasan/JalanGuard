import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
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
 *   "signup"       — user clicked an email-confirmation link
 *   "recovery"     — user clicked a password-reset link
 *   "magiclink"    — magic-link login (not currently used)
 *   "email_change" — user confirmed an email-address change
 *   null           — normal page load with no Supabase redirect
 */
export const INITIAL_HASH_TYPE: string | null =
  new URLSearchParams(window.location.hash.slice(1)).get("type");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type { User, Session } from "@supabase/supabase-js";
