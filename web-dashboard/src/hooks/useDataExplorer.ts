/**
 * useDataExplorer
 *
 * Data-layer hook for the Data Explorer page.
 * Upgraded to support true Server-Side Pagination, Filtering, and Safe Exporting.
 */

// 1. Imports — External
import { useState, useEffect } from "react";

// 2. Imports — Local
import { supabase } from "../lib/supabase";
import type { HazardWithState } from "../types/map";

// 3. Interfaces
export interface ExplorerFilters {
  status?: string;
  defectType?: string;
  severity?: string;
  state?: string;
  dateRange?: string;
}

/** Raw hazard row with the embedded administrative-boundary join. */
type HazardRow = HazardWithState & { boundary_data?: { name: string | null } | null };

const normalizeHazards = (data: HazardRow[] | null | undefined): HazardWithState[] => {
  return (data ?? []).map((hazard) => ({
    ...hazard,
    boundary_name: hazard.boundary_data?.name || "Unknown Area",
    malaysian_location: {
      location_name: hazard.boundary_data?.name || "Unknown Area"
    }
  }));
};

interface UseDataExplorerReturn {
  hazards: HazardWithState[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  exportData: (format: "csv" | "excel" | "xml" | "pdf") => Promise<void>;
}

// 4. Hook
export function useDataExplorer(
  admLevel: 0 | 1 | 2 = 0,
  filters: ExplorerFilters = {},
  page: number = 1,
  itemsPerPage: number = 25 // Set to 25 as requested!
): UseDataExplorerReturn {
  const [hazards, setHazards] = useState<HazardWithState[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper: Build the Supabase query to be shared by both the UI Table and the Export button
  const buildQuery = (isExport = false) => {
    const fkColumn = `adm${admLevel}_id`;
    const { status, defectType, severity, state, dateRange } = filters;
    const hasStateFilter = Boolean(state && state !== "all");
    const boundaryJoin = hasStateFilter ? `boundary_data:administrative_boundaries!${fkColumn}!inner(name)` : `boundary_data:administrative_boundaries!${fkColumn}(name)`;

    // Ask for the exact count so the UI knows how many pages exist
    let query = supabase
      .from("hazards")
      .select(`*, ${boundaryJoin}`, { count: "exact" });

    // Apply Filters Server-Side
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (defectType && defectType !== "all") {
      query = query.eq("defect_type", defectType);
    }
    if (severity && severity !== "all") {
      query = query.eq("severity", severity);
    }

    // Filter by administrative boundary name (state/location) if requested
    if (hasStateFilter) {
      query = query.eq("boundary_data.name", state);
    }

    // Date range filtering: supports '7' => last 7 days, '30' => last 30 days
    if (dateRange && dateRange !== "all") {
      const days = Number.parseInt(dateRange, 10);
      if (!Number.isNaN(days) && days > 0) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        query = query.gte("created_at", cutoff.toISOString());
      }
    }

    query = query.order("created_at", { ascending: false });

    // If it's for the UI table, slice it to the 25 records for the current page
    if (!isExport) {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
    }

    return query;
  };

  // --------------------------------------------------------
  // FETCH TABLE DATA
  // --------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function fetchTableData() {
      setLoading(true);
      setError(null);

      const { data, count, error: sbError } = await buildQuery(false);

      if (cancelled) return;

      if (sbError) {
        setError(sbError.message);
      } else {
        setHazards(normalizeHazards(data));
        setTotalCount(count || 0); // Save the total number of matches!
      }

      setLoading(false);
    }

    fetchTableData();

    return () => { cancelled = true; };
  }, [admLevel, filters, page, itemsPerPage]); // Re-fetch if the user changes page, filter, or admLevel

  // --------------------------------------------------------
  // EXPORT FUNCTION WITH SAFETY CAP
  // --------------------------------------------------------
  const exportData = async (format: "csv" | "excel" | "xml" | "pdf") => {
    const EXPORT_LIMIT = 500;

    // Fetch the raw data for the export directly from the server
    const { data, error } = await buildQuery(true).limit(EXPORT_LIMIT);

    if (error) {
      alert("Failed to export data: " + error.message);
      return;
    }

    const normalizedData = normalizeHazards(data);

    // Dynamically import utilities so they don't slow down the page load
    const utils = await import("../utils/exportUtils");

    if (format === "csv") utils.exportToCSV(normalizedData);
    if (format === "excel") utils.exportToExcel(normalizedData);
    if (format === "pdf") utils.exportToPDF(normalizedData);
    if (format === "xml") utils.exportToXML(normalizedData);
  };

  return { hazards, totalCount, loading, error, exportData };
}