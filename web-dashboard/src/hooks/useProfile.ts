// 1. Imports — External
import { useState, useEffect } from "react";

// 1. Imports — Local
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { Profile } from "../types/profile";

// 2. Types — return shape
interface UseProfileReturn {
  /** Profile row from public.profiles, or null if not loaded / not found. */
  profile: Profile | null;
  /** True while the initial profile fetch is in flight. */
  loading: boolean;
  /** Last error message from the fetch, or null if none. */
  error: string | null;
}

/**
 * Read-only access to the signed-in user's `public.profiles` row.
 *
 * Intentionally has no write path. Profile details (name and email) are edited
 * exclusively in the mobile app — Settings → Account — so the dashboard only
 * ever reads. The email-change OTP flow that used to live here moved to
 * `mobile-app/src/services/authService.ts`.
 */
export function useProfile(): UseProfileReturn {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) { setProfile(null); return; }

    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      const { data, error: e } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      if (cancelled) return;

      setLoading(false);

      // PGRST116 = "row not found" — not an error worth surfacing
      if (e && e.code !== "PGRST116") {
        setError(e.message);
      } else {
        setProfile((data as Profile) ?? null);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return { profile, loading, error };
}
