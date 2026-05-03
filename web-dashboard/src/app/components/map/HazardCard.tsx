// 1. Imports — External
import { useCallback, useMemo } from "react";
import { X, GripHorizontal } from "lucide-react";

// 1. Imports — Local
import { COLORS, SEVERITY_BADGE, SPACING }  from "../../../constants/theme";
import { useDraggableCard }                  from "../../../hooks/useDraggableCard";
import { severityMarkerColor }               from "../../../utils/mapHelpers";
import { ImageSlider }                       from "./ImageSlider";
import type { Hazard }                       from "../../../types/map";

// 2. Interfaces
interface HazardCardProps {
  hazard:  Hazard;
  onClose: () => void;
}

interface BadgeStyle {
  bg: string;
  text: string;
  border: string;
}

interface CompactBodyProps {
  hazard: Hazard;
  badge:  BadgeStyle;
}

interface ExpandedBodyProps {
  hazard:  Hazard;
  badge:   BadgeStyle;
  images:  string[];
}

interface MetaPairProps {
  label: string;
  value: string | number;
  mono?: boolean;
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
 * Hazard detail card with two distinct visual states:
 *
 * Compact (corner) — summary only: severity, type, status, date.
 * Expanded (centred) — full detail: image slider, description, reporter,
 *   and a 2-column meta grid. Description & reporter are hidden in compact
 *   mode to reduce noise.
 *
 * Drag/snap/expand logic is fully delegated to useDraggableCard.
 */
export function HazardCard({ hazard, onClose }: HazardCardProps) {
  const { corner, isExpanded, cardRef, onMouseDown, onCardClick, onCollapse } =
    useDraggableCard("bottom-left");

  const badge = SEVERITY_BADGE[hazard.severity] ?? SEVERITY_BADGE.low;

  /**
   * Derived image list: prefer image_urls array (multi-image),
   * fall back to single image_url for backwards compatibility.
   * Capped at 5 — the storage contract enforced at report creation.
   */
  const images = useMemo<string[]>(() => {
    if (hazard.image_urls && hazard.image_urls.length > 0)
      return hazard.image_urls.slice(0, 5);
    if (hazard.image_url) return [hazard.image_url];
    return [];
  }, [hazard.image_urls, hazard.image_url]);

  /** Prevents close button from triggering card drag or expand. */
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
        {/* ── Top bar: grip + close (always visible) */}
        <div style={styles.topBar}>
          <div style={styles.gripArea}>
            <GripHorizontal size={14} color={COLORS.textMuted} />
          </div>
          <button
            style={styles.closeBtn}
            onMouseDown={handleCloseBtnMouseDown}
            onClick={handleClose}
            aria-label="Close hazard card"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Content switches per state */}
        {isExpanded
          ? <ExpandedBody hazard={hazard} badge={badge} images={images} />
          : <CompactBody  hazard={hazard} badge={badge} />
        }
      </div>
    </>
  );
}

// 5. Sub-components ───────────────────────────────────────────────────────────

/**
 * Compact view — shown in corner mode.
 * Intentionally minimal: just enough to identify the hazard.
 * Description and reporter are deliberately withheld (expand to see).
 */
function CompactBody({ hazard, badge }: CompactBodyProps) {
  const severityColor = severityMarkerColor(hazard.severity);

  return (
    <>
      <div style={styles.compactHeader}>
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
      </div>

      <div className="hc-compact">
        <p className="hc-compact-type">
          {hazard.defect_type.replace(/_/g, " ")}
        </p>

        <div className="hc-compact-row">
          <span
            className="hc-compact-dot"
            style={{ background: severityColor, boxShadow: `0 0 5px ${severityColor}` }}
          />
          <span>{hazard.status}</span>
          <span className="hc-compact-sep">·</span>
          <span>{formatDate(hazard.created_at)}</span>
        </div>

        <p className="hc-expand-hint">Click to expand full report ›</p>
      </div>
    </>
  );
}

/**
 * Expanded view — shown when card is centred on screen.
 * Reveals description, reporter name, and a multi-image slider.
 *
 * Why separate from CompactBody: the DOM structure and content are
 * substantially different enough that conditional rendering with a single
 * component would add more complexity than separate sub-components.
 */
function ExpandedBody({ hazard, badge, images }: ExpandedBodyProps) {
  return (
    <div className="hc-expanded" onClick={(e) => e.stopPropagation()}>
      {/* Image slider */}
      {images.length > 0 && (
        <ImageSlider images={images} alt={hazard.defect_type} />
      )}

      {/* Headline */}
      <div className="hc-headline">
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
        <p className="hc-defect-type">
          {hazard.defect_type.replace(/_/g, " ")}
        </p>
      </div>

      <div className="hc-divider" />

      {/* Description — only shown when present */}
      {hazard.description && (
        <div className="hc-section">
          <p className="hc-section-label">Description</p>
          <div className="hc-description-box">{hazard.description}</div>
        </div>
      )}

      {/* Meta grid */}
      <div className="hc-section">
        <div className="hc-meta-grid">
          <MetaPair label="Type"      value={hazard.defect_type.replace(/_/g, " ")} />
          <MetaPair label="Status"    value={hazard.status}                         />
          <MetaPair label="Reported"  value={formatDate(hazard.created_at)}         />
          <MetaPair label="Reporter" value={hazard.reporter_name ?? "Anonymous"} />
          <MetaPair label="Latitude"  value={hazard.latitude.toFixed(5)}  mono />
          <MetaPair label="Longitude" value={hazard.longitude.toFixed(5)} mono />
        </div>
      </div>
    </div>
  );
}

function MetaPair({ label, value, mono }: MetaPairProps) {
  return (
    <div className="hc-meta-pair">
      <span className="hc-meta-label">{label}</span>
      <span className={`hc-meta-value${mono ? " mono" : ""}`}>{value}</span>
    </div>
  );
}

// 6. Styles — visual chrome only; all layout handled by map.css classes
const styles = {
  topBar: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    padding:        `${SPACING.xs}px ${SPACING.sm}px`,
    borderBottom:   `1px solid ${COLORS.borderFaint}`,
  },
  gripArea: {
    display:    "flex",
    alignItems: "center",
    opacity:    0.45,
    pointerEvents: "none" as const,
  },
  compactHeader: {
    padding: `${SPACING.sm}px ${SPACING.sm}px ${SPACING.xs}px`,
  },
  badge: {
    display:       "inline-block",
    padding:       `3px ${SPACING.sm}px`,
    borderRadius:  20,
    fontSize:      11,
    fontWeight:    700,
    letterSpacing: "0.06em",
    userSelect:    "none" as const,
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
} as const;
