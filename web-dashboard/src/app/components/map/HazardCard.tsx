// 1. Imports
import { useCallback } from "react";
import { X } from "lucide-react";
import { COLORS, SEVERITY_BADGE } from "../../../constants/theme";
import type { Hazard } from "../../../types/map";

// 2. Interfaces
interface HazardCardProps {
  hazard:  Hazard;
  onClose: () => void;
}

// 3. Helpers
/** Formats an ISO date string into a human-readable "DD MMM YYYY" label. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

/** Returns the badge style object for a given severity, falling back to 'low'. */
function badgeStyle(severity: Hazard["severity"]) {
  return SEVERITY_BADGE[severity] ?? SEVERITY_BADGE.low;
}

// 4. Component
/**
 * Floating card that appears when a hazard pin is clicked.
 * Positioned absolutely over the bottom-left corner of the map.
 */
export function HazardCard({ hazard, onClose }: HazardCardProps) {
  const handleClose = useCallback(() => onClose(), [onClose]);

  const badge = badgeStyle(hazard.severity);

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <span
          style={{
            ...styles.badge,
            background: badge.bg,
            color:      badge.text,
            border:     `1px solid ${badge.border}`,
          }}
        >
          {hazard.severity.toUpperCase()}
        </span>
        <button style={styles.closeBtn} onClick={handleClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>

      {/* Thumbnail */}
      {hazard.image_url && (
        <img
          src={hazard.image_url}
          alt={hazard.defect_type}
          style={styles.thumbnail}
          loading="lazy"
        />
      )}

      {/* Meta rows */}
      <div style={styles.meta}>
        <MetaRow label="Type"       value={hazard.defect_type} />
        <MetaRow label="Status"     value={hazard.status}      />
        <MetaRow label="Reported"   value={formatDate(hazard.created_at)} />
        <MetaRow label="Latitude"   value={hazard.latitude.toFixed(5)}   />
        <MetaRow label="Longitude"  value={hazard.longitude.toFixed(5)}  />
      </div>
    </div>
  );
}

// 5. Sub-component
interface MetaRowProps { label: string; value: string | number }

function MetaRow({ label, value }: MetaRowProps) {
  return (
    <div style={styles.metaRow}>
      <span style={styles.metaLabel}>{label}</span>
      <span style={styles.metaValue}>{value}</span>
    </div>
  );
}

// 6. Styles
const styles = {
  card: {
    position:       "absolute" as const,
    bottom:         24,
    left:           16,
    zIndex:         1000,
    width:          260,
    borderRadius:   14,
    overflow:       "hidden",
    background:     COLORS.overlayDark,
    backdropFilter: "blur(12px)",
    border:         `1px solid ${COLORS.borderSoft}`,
    boxShadow:      "0 16px 48px rgba(0,0,0,0.60)",
  },
  header: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    padding:        "10px 12px 0",
  },
  badge: {
    padding:      "3px 10px",
    borderRadius: 20,
    fontSize:     11,
    fontWeight:   700,
    letterSpacing: "0.06em",
  },
  closeBtn: {
    background:   "transparent",
    border:       "none",
    color:        COLORS.textMuted,
    cursor:       "pointer",
    padding:      4,
    borderRadius: 4,
    display:      "flex",
    alignItems:   "center",
  },
  thumbnail: {
    width:      "100%",
    height:     120,
    objectFit:  "cover" as const,
    margin:     "10px 0 0",
    display:    "block",
  },
  meta: {
    padding:       "10px 12px 14px",
    display:       "flex",
    flexDirection: "column" as const,
    gap:           6,
  },
  metaRow: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "baseline",
  },
  metaLabel: {
    fontSize:    11,
    color:       COLORS.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  },
  metaValue: {
    fontSize:   12,
    color:      COLORS.textPrimary,
    fontWeight: 500,
  },
} as const;
