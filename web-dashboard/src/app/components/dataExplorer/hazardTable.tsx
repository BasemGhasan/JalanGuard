/**
 * HazardTable — Data Explorer table view.
 *
 * Renders the filtered hazard list as a dark-themed HTML table.
 * Each row is its own component (TableRow) so hover state is local
 * and never causes the whole table to re-render.
 *
 * Columns: Date | Location | Type | Severity | Status
 *
 * Separation of concerns:
 *   - This component owns ONLY table rendering and per-row hover state.
 *   - Filtering logic lives in DataExplorer (useMemo).
 *   - Badge colour definitions come from theme.ts (SEVERITY_BADGE).
 */

// 1. Imports — External
import { useState, useCallback } from "react";
import { AlertCircle, FileX, Loader2 } from "lucide-react";

// 1. Imports — Local
import { COLORS, FONT_SIZES, SPACING, SEVERITY_BADGE } from "../../../constants/theme";
import type { HazardWithState } from "../../../types/map";

// 2. Interfaces

export interface HazardTableProps {
  hazards:    HazardWithState[];
  loading:    boolean;
  error:      string | null;
  onRowClick: (h: HazardWithState) => void;
}

interface TableRowProps {
  hazard:     HazardWithState;
  onRowClick: (h: HazardWithState) => void;
}

// 3. Helpers

/** Formats an ISO timestamp to "DD MMM YYYY" in Malaysian locale. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

// 4. Sub-components — badges

/**
 * Severity badge — amber/red/orange pill matching the HazardCard badge.
 * Colours sourced exclusively from SEVERITY_BADGE in theme.ts.
 */
function SeverityBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  const badge = SEVERITY_BADGE[severity] ?? SEVERITY_BADGE.low;
  return (
    <span
      style={{
        display:       "inline-block",
        padding:       `3px ${SPACING.sm + 2}px`,
        borderRadius:  20,
        fontSize:      11,
        fontWeight:    700,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        background:    badge.bg,
        color:         badge.text,
        border:        `1px solid ${badge.border}`,
        whiteSpace:    "nowrap" as const,
      }}
    >
      {severity}
    </span>
  );
}

/** Colour mapping for the three recognised status values. */
const STATUS_COLOR: Record<string, string> = {
  active:   COLORS.info,
  fixed:    COLORS.success,
  rejected: COLORS.error,
};

/**
 * Status indicator — glowing dot + coloured label.
 * Falls back to textMuted for unknown statuses.
 */
function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? COLORS.textMuted;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: SPACING.xs + 2 }}>
      <span
        style={{
          width:        6,
          height:       6,
          borderRadius: "50%",
          background:   color,
          flexShrink:   0,
          boxShadow:    `0 0 6px ${color}`,
        }}
      />
      <span
        style={{
          color,
          fontSize:      FONT_SIZES.sm + 1,
          fontWeight:    500,
          textTransform: "capitalize" as const,
        }}
      >
        {status}
      </span>
    </span>
  );
}

// 5. Sub-component — TableRow (owns its own hover state)

/**
 * A single table row.
 *
 * Keeping hover state local here means only this row re-renders on
 * mouse-enter/leave — the parent table is never touched.
 */
function TableRow({ hazard, onRowClick }: TableRowProps) {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setHovered(true),       []);
  const handleMouseLeave = useCallback(() => setHovered(false),      []);
  const handleClick      = useCallback(() => onRowClick(hazard), [onRowClick, hazard]);

  return (
    <tr
      style={{
        borderTop:  `1px solid ${COLORS.borderFaint}`,
        background: hovered ? "rgba(255,255,255,0.035)" : "transparent",
        cursor:     "pointer",
        transition: "background 0.12s ease",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <td style={tdStyle}>{formatDate(hazard.created_at)}</td>
      <td style={tdStyle}>{hazard.malaysian_location?.location_name ?? "—"}</td>
      <td style={{ ...tdStyle, textTransform: "capitalize", maxWidth: 200 }}>
        {hazard.defect_type.replace(/_/g, " ")}
      </td>
      <td style={tdStyle}>
        <SeverityBadge severity={hazard.severity} />
      </td>
      <td style={tdStyle}>
        <StatusBadge status={hazard.status} />
      </td>
    </tr>
  );
}

const tdStyle = {
  padding:       `${SPACING.sm + 4}px ${SPACING.md}px`,
  fontSize:      FONT_SIZES.sm + 2,
  color:         COLORS.textPrimary,
  verticalAlign: "middle" as const,
  whiteSpace:    "nowrap" as const,
} as const;

// 6. Column header definitions
const COLUMNS = ["Date", "Location", "Type", "Severity", "Status"] as const;

// 7. Main component

/**
 * HazardTable renders three distinct states:
 *   loading — centered spinner
 *   error   — red alert message
 *   empty   — "no results" placeholder
 *   data    — scrollable table with hoverable rows
 */
export function HazardTable({ hazards, loading, error, onRowClick }: HazardTableProps) {
  if (loading) {
    return (
      <div style={stateStyles.center}>
        <Loader2 size={24} color={COLORS.textMuted} className="animate-spin" />
        <p style={stateStyles.msg}>Loading reports…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={stateStyles.center}>
        <AlertCircle size={24} color={COLORS.error} />
        <p style={{ ...stateStyles.msg, color: COLORS.error }}>{error}</p>
      </div>
    );
  }

  if (hazards.length === 0) {
    return (
      <div style={stateStyles.center}>
        <FileX size={36} color={COLORS.textMuted} style={{ opacity: 0.35 }} />
        <p style={stateStyles.msg}>No reports match the current filters.</p>
        <p style={{ ...stateStyles.msg, fontSize: FONT_SIZES.sm, opacity: 0.6 }}>
          Try broadening your filter selection.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col} style={thStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hazards.map((h) => (
            <TableRow key={h.id} hazard={h} onRowClick={onRowClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 8. Styles
const tableStyle = {
  width:          "100%",
  borderCollapse: "collapse" as const,
} as const;

const thStyle = {
  padding:       `${SPACING.sm + 2}px ${SPACING.md}px`,
  fontSize:      FONT_SIZES.sm,
  fontWeight:    600,
  color:         COLORS.textMuted,
  textAlign:     "left" as const,
  letterSpacing: "0.07em",
  textTransform: "uppercase" as const,
  background:    "rgba(255,255,255,0.025)",
  borderBottom:  `1px solid ${COLORS.borderSoft}`,
  whiteSpace:    "nowrap" as const,
} as const;

const stateStyles = {
  center: {
    display:        "flex",
    flexDirection:  "column" as const,
    alignItems:     "center",
    justifyContent: "center",
    gap:            SPACING.md,
    padding:        `${SPACING.xl * 2}px ${SPACING.xl}px`,
  },
  msg: {
    color:    COLORS.textMuted,
    fontSize: FONT_SIZES.sm + 2,
    margin:   0,
    textAlign: "center" as const,
  },
} as const;
