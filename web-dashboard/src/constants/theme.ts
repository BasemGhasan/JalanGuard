/**
 * Single source of truth for all design tokens.
 * Never import raw hex values in components — always use these exports.
 */

export const COLORS = {
  // ── Brand ────────────────────────────────────────────────────────────────
  primary:    "#0F172A",
  secondary:      "#D97706",
  secondaryHover: "#B45309",
  accent:     "#334155",
  background: "#0B0F19",
  surface:    "#1E293B",

  // ── Severity (dominant-tier palette for map) ─────────────────────────────
  sevHigh:   "#D42424",
  sevMedium: "#EF551D",
  sevLow:    "#F1B70B",
  sevNone:   "#22C55E",

  // ── General status ────────────────────────────────────────────────────────
  success:  "#10B981",
  error:    "#EF4444",
  warning:  "#F59E0B",
  info:     "#3B82F6",

  // ── Base ─────────────────────────────────────────────────────────────────
  white:    "#FFFFFF",
  black:    "#000000",
  disabled: "#94A3B8",

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary: "#FFFFFF",
  textMuted:   "#94A3B8",

  // ── Borders / overlays ────────────────────────────────────────────────────
  borderSoft:  "rgba(255,255,255,0.10)",
  borderFaint: "rgba(255,255,255,0.05)",
  overlayDark: "rgba(15,23,42,0.90)",
  overlayBlur: "rgba(15,23,42,0.85)",

  // ── Blueprint fallback ────────────────────────────────────────────────────
  bgDeep:     "#060C18",
  accentGlow: "rgba(217,119,6,0.35)",
  accentSoft: "rgba(217,119,6,0.18)",
  accentLine: "rgba(217,119,6,0.12)",
  accentDot:  "rgba(217,119,6,0.40)",

  // ── Polygon (GeoJSON layer) ───────────────────────────────────────────────
  polyBorder:      "rgba(255,255,255,0.25)",
  polyBorderHover: "rgba(255,255,255,0.70)",

  // ── Error state ───────────────────────────────────────────────────────────
  errorBg:     "rgba(239,68,68,0.12)",
  errorBorder: "rgba(239,68,68,0.30)",
} as const;

/** Badge styles per severity tier — derived from severity base colors. */
export const SEVERITY_BADGE = {
  high:   { bg: "#D4242420", text: COLORS.sevHigh,   border: "#D4242460" },
  medium: { bg: "#EF551D20", text: COLORS.sevMedium, border: "#EF551D60" },
  low:    { bg: "#F1B70B20", text: COLORS.sevLow,    border: "#F1B70B60" },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FONT_SIZES = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

/** Leaflet map configuration constants — kept here so MapPage imports one place. */
export const MAP_CONFIG = {
  center:          [4.2105, 109.5] as [number, number],
  zoom:            6,
  minZoom:         6,
  /** Rough bounding box for Malaysia (SW corner, NE corner) */
  bounds:          [[0.8, 99.6], [7.5, 119.3]] as [[number, number], [number, number]],
  boundsViscosity: 1.0,
  tileUrl:         "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  tileAttribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  fallbackImage:   "https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=400",
  containerHeight: "calc(100vh - 64px)",
} as const;

export const POLY_STYLE = {
  fillOpacity:      0.55,
  fillOpacityHover: 0.80,
  weight:           1.5,
  weightHover:      2.5,
} as const;
