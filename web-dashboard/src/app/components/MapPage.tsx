import React, { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../../lib/supabase";
import { X, RefreshCw, MapPin, Layers, AlertTriangle } from "lucide-react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  // Severity — dominant-tier palette
  sevHigh:   "#ef4444",   // red-500
  sevMedium: "#f97316",   // orange-500
  sevLow:    "#fef08a",   // yellow-200
  sevNone:   "#22c55e",   // green-500

  // Polygon borders
  polyBorder:      "rgba(255,255,255,0.25)",
  polyBorderHover: "rgba(255,255,255,0.70)",

  // UI chrome
  accent:      "#d97706",
  accentHover: "#b45309",
  accentGlow:  "rgba(217,119,6,0.35)",
  accentSoft:  "rgba(217,119,6,0.18)",
  accentLine:  "rgba(217,119,6,0.12)",
  accentDot:   "rgba(217,119,6,0.40)",

  bgDark:        "#0b0f19",
  bgDeep:        "#060c18",
  bgPanel:       "#1e293b",
  bgOverlay:     "rgba(15,23,42,0.90)",
  bgOverlayBlur: "rgba(15,23,42,0.85)",
  bgError:       "rgba(239,68,68,0.12)",
  bgErrorBorder: "rgba(239,68,68,0.30)",

  textMuted:  "#94a3b8",
  textWhite:  "#ffffff",
  borderSoft: "rgba(255,255,255,0.10)",
  borderFaint: "rgba(255,255,255,0.05)",
} as const;

const POLY = {
  fillOpacity:      0.55,
  fillOpacityHover: 0.80,
  weight:           1.5,
  weightHover:      2.5,
} as const;

const MAP = {
  center:            [4.2105, 109.5] as [number, number],
  zoom:              6,
  minZoom:           6,
  bounds:            [[0.8, 99.6], [7.5, 119.3]] as LatLngBoundsExpression,
  boundsViscosity:   1.0,
  tileUrl:           "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  tileAttribution:   '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  fallbackImageUrl:  "https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=400",
} as const;

// ─── Fix Leaflet default marker icon paths broken by bundlers ─────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface StateHeatmapStat {
  id: number;
  state_name: string;
  iso_code: string;
  geojson: object;
  total_reports: number;
  high_severity_count: number;
  medium_severity_count: number;
  low_severity_count: number;
  high_severity_ratio: number;
}

interface Hazard {
  id: string;
  defect_type: string;
  severity: "high" | "medium" | "low";
  status: string;
  latitude: number;
  longitude: number;
  image_url: string;
  state_id: number;
  created_at: string;
}

type MapView = "heatmap" | "pins";

// ─── Color helpers ────────────────────────────────────────────────────────────
/**
 * Color by dominant severity tier (4-tier spec):
 *   0 reports          → green  (no hazards)
 *   low dominant       → light yellow
 *   medium dominant    → orange
 *   high dominant      → red
 */
function dominantColor(props: {
  total_reports: number;
  high_severity_count: number;
  medium_severity_count: number;
  low_severity_count: number;
}): string {
  const { total_reports, high_severity_count, medium_severity_count, low_severity_count } = props;
  if (total_reports === 0) return COLORS.sevNone;
  const max = Math.max(high_severity_count, medium_severity_count, low_severity_count);
  if (high_severity_count   === max && high_severity_count   > 0) return COLORS.sevHigh;
  if (medium_severity_count === max && medium_severity_count > 0) return COLORS.sevMedium;
  return COLORS.sevLow;
}

function severityMarkerColor(severity: string): string {
  if (severity === "high")   return COLORS.sevHigh;
  if (severity === "medium") return COLORS.sevMedium;
  return COLORS.sevNone;
}

function markerIcon(severity: string): L.DivIcon {
  const bg = severityMarkerColor(severity);
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${bg};border:2.5px solid ${COLORS.textWhite};box-shadow:0 0 8px ${bg}99;"></div>`,
    iconSize:   [14, 14],
    iconAnchor: [7, 7],
  });
}

function buildFeatureCollection(stats: StateHeatmapStat[]) {
  return {
    type: "FeatureCollection" as const,
    features: stats.map((s) => ({
      type: "Feature" as const,
      properties: {
        state_name:            s.state_name,
        iso_code:              s.iso_code,
        total_reports:         s.total_reports,
        high_severity_count:   s.high_severity_count,
        medium_severity_count: s.medium_severity_count,
        low_severity_count:    s.low_severity_count,
        high_severity_ratio:   s.high_severity_ratio,
      },
      geometry: s.geojson,
    })),
  };
}

