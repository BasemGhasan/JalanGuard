/**
 * Custom hook — all data-fetching logic for the JalanGuard map dashboard.
 * Components remain pure UI; this hook owns the async lifecycle.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Hazard, StateHeatmapStat } from "../types/map";

interface UseMapDataReturn {
  stats:   StateHeatmapStat[];
  hazards: Hazard[];
  loading: boolean;
  error:   Error | null;
  /** Increment internal attempt counter to re-trigger the fetch effect. */
  retry:   () => void;
}

/**
 * Fetches `state_heatmap_stats` and active `hazards` from Supabase in parallel.
 * Supports retry via the returned `retry` callback.
 * Uses a cancellation flag to prevent state updates on unmounted components.
 */
export function useMapData(): UseMapDataReturn {
  const [stats,   setStats]   = useState<StateHeatmapStat[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  /** Incrementing attempt triggers the effect below without requiring a key reset. */
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [statsResult, hazardsResult] = await Promise.all([
          supabase.from("state_heatmap_stats").select("*"),
          supabase.from("hazards").select("*").eq("status", "active"),
        ]);

        if (!active) return;

        if (statsResult.error)   throw new Error(statsResult.error.message);
        if (hazardsResult.error) throw new Error(hazardsResult.error.message);

        setStats(statsResult.data   as StateHeatmapStat[]);
        setHazards(hazardsResult.data as Hazard[]);
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err : new Error("An unknown error occurred"));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    // Cleanup: mark stale requests so they don't update state after unmount
    return () => { active = false; };
  }, [attempt]);

  return { stats, hazards, loading, error, retry };
}
