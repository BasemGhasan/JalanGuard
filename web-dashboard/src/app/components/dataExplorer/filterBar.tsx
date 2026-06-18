/**
 * FilterBar — Data Explorer filter controls.
 *
 * Renders five dropdown (<select>) filters:
 *   Severity | Status | Defect Type | State | Date Reported
 *
 * Defect Type and State option lists are derived dynamically from the live
 * data and passed in as props (computed via useMemo in DataExplorer).
 *
 * Separation of concerns:
 *   - This component owns ONLY presentation + change-event forwarding.
 *   - All filter state lives in DataExplorer.
 *   - Option list derivation lives in DataExplorer (useMemo).
 */

// 1. Imports — External
import { useMemo, useCallback } from "react";
import { RotateCcw } from "lucide-react";

// 1. Imports — Local constants
import { COLORS, FONT_SIZES, SPACING } from "../../../constants/theme";
import { Button } from "../ui/button";

// 2. Interfaces

interface FilterSelectProps {
  label:    string;
  value:    string;
  options:  { value: string; label: string }[];
  onChange: (v: string) => void;
}

export interface FilterBarProps {
  severity:   string;
  status:     string;
  defectType: string;
  state:      string;
  dateRange:  string;
  /** Unique defect_type values from the loaded data, already sorted. */
  defectTypes: string[];
  /** Unique location_name values from the joined relation, already sorted. */
  location:      string[];
  onSeverity:   (v: string) => void;
  onStatus:     (v: string) => void;
  onDefectType: (v: string) => void;
  onState:      (v: string) => void;
  onDateRange:  (v: string) => void;
  filteredCount: number;
  totalCount:    number;
  admLevel:      number;
  resetFilters:  () => void;
}

// 3. Sub-component — reusable labeled dropdown

/**
 * A labelled <select> using inline styles from theme constants.
 * Each instance manages its own change handler via useCallback.
 */
function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
    [onChange],
  );

  return (
    <div style={selectStyles.wrap}>
      <label style={selectStyles.label}>{label}</label>
      <select value={value} onChange={handleChange} style={selectStyles.select}>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: COLORS.primary }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const selectStyles = {
  wrap: {
    display:       "flex",
    flexDirection: "column" as const,
    gap:           SPACING.xs,
  },
  label: {
    color:         COLORS.textMuted,
    fontSize:      FONT_SIZES.sm,
    fontWeight:    600,
    letterSpacing: "0.07em",
    textTransform: "uppercase" as const,
  },
  select: {
    background:   COLORS.primary,
    border:       `1px solid ${COLORS.borderSoft}`,
    borderRadius: 8,
    color:        COLORS.textPrimary,
    fontSize:     FONT_SIZES.sm + 2,
    padding:      `${SPACING.xs + 2}px ${SPACING.sm + 4}px`,
    cursor:       "pointer",
    outline:      "none",
    minWidth:     140,
  },
} as const;

// 4. Component

export function FilterBar({
  severity, status, defectType, state, dateRange,
  defectTypes, location,
  onSeverity, onStatus, onDefectType, onState, onDateRange,
  filteredCount, totalCount, admLevel, resetFilters,
}: FilterBarProps) {

  // ── Static option lists (no deps — only created once) ───────────────────
  const severityOptions = useMemo(() => [
    { value: "all",    label: "All Severities" },
    { value: "high",   label: "High"           },
    { value: "medium", label: "Medium"         },
    { value: "low",    label: "Low"            },
  ], []);

  const statusOptions = useMemo(() => [
    { value: "all",      label: "All Statuses" },
    { value: "active",   label: "Active"       },
    { value: "fixed",    label: "Fixed"        },
  ], []);

  const dateRangeOptions = useMemo(() => [
    { value: "all", label: "All Time"      },
    { value: "7",   label: "Last 7 Days"   },
    { value: "30",  label: "Last 30 Days"  },
  ], []);

  // ── Dynamic option lists — derived from live data ────────────────────────
  const defectTypeOptions = useMemo(() => [
    { value: "all", label: "All Types" },
    ...defectTypes.map((t) => ({
      value: t,
      label: t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
  ], [defectTypes]);

  const locationOptions = useMemo(() => [
    { value: "all", label: "All Locations" },
    ...location.map((l) => ({ value: l, label: l })),
  ], [location]);

  // ── Derived: is any filter active? ───────────────────────────────────────
  const isFiltered = filteredCount !== totalCount;

  return (
    <div style={styles.wrap}>
      {/* ── Dropdowns ────────────────────────────────────────────────────── */}
      <div style={styles.filters}>
        <FilterSelect
          label="Severity"      value={severity}   options={severityOptions}   onChange={onSeverity}   />
        <FilterSelect
          label="Status"        value={status}     options={statusOptions}      onChange={onStatus}     />
        <FilterSelect
          label="Defect Type"   value={defectType} options={defectTypeOptions}  onChange={onDefectType} />
        {admLevel !== 0 && (
          <FilterSelect
            label="Location"      value={state}      options={locationOptions}    onChange={onState}      />
        )}
        <FilterSelect
          label="Date Reported" value={dateRange}  options={dateRangeOptions}   onChange={onDateRange}  />
          <Button style={styles.button} onClick={resetFilters}>
            <RotateCcw size={16} />
          </Button>
      </div>

      {/* ── Result count ─────────────────────────────────────────────────── */}
      <p style={styles.count}>
        Showing{" "}
        <span style={{ color: isFiltered ? COLORS.secondary : COLORS.textPrimary, fontWeight: 700 }}>
          {filteredCount}
        </span>
        {" "}of{" "}
        <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>
          {totalCount}
        </span>
        {" "}reports
      </p>
    </div>
  );
}

// 5. Styles
const styles = {
  wrap: {
    display:        "flex",
    alignItems:     "flex-end",
    justifyContent: "space-between",
    flexWrap:       "wrap" as const,
    gap:            SPACING.md,
    marginBottom:   SPACING.md,
    padding:        `${SPACING.md}px ${SPACING.lg}px`,
    background:     COLORS.surface,
    borderRadius:   16,
    border:         `1px solid ${COLORS.borderSoft}`,
  },
  filters: {
    display:    "flex",
    flexWrap:   "wrap" as const,
    gap:        SPACING.md,
    alignItems: "flex-end",
  },
  count: {
    color:     COLORS.textMuted,
    fontSize:  FONT_SIZES.sm + 1,
    margin:    0,
    alignSelf: "flex-end" as const,
    flexShrink: 0,
  },
  button: {
    background: COLORS.secondary,
    color:      COLORS.white,
    border:     "none",
    borderRadius: SPACING.xxl,
    padding:      `${SPACING.sm + 3}px`,
    cursor:       "pointer",
  },
} as const;
