/**
 * DataExplorer — production-ready hazard report table with live filtering
 * and an inline HazardCard modal for row-detail inspection.
 *
 * Architecture (strict separation of concerns):
 *   useDataExplorer  → data fetching + loading/error state  (hooks layer)
 *   FilterBar        → 5 dropdown controls + result count   (UI, no logic)
 *   HazardTable      → scrollable table + row hover + badges (UI, no logic)
 *   HazardCard       → reused verbatim; `startExpanded` prop opens it as
 *                      a centred modal overlay (map.css handles position)
 *   DataExplorer     → owns filter state, derived arrays, selectedHazard
 */

// 1. Imports — External
import { useState, useCallback, useMemo } from "react";
import { Globe, MapPin, Map } from "lucide-react";

// 1. Imports — Local constants
import { COLORS, FONT_SIZES, SPACING } from "../../../constants/theme";

// 1. Imports — Hooks
import { useDataExplorer } from "../../../hooks/useDataExplorer";

// 1. Imports — Components
import { HazardCard } from "../map/HazardCard";
import { FilterBar } from "./filterBar";
import { HazardTable } from "./hazardTable";
import { ExportButtons } from "./exportButton";

// 1. Imports — Types
import type { HazardWithState } from "../../../types/map";
import { ViewToggle, type ToggleOption } from "../map/ViewToggle";

// 2. Types — internal filter state
type DateRange = "all" | "7" | "30";

const ADM_LEVEL_OPTIONS: ToggleOption<0 | 1 | 2>[] = [
  { value: 0, label: "Country", Icon: Globe },
  { value: 1, label: "States", Icon: Map },
  { value: 2, label: "Districts", Icon: MapPin },
];

// 3. Component

/**
 * Data Explorer page.
 *
 * Filter logic (all inside useMemo):
 *   severity   — exact match on hazard.severity
 *   status     — exact match on hazard.status
 *   defectType — exact match on hazard.defect_type
 *   location      — exact match on joined malaysian_location.state_name
 *   dateRange  — created_at must be within the last N days (cutoff from Date.now())
 *
 * Modal:
 *   Clicking a row sets selectedHazard.
 *   <HazardCard startExpanded> opens already-centered via map.css fixed rules.
 *   Closing (X button or backdrop click) sets selectedHazard back to null,
 *   removing the card from the DOM instantly.
 */
export function DataExplorer() {
  // ── Administration level ────────────────────────────────────────────────────────────
  const [admLevel, setAdmLevel] = useState<0 | 1 | 2>(0);

  // ── Data layer ────────────────────────────────────────────────────────────
  const { hazards, loading, error } = useDataExplorer(admLevel);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [defectType, setDefectType] = useState("all");
  const [state, setState] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  // ── Selected hazard (detail modal) ────────────────────────────────────────
  const [selectedHazard, setSelectedHazard] = useState<HazardWithState | null>(null);

  // ── Handlers (all stable via useCallback) ─────────────────────────────────
  const handleSeverity = useCallback((v: string) => setSeverity(v), []);
  const handleStatus = useCallback((v: string) => setStatus(v), []);
  const handleDefectType = useCallback((v: string) => setDefectType(v), []);
  const handleState = useCallback((v: string) => setState(v), []);
  const handleDateRange = useCallback((v: string) => setDateRange(v as DateRange), []);
  const handleSelectHazard = useCallback((h: HazardWithState) => setSelectedHazard(h), []);
  const handleCloseHazard = useCallback(() => setSelectedHazard(null), []);

  // ── Derived: unique filter option lists ──────────────────────────────────
  const defectTypes = useMemo(
    () => [...new Set(hazards.map((h) => h.defect_type))].sort(),
    [hazards],
  );

  const location = useMemo(
    () =>
      [...new Set(
        hazards
          .map((h) => h.malaysian_location?.location_name)
          .filter((s): s is string => Boolean(s)),
      )].sort(),
    [hazards],
  );

  // ── Derived: filtered hazard list ─────────────────────────────────────────
  const filteredHazards = useMemo(() => {
    const DAY_MS = 86_400_000;
    const cutoff =
      dateRange === "7" ? Date.now() - 7 * DAY_MS :
        dateRange === "30" ? Date.now() - 30 * DAY_MS : 0;

    return hazards.filter((h) => {
      if (severity !== "all" && h.severity !== severity) return false;
      if (status !== "all" && h.status !== status) return false;
      if (defectType !== "all" && h.defect_type !== defectType) return false;
      if (state !== "all" && h.malaysian_location?.location_name !== state) return false;
      if (cutoff > 0 && new Date(h.created_at).getTime() < cutoff) return false;
      return true;
    });
  }, [hazards, severity, status, defectType, state, dateRange]);

  return (
    <div style={styles.page}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Data Explorer</h1>
          <p style={styles.subtitle}>
            Browse, filter, and inspect every hazard report in the JalanGuard database.
          </p>
        </div>

        {/* ── Page toggler ─────────────────────────────────────────────────── */}
        <div style={styles.viewToggleContainer}>
          <ViewToggle
            value={admLevel}
            onChange={setAdmLevel}
            options={ADM_LEVEL_OPTIONS}
          />
        </div>
      </div>

      {/* ── Filter controls ───────────────────────────────────────────────── */}
      <FilterBar
        severity={severity} onSeverity={handleSeverity}
        status={status} onStatus={handleStatus}
        defectType={defectType} onDefectType={handleDefectType}
        state={state} onState={handleState}
        dateRange={dateRange} onDateRange={handleDateRange}
        defectTypes={defectTypes}
        location={location}
        filteredCount={filteredHazards.length}
        totalCount={hazards.length}
        admLevel={admLevel}
      />
      {/* ── Export buttons ─────────────────────────────────────────────────── */}
      <ExportButtons data={filteredHazards}/>

      {/* ── Data table ────────────────────────────────────────────────────── */}
      <div style={styles.tableWrap}>
        <HazardTable
          hazards={filteredHazards}
          loading={loading}
          error={error}
          onRowClick={handleSelectHazard}
        />
      </div>

      {/* ── Hazard detail modal ───────────────────────────────────────────── */}
      {/*
       * HazardCard is reused verbatim from the Pins map view.
       * `startExpanded` tells it to open already-centred (position:fixed via
       * map.css) with its own dark backdrop.  Clicking the backdrop or the X
       * button fires onClose → setSelectedHazard(null) → card unmounts instantly.
       */}
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
} as const;