// ─── Blueprint Fallback ───────────────────────────────────────────────────────
const BLUEPRINT_NODES: [number, number][] = [
  [15, 12], [35, 45], [55, 28], [25, 70], [70, 55],
  [45, 82], [80, 18], [60, 65], [10, 55], [85, 40],
  [50, 10], [30, 90], [75, 75], [20, 38], [65, 30],
];

function MapFallback({ error, onRetry }: { error?: Error | null; onRetry: () => void }) {
  const isMissingView = error?.message?.includes("does not exist");
  return (
    <div
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ height: "calc(1024px - 64px)", background: COLORS.bgDeep }}
    >
      {/* Blueprint SVG */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <pattern id="bp-sm" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0L0 0 0 48" fill="none" stroke="rgba(148,163,184,0.07)" strokeWidth="1" />
          </pattern>
          <pattern id="bp-lg" width="192" height="192" patternUnits="userSpaceOnUse">
            <path d="M192 0L0 0 0 192" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-sm)" />
        <rect width="100%" height="100%" fill="url(#bp-lg)" />
        {BLUEPRINT_NODES.slice(0, 8).map(([x, y], i) => {
          const [nx, ny] = BLUEPRINT_NODES[(i + 3) % BLUEPRINT_NODES.length];
          return (
            <line key={i}
              x1={`${x}%`} y1={`${y}%`} x2={`${nx}%`} y2={`${ny}%`}
              stroke={COLORS.accentLine} strokeWidth="1.5" strokeDasharray="6 4"
            />
          );
        })}
        {BLUEPRINT_NODES.map(([x, y], i) => (
          <g key={i}>
            <circle cx={`${x}%`} cy={`${y}%`} r="5" fill={COLORS.accentSoft} stroke={COLORS.accentDot} strokeWidth="1" />
            <circle cx={`${x}%`} cy={`${y}%`} r="2" fill={COLORS.accent} opacity="0.7" />
          </g>
        ))}
      </svg>

      {/* Error card */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 rounded-2xl"
        style={{ background: COLORS.bgOverlayBlur, backdropFilter: "blur(16px)", border: `1px solid ${COLORS.borderSoft}`, maxWidth: 420 }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: COLORS.bgError, border: `1px solid ${COLORS.bgErrorBorder}` }}
        >
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-white text-xl font-semibold mb-2">Map data currently unavailable</h2>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.textMuted }}>
            {isMissingView
              ? "The heatmap view doesn't exist yet. Run scripts/create_heatmap_view.sql in Supabase SQL Editor, then retry."
              : (error?.message ?? "Unable to connect to the data source. Check your network and Supabase credentials.")}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
          style={{ background: COLORS.accent, color: COLORS.textWhite, boxShadow: `0 0 20px ${COLORS.accentGlow}` }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.accentHover; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.accent; }}
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    </div>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
interface EBState { hasError: boolean; error: Error | null }
class MapErrorBoundary extends React.Component<{ children: React.ReactNode; onReset: () => void }, EBState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[MapErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <MapFallback
          error={this.state.error}
          onRetry={() => { this.setState({ hasError: false, error: null }); this.props.onReset(); }}
        />
      );
    }
    return this.props.children;
  }
}

// ─── Hazard Detail Card ───────────────────────────────────────────────────────
const SEVERITY_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: "#450a0a", text: "#f87171", border: "#7f1d1d" },
  medium: { bg: "#431407", text: "#fb923c", border: "#7c2d12" },
  low:    { bg: "#052e16", text: "#4ade80", border: "#14532d" },
};

