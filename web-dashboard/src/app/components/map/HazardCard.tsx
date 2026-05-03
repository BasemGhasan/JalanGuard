// 1. Imports — External
import { useCallback } from "react";
import { X, Maximize2, GripHorizontal } from "lucide-react";

// 1. Imports — Local
import { COLORS, SEVERITY_BADGE, SPACING } from "../../../constants/theme";
import { useDraggableCard }                from "../../../hooks/useDraggableCard";
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
 * Drag from anywhere on the card — snaps to the nearest corner on release.
 * Click (without dragging) to expand 2× centred on screen.
 * Click the backdrop to collapse; × to close entirely.
 *
 * All drag/snap logic lives in useDraggableCard. This component is pure UI.
 */
export function HazardCard({ hazard, onClose }: HazardCardProps) {
  const { corner, isExpanded, cardRef, onMouseDown, onCardClick, onCollapse } =
    useDraggableCard("bottom-left");

  const badge = SEVERITY_BADGE[hazard.severity] ?? SEVERITY_BADGE.low;

  /** Stop the close button from triggering a card drag or expand. */
  const handleCloseBtnMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose();
    },
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
        {/* ── Drag handle (visual indicator only — whole card is draggable) */}
        <div style={styles.dragHandle}>
          <GripHorizontal size={14} color={COLORS.textMuted} />
          {!isExpanded && (
            <Maximize2 size={11} color={COLORS.textMuted} style={{ opacity: 0.5 }} />
          )}
        </div>

        {/* ── Header */}
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

        {/* ── Thumbnail */}
        {hazard.image_url && (
          <img
            src={hazard.image_url}
            alt={hazard.defect_type}
            style={styles.thumbnail}
            loading="lazy"
          />
        )}

        {/* ── Meta rows */}
        <div style={styles.meta}>
          <MetaRow label="TYPE"      value={hazard.defect_type.replace(/_/g, " ")} />
          <MetaRow label="STATUS"    value={hazard.status}                         />
          <MetaRow label="REPORTED"  value={formatDate(hazard.created_at)}         />
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

// 6. Styles — visual chrome only; all positioning handled by map.css + JS hook
const styles = {
  dragHandle: {
    display:        "flex",
    justifyContent: "center",
    alignItems:     "center",
    gap:            SPACING.xs,
    padding:        `${SPACING.xs}px`,
    opacity:        0.45,
    pointerEvents:  "none" as const, // let mousedown fall through to card div
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
