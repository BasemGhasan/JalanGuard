// 1. Imports — External
import { useCallback, useMemo } from "react";
import { X, Maximize2, GripHorizontal } from "lucide-react";

// 1. Imports — Local
import { COLORS, SEVERITY_BADGE, SPACING } from "../../../constants/theme";
import { useDraggableCard }                from "../../../hooks/useDraggableCard";
import { ImageSlider }                     from "./ImageSlider";
import type { Hazard }                     from "../../../types/map";

// 2. Interfaces
interface HazardCardProps {
  hazard:  Hazard;
  onClose: () => void;
}

// 3. Helpers
/** Formats an ISO date string to "DD MMM YYYY" in Malaysian locale. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

// 4. Component
/**
 * Floating hazard detail card.
 *
 * Compact (corner): original layout — drag handle, severity badge + close,
 * image thumbnail, TYPE/STATUS/REPORTED/LAT/LNG meta rows.
 *
 * Expanded (centred): same layout but thumbnail becomes a multi-image slider,
 * a DESCRIPTION block appears above the meta rows, and a REPORTER row is
 * appended. Description and reporter are intentionally hidden in compact mode.
 *
 * All drag/snap/expand logic lives in useDraggableCard.
 */
export function HazardCard({ hazard, onClose }: HazardCardProps) {
  const { corner, isExpanded, cardRef, onMouseDown, onCardClick, onCollapse } =
    useDraggableCard("bottom-left");

  const badge = SEVERITY_BADGE[hazard.severity] ?? SEVERITY_BADGE.low;

  /**
   * Derived image list — prefers image_urls array (multi-image support),
   * falls back to the legacy single image_url for older rows.
   * Capped at 5 per the Supabase Storage contract.
   */
  const images = useMemo<string[]>(() => {
    if (hazard.image_urls && hazard.image_urls.length > 0)
      return hazard.image_urls.slice(0, 5);
    if (hazard.image_url) return [hazard.image_url];
    return [];
  }, [hazard.image_urls, hazard.image_url]);

  /** Stop the close button from triggering a card drag or expand. */
  const handleCloseBtnMouseDown = useCallback(
    (e: React.MouseEvent) => e.stopPropagation(),
    [],
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onClose(); },
    [onClose],
  );

  return (
    <>
      {/* Backdrop — click outside to collapse */}
      {isExpanded && (
        <div className="hazard-card-backdrop" onClick={onCollapse} />
      )}

      <div
        ref={cardRef}
        data-corner={corner}
        className={`hazard-card${isExpanded ? " is-expanded" : ""}`}
        onMouseDown={onMouseDown}
        onClick={onCardClick}
      >
        {/* ── Drag handle ─────────────────────────────────────────────── */}
        <div style={styles.dragHandle}>
          <GripHorizontal size={14} color={COLORS.textMuted} />
          {!isExpanded && (
            <Maximize2 size={11} color={COLORS.textMuted} style={{ opacity: 0.5 }} />
          )}
        </div>

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
            onMouseDown={handleCloseBtnMouseDown}
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
          {/* Reporter only shown in expanded view */}
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

// 6. Styles — visual chrome; all positioning handled by map.css + JS hook
const styles = {
  dragHandle: {
    display:        "flex",
    justifyContent: "center",
    alignItems:     "center",
    gap:            SPACING.xs,
    padding:        `${SPACING.xs}px`,
    opacity:        0.45,
    pointerEvents:  "none" as const,
  },
  header: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    padding:        `0 ${SPACING.sm}px ${SPACING.xs}px`,
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
