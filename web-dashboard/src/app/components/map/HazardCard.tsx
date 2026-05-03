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
 * Behaviour:
 *  - Draggable while in corner mode; snaps to the nearest corner on release.
 *  - Click anywhere on the card to expand it 2× to the screen centre.
 *  - Click the backdrop (or press Escape — via backdrop) to collapse back.
 *  - The × button closes the card entirely.
 */
export function HazardCard({ hazard, onClose }: HazardCardProps) {
  const {
    corner,
    isExpanded,
    isDragging,
    cardRef,
    onMouseDown,
    onCardClick,
    onCollapse,
  } = useDraggableCard("bottom-left");

  const badge = SEVERITY_BADGE[hazard.severity] ?? SEVERITY_BADGE.low;

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // prevent card-click expand
      onClose();
    },
    [onClose],
  );

  const handleHeaderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMouseDown(e);
    },
    [onMouseDown],
  );

  const cardClass = [
    "hazard-card",
    isExpanded  ? "is-expanded"  : "",
    isDragging  ? "is-dragging"  : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      {/* Full-screen backdrop — click outside to collapse */}
      {isExpanded && (
        <div className="hazard-card-backdrop" onClick={onCollapse} />
      )}

      <div
        ref={cardRef}
        className={cardClass}
        data-corner={corner}
        onClick={onCardClick}
      >
        {/* ── Drag handle ───────────────────────────────────────────── */}
        <div
          style={styles.dragHandle}
          onMouseDown={handleHeaderMouseDown}
          title="Drag to reposition"
        >
          <GripHorizontal size={14} color={COLORS.textMuted} />
        </div>

        {/* ── Header row ────────────────────────────────────────────── */}
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

          <div style={styles.headerRight}>
            {!isExpanded && (
              <Maximize2 size={12} color={COLORS.textMuted} style={{ marginRight: SPACING.xs }} />
            )}
            <button
              style={styles.closeBtn}
              onClick={handleClose}
              aria-label="Close hazard card"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Thumbnail ─────────────────────────────────────────────── */}
        {hazard.image_url && (
          <img
            src={hazard.image_url}
            alt={hazard.defect_type}
            style={styles.thumbnail}
            loading="lazy"
          />
        )}

        {/* ── Meta grid ─────────────────────────────────────────────── */}
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

// 6. Styles — non-positional styles only; all positioning handled by map.css
const styles = {
  dragHandle: {
    display:        "flex",
    justifyContent: "center",
    alignItems:     "center",
    padding:        `${SPACING.xs}px`,
    cursor:         "grab",
    opacity:        0.5,
    userSelect:     "none" as const,
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
  headerRight: {
    display:    "flex",
    alignItems: "center",
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
    fontSize:    12,
    color:       COLORS.textPrimary,
    fontWeight:  500,
    textTransform: "capitalize" as const,
  },
} as const;
