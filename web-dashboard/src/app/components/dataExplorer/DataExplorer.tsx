/**
 * DataExplorer — production-ready hazard report table with live filtering
 * and an inline HazardCard modal for row-detail inspection.
 *
 * Architecture (strict separation of concerns):
 * useDataExplorer  → data fetching + loading/error state  (hooks layer)
 * FilterBar        → 5 dropdown controls + result count   (UI, no logic)
 * HazardTable      → scrollable table + row hover + badges (UI, no logic)
 * HazardCard       → reused verbatim; `startExpanded` prop opens it as
 * a centred modal overlay (map.css handles position)
 * DataExplorer     → owns filter state, derived arrays, selectedHazard
 */

// 1. Imports — External
import { useState, useCallback, useMemo, useEffect } from "react";

// 1. Imports — Local constants
import { COLORS, FONT_SIZES, SPACING } from "../../../constants/theme";
import { ADM_LEVEL_OPTIONS } from "../../../constants/viewOptions";

// 1. Imports — Hooks
import { useDataExplorer, type ExplorerFilters } from "../../../hooks/useDataExplorer";
import { supabase } from "../../../lib/supabase";

// 1. Imports — Components
import { HazardCard } from "../map/HazardCard";
import { FilterBar } from "./filterBar";
import { HazardTable } from "./hazardTable";
import { ExportButtons } from "./exportButton";
import ErrorBanner from "../ui/errorBanner";

// 1. Imports — Types
import type { HazardWithState } from "../../../types/map";
import { ViewToggle } from "../map/ViewToggle";

// 2. Types — internal filter state
type DateRange = "all" | "7" | "30";

