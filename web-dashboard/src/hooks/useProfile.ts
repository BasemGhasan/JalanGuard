// 1. Imports — External
import { useState, useEffect, useCallback } from "react";

// 1. Imports — Local
import { supabase }   from "../lib/supabase";
import { useAuth }    from "../context/AuthContext";
import type { Profile, ProfileUpdate } from "../types/profile";

// 2. Types — return shape
interface UseProfileReturn {
  /** Profile row from public.profiles, or null if not loaded / not found. */
  profile:     Profile | null;
  /** True while the initial profile fetch is in flight. */
  loading:     boolean;
  /** True while a save operation is in flight. */
  saving:      boolean;
  /** Last error message from fetch or save, or null if none. */
  error:       string | null;
  /**
   * Persists the supplied fields to the profiles table.
   * Uses UPSERT so it works even if the trigger-created row is missing.
   * @returns true on success, false on failure (error is set in state).
   */
  saveProfile: (updates: ProfileUpdate) => Promise<boolean>;
}

/**
 * Encapsulates all interaction with the `public.profiles` Supabase table.
 *
 * Separation of concerns: this hook owns every API call and every piece of
 * async state related to the profile. UI components import the return value
 * and never touch supabase.from("profiles") directly.
 */
export function useProfile(): UseProfileReturn {
  const { session }                   = useAuth();
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [loading, setLoading]         = useState(false);
  const [saving,  setSaving]          = useState(false);
  const [error,   setError]           = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) { setProfile(null); return; }

    setLoading(true);
    setError(null);

    supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single()
      .then(({ data, error: e }) => {
        setLoading(false);
        // PGRST116 = "row not found" — not an error worth surfacing
        if (e && e.code !== "PGRST116") {
          setError(e.message);
        } else {
          setProfile((data as Profile) ?? null);
        }
      });
  }, [session?.user?.id]);

  // ── Save ───────────────────────────────────────────────────────────────
  const saveProfile = useCallback(
    async (updates: ProfileUpdate): Promise<boolean> => {
      const uid   = session?.user?.id;
      const email = session?.user?.email ?? null;
      if (!uid) return false;

      setSaving(true);
      setError(null);

      const { data, error: e } = await supabase
        .from("profiles")
        .upsert({
          id:         uid,
          email,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      setSaving(false);

      if (e) {
        setError(e.message);
        return false;
      }

      setProfile(data as Profile);
      return true;
    },
    [session?.user?.id, session?.user?.email],
  );

  return { profile, loading, saving, error, saveProfile };
}
