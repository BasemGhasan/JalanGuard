// 1. Imports — External
import { useState, useMemo, useCallback } from "react";
import { X } from "lucide-react";

// 1. Imports — Local
import { COLORS, SEVERITY_BADGE, SPACING } from "../../../constants/theme";
import { ImageSlider }                     from "./ImageSlider";
import type { Hazard }                     from "../../../types/map";

// 2. Interfaces
interface HazardCardProps {
  hazard:        Hazard;
  onClose:       () => void;
  startExpanded?: boolean;
}

// 3. Helpers
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

// 4. Component
export function HazardCard({ hazard, onClose, startExpanded = false }: HazardCardProps) {
  const [isExpanded, setIsExpanded] = useState(startExpanded);

  const badge = SEVERITY_BADGE[hazard.severity] ?? SEVERITY_BADGE.low;

  const images = useMemo<string[]>(() => {
    if (hazard.image_urls && hazard.image_urls.length > 0)
      return hazard.image_urls.slice(0, 5);
    if (hazard.image_url) return [hazard.image_url];
    return [];
  }, [hazard.image_urls, hazard.image_url]);

  const handleClose = useCallback(
    (e: React.MouseEvent) => { 
      e.stopPropagation(); 
      onClose(); 
    },
    [onClose],
  );

  // Click handler for the card to trigger expansion
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  return (
    <>
      {/* Backdrop — FIXED: clicking the backdrop now completely closes the expanded card */}
      {isExpanded && (
        <div
          className="hazard-card-backdrop"
          onClick={handleClose}
        />
      )}

      <div
        className={`hazard-card${isExpanded ? " is-expanded" : ""}`}
        onClick={handleCardClick}
        style={{ cursor: isExpanded ? "default" : "pointer"}}
      >
        {/* ── Header: severity badge + close button ────────────────────── */}
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

          <button
            style={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close hazard card"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Image: slider when expanded, thumbnail when compact ────────── */}
        {images.length > 0 && (
          isExpanded
            ? <ImageSlider images={images} alt={hazard.defect_type} />
            : <img
                src={images[0]}
                alt={hazard.defect_type}
                style={styles.thumbnail}
                loading="lazy"
              />
        )}

        {/* ── Description: only visible in expanded mode ─────────────────── */}
        {isExpanded && hazard.description && (
          <div
            style={styles.descSection}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={styles.descLabel}>DESCRIPTION</p>
            <div style={styles.descBox}>{hazard.description}</div>
          </div>
        )}

        {/* ── Meta rows ──────────────────────────────────────────────────── */}
        <div style={styles.meta}>
          <MetaRow label="TYPE"      value={hazard.defect_type.replace(/_/g, " ")} />
          <MetaRow label="STATUS"    value={hazard.status}                         />
          <MetaRow label="REPORTED"  value={formatDate(hazard.created_at)}         />
          {isExpanded && (
            <MetaRow label="REPORTER" value={hazard.reporter_name ?? "Anonymous"} />
          )}
          <MetaRow label="LATITUDE"  value={hazard.latitude.toFixed(5)}            />
          <MetaRow label="LONGITUDE" value={hazard.longitude.toFixed(5)}           />
        </div>
      </div>
    </>
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
  header: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    padding:        `${SPACING.sm}px`,
  },
  badge: {
    padding:       `3px ${SPACING.sm}px`,
    borderRadius:  20,
    fontSize:      11,
    fontWeight:    700,
    letterSpacing: "0.06em",
  },
  closeBtn: {
    background:   "transparent",
    border:       "none",
    color:        COLORS.textMuted,
    cursor:       "pointer",
    padding:      SPACING.xs,
    borderRadius: 4,
    display:      "flex",
    alignItems:   "center",
  },
  thumbnail: {
    width:     "100%",
    height:    130,
    objectFit: "cover" as const,
    display:   "block",
  },
  descSection: {
    padding:    `${SPACING.sm}px ${SPACING.sm}px ${SPACING.xs}px`,
    borderTop:  `1px solid ${COLORS.borderFaint}`,
  },
  descLabel: {
    fontSize:      10,
    color:         COLORS.textMuted,
    letterSpacing: "0.08em",
    fontWeight:    600,
    marginBottom:  SPACING.xs,
  },
  descBox: {
    background:   COLORS.surface,
    border:       `1px solid ${COLORS.borderSoft}`,
    borderRadius: 8,
    padding:      `${SPACING.sm}px ${SPACING.sm}px`,
    fontSize:     12,
    color:        COLORS.textPrimary,
    lineHeight:   1.6,
    maxHeight:    96,
    overflowY:    "auto" as const,
    whiteSpace:   "pre-wrap" as const,
    cursor:       "text",
    userSelect:   "text" as const,
  },
  meta: {
    padding:       `${SPACING.sm}px ${SPACING.sm}px ${SPACING.md}px`,
    display:       "flex",
    flexDirection: "column" as const,
    gap:           SPACING.sm - 2,
  },
  metaRow: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "baseline",
    borderBottom:   `1px solid ${COLORS.borderFaint}`,
    paddingBottom:  4,
  },
  metaLabel: {
    fontSize:      10,
    color:         COLORS.textMuted,
    letterSpacing: "0.08em",
    fontWeight:    600,
  },
  metaValue: {
    fontSize:      12,
    color:         COLORS.textPrimary,
    fontWeight:    500,
    textTransform: "capitalize" as const,
  },
} as const;