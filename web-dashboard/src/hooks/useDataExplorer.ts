/**
 * useDataExplorer
 *
 * Data-layer hook for the Data Explorer page.
 * Upgraded to dynamically fetch boundary names based on the selected ADM level.
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
export function useDataExplorer(admLevel: 0 | 1 | 2 = 0): UseDataExplorerReturn {
  const [hazards, setHazards] = useState<HazardWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHazards() {
      setLoading(true);
      setError(null);

      // Dynamically select the correct foreign key based on the current admLevel
      const fkColumn = `adm${admLevel}_id`;
      const selectQuery = `*, boundary_data:administrative_boundaries!${fkColumn}(name)`;

      const { data, error: sbError } = await supabase
        .from("hazards")
        .select(selectQuery)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (sbError) {
        setError(sbError.message);
      } else {
        const normalizedData = (data || []).map((hazard: any) => ({
          ...hazard,
          boundary_name: hazard.boundary_data?.name || "Unknown Area",
          malaysian_location: {
            location_name: hazard.boundary_data?.name || "Unknown Area"
          }
        }));

        setHazards(normalizedData as HazardWithState[]);
      }

      setLoading(false);
    }

    fetchHazards();

    return () => { cancelled = true; };
  }, [admLevel]); // Refetch whenever the ADM level toggle changes

  return { hazards, loading, error };
}