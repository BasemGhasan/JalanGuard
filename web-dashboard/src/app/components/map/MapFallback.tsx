// 1. Imports
import { useCallback } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { COLORS, MAP_CONFIG } from "../../../constants/theme";

// 2. Interfaces
interface MapFallbackProps {
  error:    Error;
  onRetry:  () => void;
}

// 3. Component
/**
 * Full-screen blueprint-style fallback rendered when the Supabase fetch
 * fails entirely (network error, RLS rejection, etc.).
 * Uses the project's midnight-infrastructure palette with an SVG grid overlay.
 */
export function MapFallback({ error, onRetry }: MapFallbackProps) {
  const handleRetry = useCallback(() => onRetry(), [onRetry]);

  return (
    <div style={styles.root}>
      {/* Blueprint SVG grid */}
      <svg style={styles.grid} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={COLORS.accentLine} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Map silhouette placeholder */}
      <img
        src={MAP_CONFIG.fallbackImage}
        alt=""
        style={styles.silhouette}
      />

      {/* Error card */}
      <div style={styles.card}>
        <div style={styles.iconRow}>
          <AlertTriangle size={20} color={COLORS.error} />
          <span style={styles.title}>Map data unavailable</span>
        </div>
        <p style={styles.body}>{error.message}</p>
        <button style={styles.btn} onClick={handleRetry}>
          <RefreshCw size={14} />
          Retry
        </button>
      </div>

      {/* Accent scan-line */}
      <div style={styles.scanLine} />
    </div>
  );
}

// 4. Styles
const styles = {
  root: {
    position:       "relative" as const,
    width:          "100%",
    height:         MAP_CONFIG.containerHeight,
    background:     COLORS.bgDeep,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    overflow:       "hidden",
  },
  grid: {
    position: "absolute" as const,
    inset:    0,
    width:    "100%",
    height:   "100%",
  },
  silhouette: {
    position: "absolute" as const,
    inset:    0,
    width:    "100%",
    height:   "100%",
    objectFit: "cover" as const,
    opacity:  0.06,
    filter:   "grayscale(1)",
  },
  card: {
    position:       "relative" as const,
    zIndex:         10,
    background:     COLORS.overlayDark,
    backdropFilter: "blur(12px)",
    border:         `1px solid ${COLORS.errorBorder}`,
    borderRadius:   16,
    padding:        "32px 40px",
    display:        "flex",
    flexDirection:  "column" as const,
    alignItems:     "center",
    gap:            16,
    textAlign:      "center" as const,
    maxWidth:       400,
  },
  iconRow: {
    display:    "flex",
    alignItems: "center",
    gap:        10,
  },
  title: {
    fontSize:   18,
    fontWeight: 600,
    color:      COLORS.textPrimary,
  },
  body: {
    fontSize: 13,
    color:    COLORS.textMuted,
  },
  btn: {
    display:      "flex",
    alignItems:   "center",
    gap:          8,
    padding:      "10px 24px",
    borderRadius: 10,
    border:       "none",
    background:   COLORS.secondary,
    color:        COLORS.white,
    fontWeight:   500,
    fontSize:     14,
    cursor:       "pointer",
  },
  scanLine: {
    position:   "absolute" as const,
    bottom:     0,
    left:       0,
    right:      0,
    height:     2,
    background: `linear-gradient(90deg, transparent, ${COLORS.accentGlow}, transparent)`,
  },
} as const;