function HazardCard({ hazard, onClose }: { hazard: Hazard; onClose: () => void }) {
  const badge = SEVERITY_BADGE[hazard.severity] ?? SEVERITY_BADGE.low;
  return (
    <div
      className="absolute bottom-8 left-8 z-[1000] w-[340px] rounded-2xl overflow-hidden"
      style={{ background: COLORS.bgPanel, border: `1px solid ${COLORS.borderSoft}`, boxShadow: "0 20px 60px rgba(0,0,0,0.70)" }}
    >
      <div className="relative">
        <img
          src={hazard.image_url}
          alt={hazard.defect_type}
          className="w-full object-cover"
          style={{ height: 170 }}
          onError={(e) => { (e.target as HTMLImageElement).src = MAP.fallbackImageUrl; }}
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(0,0,0,0.50)", color: COLORS.textWhite }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.70)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.50)"; }}
        >
          <X className="w-4 h-4" />
        </button>
        <span
          className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold capitalize"
          style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}
        >
          {hazard.severity} Severity
        </span>
      </div>

      <div className="p-5">
        <p className="font-semibold capitalize mb-1" style={{ color: COLORS.textWhite }}>
          {hazard.defect_type.replace(/_/g, " ")}
        </p>
        <p className="text-xs mb-4" style={{ color: COLORS.textMuted }}>
          Reported {new Date(hazard.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        <div className="space-y-2 pt-3" style={{ borderTop: `1px solid ${COLORS.borderFaint}` }}>
          {([
            ["Latitude",  hazard.latitude.toFixed(4)],
            ["Longitude", hazard.longitude.toFixed(4)],
            ["Status",    hazard.status],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span style={{ color: COLORS.textMuted }}>{label}</span>
              <span className="font-mono capitalize" style={{ color: label === "Status" ? COLORS.sevNone : COLORS.textWhite }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Heatmap Layer ────────────────────────────────────────────────────────────
const HeatmapLayer = React.memo(function HeatmapLayer({ stats }: { stats: StateHeatmapStat[] }) {
  // Stable reference — only rebuilds when stats array identity changes
  const geoData = useMemo(() => buildFeatureCollection(stats), [stats]);

  const style = useCallback((feature: any) => ({
    fillColor:   dominantColor(feature.properties),
    fillOpacity: POLY.fillOpacity,
    color:       COLORS.polyBorder,
    weight:      POLY.weight,
  }), []);

  const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
    const p = feature.properties;
    (layer as L.Path).on({
      mouseover: (e) => (e.target as L.Path).setStyle({
        fillOpacity: POLY.fillOpacityHover,
        weight:      POLY.weightHover,
        color:       COLORS.polyBorderHover,
      }),
      mouseout: (e) => (e.target as L.Path).setStyle({
        fillOpacity: POLY.fillOpacity,
        weight:      POLY.weight,
        color:       COLORS.polyBorder,
      }),
    });
    layer.bindTooltip(
      `<div style="background:${COLORS.bgPanel};border:1px solid ${COLORS.borderSoft};border-radius:8px;padding:8px 12px;color:${COLORS.textWhite};font-size:13px;line-height:1.7">
        <strong style="color:${COLORS.accent}">${p.state_name}</strong><br/>
        Reports: <strong>${p.total_reports}</strong><br/>
        <span style="color:${COLORS.sevHigh}">▲ High ${p.high_severity_count}</span> &nbsp;
        <span style="color:${COLORS.sevMedium}">● Med ${p.medium_severity_count}</span> &nbsp;
        <span style="color:${COLORS.sevNone}">▼ Low ${p.low_severity_count}</span>
      </div>`,
      { sticky: true, opacity: 1, className: "leaflet-tooltip-jalanguard" }
    );
  }, []);

  return (
    <GeoJSON
      key="heatmap-layer"
      data={geoData as GeoJSON.FeatureCollection}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
});

// ─── Pins Layer ───────────────────────────────────────────────────────────────
const PinsLayer = React.memo(function PinsLayer({
  hazards,
  onSelect,
}: {
  hazards: Hazard[];
  onSelect: (h: Hazard) => void;
}) {
  return (
    <>
      {hazards.map((h) => (
        <Marker
          key={h.id}
          position={[h.latitude, h.longitude]}
          icon={markerIcon(h.severity)}
          eventHandlers={{ click: () => onSelect(h) }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
            <div style={{
              background: COLORS.bgPanel,
              border: `1px solid ${COLORS.borderSoft}`,
              borderRadius: 6,
              padding: "5px 10px",
              color: COLORS.textWhite,
              fontSize: 12,
            }}>
              <span style={{ textTransform: "capitalize" }}>{h.defect_type.replace(/_/g, " ")}</span>
              {" — "}
              <span style={{ color: severityMarkerColor(h.severity), fontWeight: 600, textTransform: "capitalize" }}>
                {h.severity}
              </span>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
});

// ─── View Toggle ──────────────────────────────────────────────────────────────
function ViewToggle({ view, onChange }: { view: MapView; onChange: (v: MapView) => void }) {
  return (
    <div
      className="absolute top-4 right-4 z-[1000] flex rounded-xl overflow-hidden"
      style={{ background: COLORS.bgPanel, border: `1px solid ${COLORS.borderSoft}`, boxShadow: "0 8px 32px rgba(0,0,0,0.50)" }}
    >
      {(["heatmap", "pins"] as MapView[]).map((v) => {
        const active = view === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all"
            style={{ background: active ? COLORS.accent : "transparent", color: active ? COLORS.textWhite : COLORS.textMuted }}
          >
            {v === "heatmap" ? <Layers className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

// ─── Legend — exactly mirrors 4-tier dominantColor logic ─────────────────────
const LEGEND_TIERS = [
  { color: COLORS.sevHigh,   label: "High severity dominant"   },
  { color: COLORS.sevMedium, label: "Medium severity dominant" },
  { color: COLORS.sevLow,    label: "Low severity dominant"    },
  { color: COLORS.sevNone,   label: "0 active reports"         },
] as const;

function HeatmapLegend() {
  return (
    <div
      className="absolute bottom-6 right-4 z-[1000] rounded-xl p-4"
      style={{ background: COLORS.bgOverlay, backdropFilter: "blur(8px)", border: `1px solid ${COLORS.borderSoft}`, minWidth: 200 }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.textMuted }}>
        Dominant Severity
      </p>
      {LEGEND_TIERS.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
          <span className="text-xs" style={{ color: COLORS.textMuted }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Loading Overlay ──────────────────────────────────────────────────────────
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center pointer-events-none">
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl"
        style={{ background: COLORS.bgOverlay, backdropFilter: "blur(8px)", border: `1px solid ${COLORS.borderSoft}` }}
      >
        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.accent, borderTopColor: "transparent" }} />
        <span className="text-sm" style={{ color: COLORS.textMuted }}>Loading map data…</span>
      </div>
    </div>
  );
}

// ─── Map Inner — component that must live inside MapContainer ─────────────────
function MapInner({
  mapView, stats, hazards, onSelectHazard,
}: {
  mapView: MapView;
  stats: StateHeatmapStat[];
  hazards: Hazard[];
  onSelectHazard: (h: Hazard | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (mapView === "heatmap" && stats.length > 0) {
      map.setView(MAP.center, MAP.zoom, { animate: true });
    }
  }, [mapView, stats.length, map]);

  return (
    <>
      {mapView === "heatmap" && stats.length > 0 && <HeatmapLayer stats={stats} />}
      {mapView === "pins"    && <PinsLayer hazards={hazards} onSelect={onSelectHazard} />}
    </>
  );
}

// ─── Main MapPage ─────────────────────────────────────────────────────────────
export function MapPage() {
  const [mapView,        setMapView]        = useState<MapView>("heatmap");
  const [stats,          setStats]          = useState<StateHeatmapStat[]>([]);
  const [hazards,        setHazards]        = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<Error | null>(null);
  const [retryKey,       setRetryKey]       = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, hazardsRes] = await Promise.all([
        supabase.from("state_heatmap_stats").select("*"),
        supabase.from("hazards").select("*").eq("status", "active"),
      ]);
      if (statsRes.error)   throw new Error(statsRes.error.message);
      if (hazardsRes.error) throw new Error(hazardsRes.error.message);
      setStats(statsRes.data   as StateHeatmapStat[]);
      setHazards(hazardsRes.data as Hazard[]);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, retryKey]);

  const handleRetry = useCallback(() => setRetryKey((k) => k + 1), []);

  const handleViewChange = useCallback((v: MapView) => {
    setMapView(v);
    setSelectedHazard(null);
  }, []);

  if (!loading && error) {
    return <MapFallback error={error} onRetry={handleRetry} />;
  }

  return (
    <MapErrorBoundary key={retryKey} onReset={handleRetry}>
      <div className="relative w-full" style={{ height: "calc(1024px - 64px)" }}>
        {loading && <LoadingOverlay />}

        <MapContainer
          center={MAP.center}
          zoom={MAP.zoom}
          minZoom={MAP.minZoom}
          maxBounds={MAP.bounds}
          maxBoundsViscosity={MAP.boundsViscosity}
          preferCanvas={true}
          zoomControl={false}
          attributionControl={false}
          style={{ width: "100%", height: "100%", background: COLORS.bgDark }}
        >
          <TileLayer url={MAP.tileUrl} attribution={MAP.tileAttribution} />

          {!loading && (
            <MapInner
              mapView={mapView}
              stats={stats}
              hazards={hazards}
              onSelectHazard={setSelectedHazard}
            />
          )}
        </MapContainer>

        <ViewToggle view={mapView} onChange={handleViewChange} />

        {mapView === "heatmap" && !loading && stats.length > 0 && <HeatmapLegend />}

        {mapView === "pins" && selectedHazard && (
          <HazardCard hazard={selectedHazard} onClose={() => setSelectedHazard(null)} />
        )}
      </div>
    </MapErrorBoundary>
  );
}
