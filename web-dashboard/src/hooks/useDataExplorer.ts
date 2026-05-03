/**
 * useDataExplorer
 *
 * Data-layer hook for the Data Explorer page.
 * Fetches all hazard reports with their joined state names via Supabase's
 * relational select syntax and returns them in reverse-chronological order.
 *
 * Separation of concerns:
 *   - This hook owns ALL Supabase calls and data-loading state.
 *   - The DataExplorer component owns filter state and derived/filtered arrays.
 *   - No UI logic lives here.
 */

// 1. Imports — External
import { useState, useEffect } from "react";

// 1. Imports — Local
import { supabase }           from "../lib/supabase";
import type { HazardWithState } from "../types/map";

// 2. Interfaces
interface UseDataExplorerReturn {
  hazards: HazardWithState[];
  loading: boolean;
  error:   string | null;
}

// 3. Hook
export function useDataExplorer(): UseDataExplorerReturn {
  const [hazards, setHazards] = useState<HazardWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState<string | null>(null);

  useEffect(() => {
    /** Cancellation flag — prevents state updates if the component unmounts
     *  before the async fetch resolves. */
    let cancelled = false;

    async function fetchHazards() {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from("hazards")
        .select("*, malaysian_states(state_name)")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (sbError) {
        setError(sbError.message);
      } else {
        setHazards((data as HazardWithState[]) ?? []);
      }

      setLoading(false);
    }

    fetchHazards();

    return () => { cancelled = true; };
  }, []); // fetch once on mount — the table is read-only from this page

  return { hazards, loading, error };
}