export function DataExplorer() {
  // ── Administration & Pagination level ─────────────────────────────────────
  const [admLevel, setAdmLevel] = useState<0 | 1 | 2>(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 25; // Matches the hook

  // ── Filter state ──────────────────────────────────────────────────────────
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [defectType, setDefectType] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [defectTypes, setDefectTypes] = useState<string[]>([]);
  const [location, setLocation] = useState<string[]>([]);
  const [exportError, setExportError] = useState<string | null>(null);

  const sortUniqueStrings = useCallback((values: string[]) => {
    return [...new Set(values)].sort((left, right) => left.localeCompare(right));
  }, []);

  // Bundle filters for the hook
  const filters: ExplorerFilters = useMemo(() => ({
    severity,
    status,
    defectType,
    state: stateFilter,
    dateRange,
  }), [severity, status, defectType, stateFilter, dateRange]);

  // ── Data layer (Server-Side) ──────────────────────────────────────────────
  const { hazards, totalCount, loading, error, exportData } = useDataExplorer(
    admLevel,
    filters,
    page,
    itemsPerPage
  );

  // ── Selected hazard (detail modal) ────────────────────────────────────────
  const [selectedHazard, setSelectedHazard] = useState<HazardWithState | null>(null);

  // ── Handlers (🚨 CRITICAL: Reset to page 1 when filtering!) ───────────────
  const handleSeverity = useCallback((v: string) => { setSeverity(v); setPage(1); }, []);
  const handleStatus = useCallback((v: string) => { setStatus(v); setPage(1); }, []);
  const handleDefectType = useCallback((v: string) => { setDefectType(v); setPage(1); }, []);
  const handleState = useCallback((v: string) => { setStateFilter(v); setPage(1); }, []);
  const handleDateRange = useCallback((v: string) => { setDateRange(v as DateRange); setPage(1); }, []);

  const handleSelectHazard = useCallback((h: HazardWithState) => setSelectedHazard(h), []);
  const handleCloseHazard = useCallback(() => setSelectedHazard(null), []);

  const handleExportError = useCallback((count: number) => {
    if (count === 0) setExportError("⚠️ No data to export. Please adjust your filters.");
    else if (count > 500) setExportError("⚠️ Export failed. Please adjust your filters to match 1–500 records.");
    else setExportError(null);
    setTimeout(() => setExportError(null), 5000);
  }, []);

  // ── Reset filters ──────────────────────────────────
  const resetFilters = useCallback(() => {
    setSeverity("all");
    setStatus("all");
    setDefectType("all");
    setStateFilter("all");
    setDateRange("all");
    setPage(1); // Always reset page
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFilterOptions() {
      const [{ data: defectTypeData }, { data: boundaryData }] = await Promise.all([
        supabase
          .from("hazards")
          .select("defect_type, defect_types"),
        supabase
          .from("administrative_boundaries")
          .select("name")
          .eq("adm_level", admLevel)
          .order("name", { ascending: true }),
      ]);

      if (cancelled) return;

      const defectRows = (defectTypeData ?? []) as Array<{
        defect_type: string | null;
        defect_types: string[] | null;
      }>;
      const boundaryRows = (boundaryData ?? []) as Array<{ name: string | null }>;

      // Union of every primary + secondary AI-detected type, so a defect
      // that's never anyone's "primary" type still appears as a filter option.
      const allDefectTypes = defectRows.flatMap((row) =>
        row.defect_types && row.defect_types.length > 0 ? row.defect_types : [row.defect_type]
      );
      setDefectTypes(sortUniqueStrings(allDefectTypes.filter((value): value is string => Boolean(value))));
      setLocation(sortUniqueStrings(boundaryRows.map((row) => row.name).filter((value): value is string => Boolean(value))));
    }

    loadFilterOptions();

    return () => {
      cancelled = true;
    };
  }, [admLevel, sortUniqueStrings]);

  // Pagination Math
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div style={styles.page} className="jg-explorer-page jg-page-shell">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={styles.header} className="jg-explorer-header">
        <div>
          <h1 style={styles.title} className="jg-explorer-title">Data Explorer</h1>
          <p style={styles.subtitle}>
            Browse, filter, and inspect every hazard report in the JalanGuard database.
          </p>
        </div>

        {/* ── Page toggler ─────────────────────────────────────────────────── */}
        <div style={styles.viewToggleContainer} className="jg-explorer-toggle">
          <ViewToggle
            value={admLevel}
            onChange={(value) => {
              setAdmLevel(value);
              resetFilters();
            }}
            options={ADM_LEVEL_OPTIONS}
          />
        </div>
      </div>

      {/* ── Filter controls ───────────────────────────────────────────────── */}
      <FilterBar
        severity={severity} onSeverity={handleSeverity}
        status={status} onStatus={handleStatus}
        defectType={defectType} onDefectType={handleDefectType}
        state={stateFilter} onState={handleState}
        dateRange={dateRange} onDateRange={handleDateRange}
        defectTypes={defectTypes}
        location={location}
        filteredCount={totalCount} // Show the true server count!
        totalCount={totalCount}
        admLevel={admLevel}
        resetFilters={resetFilters}
      />

      {exportError && <ErrorBanner message={exportError} style={{ marginBottom: SPACING.md }} />}

      {/* ── Export buttons ── */}
      <ExportButtons 
        onExport={async (format) => {
          if (totalCount > 0 && totalCount < 501) {
            await exportData(format);
          } else {
            handleExportError(totalCount);
          }
        }} 
      />

      {/* ── Data table ────────────────────────────────────────────────────── */}
      <div style={styles.tableWrap}>
        <HazardTable
          hazards={hazards}
          loading={loading}
          error={error}
          onRowClick={handleSelectHazard}
        />
      </div>

      {/* ── Pagination Controls (NEW) ─────────────────────────────────────── */}
      <div style={styles.pagination} className="jg-pagination">
        <button
          className="jg-pagination-btn"
          style={{ ...styles.pageBtn, opacity: page === 1 ? 0.5 : 1 }}
          disabled={page === 1 || loading}
          onClick={() => setPage(p => p - 1)}
        >
          &larr; Previous
        </button>

        <span style={styles.pageInfo} className="jg-pagination-info">
          Page {page} of {totalPages} <span style={{ color: COLORS.textMuted }}>(Total: {totalCount})</span>
        </span>

        <button
          className="jg-pagination-btn"
          style={{ ...styles.pageBtn, opacity: page >= totalPages ? 0.5 : 1 }}
          disabled={page >= totalPages || loading}
          onClick={() => setPage(p => p + 1)}
        >
          Next &rarr;
        </button>
      </div>

      {/* ── Hazard detail modal ───────────────────────────────────────────── */}
      {selectedHazard !== null && (
        <HazardCard
          hazard={selectedHazard}
          onClose={handleCloseHazard}
          startExpanded
        />
      )}

    </div>
  );
}

// 4. Styles
const styles = {
  page: {
    minHeight: "calc(100vh - 64px)",
    background: COLORS.background,
    padding: `${SPACING.xl}px`,
  },
  header: {
    marginBottom: SPACING.xl,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewToggleContainer: {
    position: "relative",
    height: "50px",
    width: "300px",
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xl + 4,
    fontWeight: 700,
    margin: `0 0 ${SPACING.xs}px`,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm + 2,
    margin: 0,
  },
  tableWrap: {
    background: COLORS.surface,
    borderRadius: 16,
    border: `1px solid ${COLORS.borderSoft}`,
    overflow: "hidden",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.lg,
    padding: `0 ${SPACING.sm}px`,
  },
  pageBtn: {
    padding: `${SPACING.sm}px ${SPACING.lg}px`,
    background: COLORS.surface,
    border: `1px solid ${COLORS.borderSoft}`,
    borderRadius: 8,
    cursor: "pointer",
    color: COLORS.textPrimary,
    fontWeight: 600,
    fontSize: 14,
    transition: "all 0.2s ease",
  },
  pageInfo: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: 500,
  }
} as const;