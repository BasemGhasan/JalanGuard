import React, { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../../lib/supabase";
import { X, RefreshCw, MapPin, Layers, AlertTriangle } from "lucide-react";

// ─── Fix leaflet default marker icon paths broken by bundlers ────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function severityColor(ratio: number): string {
  if (ratio > 50) return "#ef4444";
  if (ratio > 20) return "#f97316";
  if (ratio > 0)  return "#eab308";
  return "#22c55e";
}

function markerIcon(severity: string): L.DivIcon {
  const bg =
    severity === "high"   ? "#ef4444" :
    severity === "medium" ? "#f97316" : "#22c55e";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${bg};border:2.5px solid #fff;
      box-shadow:0 0 8px ${bg}99;
    "></div>`,
    iconSize:   [14, 14],
    iconAnchor: [7, 7],
  });
}

function buildFeatureCollection(stats: StateHeatmapStat[]) {
  return {
    type: "FeatureCollection",
    features: stats.map((s) => ({
      type: "Feature",
      properties: { ...s, geojson: undefined },
      geometry: s.geojson,
    })),
  };
}

// ─── Blueprint Fallback ───────────────────────────────────────────────────────
function MapFallback({ error, onRetry }: { error?: Error | null; onRetry: () => void }) {
  const nodes = [
    [15, 12], [35, 45], [55, 28], [25, 70], [70, 55],
    [45, 82], [80, 18], [60, 65], [10, 55], [85, 40],
    [50, 10], [30, 90], [75, 75], [20, 38], [65, 30],
  ];
  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ height: "calc(1024px - 64px)", background: "#060c18" }}>
      {/* Blueprint SVG background */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <pattern id="bp-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0L0 0 0 48" fill="none" stroke="rgba(148,163,184,0.07)" strokeWidth="1" />
          </pattern>
          <pattern id="bp-grid-lg" width="192" height="192" patternUnits="userSpaceOnUse">
            <path d="M192 0L0 0 0 192" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-grid)" />
        <rect width="100%" height="100%" fill="url(#bp-grid-lg)" />
        {/* abstract connection lines */}
        {nodes.slice(0, 8).map((n, i) => {
          const next = nodes[(i + 3) % nodes.length];
          return (
            <line key={i}
              x1={`${n[0]}%`} y1={`${n[1]}%`}
              x2={`${next[0]}%`} y2={`${next[1]}%`}
              stroke="rgba(217,119,6,0.12)" strokeWidth="1.5" strokeDasharray="6 4" />
          );
        })}
        {/* nodes */}
        {nodes.map(([x, y], i) => (
          <g key={i}>
            <circle cx={`${x}%`} cy={`${y}%`} r="5" fill="rgba(217,119,6,0.18)" stroke="rgba(217,119,6,0.4)" strokeWidth="1" />
            <circle cx={`${x}%`} cy={`${y}%`} r="2" fill="#d97706" opacity="0.7" />
          </g>
        ))}
      </svg>

      {/* Error card */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 rounded-2xl border border-white/10"
        style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(16px)", maxWidth: 420 }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-white text-xl font-semibold mb-2">Map data currently unavailable</h2>
          <p className="text-[#94a3b8] text-sm leading-relaxed">
            {error?.message?.includes("does not exist")
              ? "The heatmap view doesn't exist yet. Run scripts/create_heatmap_view.sql in Supabase SQL Editor, then retry."
              : (error?.message ?? "Unable to connect to the data source. Check your network and Supabase credentials.")}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white font-medium transition-all shadow-[0_0_20px_rgba(217,119,6,0.35)]"
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
function HazardCard({ hazard, onClose }: { hazard: Hazard; onClose: () => void }) {
  const severityStyle: Record<string, string> = {
    high:   "bg-red-950 text-red-400 border-red-900",
    medium: "bg-orange-950 text-orange-400 border-orange-900",
    low:    "bg-emerald-950 text-emerald-400 border-emerald-900",
  };
  return (
    <div className="absolute bottom-8 left-8 z-[1000] w-[340px] rounded-2xl overflow-hidden border border-white/10"
      style={{ background: "#1e293b", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
      <div className="relative">
        <img
          src={hazard.image_url}
          alt={hazard.defect_type}
          className="w-full object-cover"
          style={{ height: 170 }}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=400"; }}
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <X className="w-4 h-4" />
        </button>
        <span className={`absolute bottom-3 left-3 px-3 py-1 rounded-full border text-xs font-semibold capitalize ${severityStyle[hazard.severity]}`}>
          {hazard.severity} Severity
        </span>
      </div>
      <div className="p-5">
        <p className="text-white font-semibold capitalize mb-1">{hazard.defect_type.replace(/_/g, " ")}</p>
        <p className="text-[#94a3b8] text-xs mb-4">
          Reported {new Date(hazard.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        <div className="space-y-2 border-t border-white/5 pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#94a3b8]">Latitude</span>
            <span className="text-white font-mono">{hazard.latitude.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#94a3b8]">Longitude</span>
            <span className="text-white font-mono">{hazard.longitude.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#94a3b8]">Status</span>
            <span className="text-emerald-400 capitalize">{hazard.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Heatmap Layer ────────────────────────────────────────────────────────────
function HeatmapLayer({ stats }: { stats: StateHeatmapStat[] }) {
  const geoData = buildFeatureCollection(stats) as GeoJSON.FeatureCollection;

  const style = useCallback((feature: any) => ({
    fillColor:   severityColor(feature.properties.high_severity_ratio),
    fillOpacity: 0.55,
    color:       "rgba(255,255,255,0.25)",
    weight:      1.5,
  }), []);

  const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
    const p = feature.properties;
    (layer as L.Path).on({
      mouseover: (e) => {
        (e.target as L.Path).setStyle({ fillOpacity: 0.8, weight: 2.5, color: "rgba(255,255,255,0.7)" });
      },
      mouseout: (e) => {
        (e.target as L.Path).setStyle({ fillOpacity: 0.55, weight: 1.5, color: "rgba(255,255,255,0.25)" });
      },
    });
    (layer as L.Layer).bindTooltip(
      `<div style="background:#1e293b;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;color:#fff;font-size:13px;line-height:1.6">
        <strong style="color:#d97706">${p.state_name}</strong><br/>
        Reports: <strong>${p.total_reports}</strong><br/>
        High: <span style="color:#ef4444">${p.high_severity_count}</span> &nbsp;
        Mid: <span style="color:#f97316">${p.medium_severity_count}</span> &nbsp;
        Low: <span style="color:#22c55e">${p.low_severity_count}</span><br/>
        High ratio: <strong style="color:#eab308">${p.high_severity_ratio}%</strong>
      </div>`,
      { sticky: true, opacity: 1, className: "leaflet-tooltip-custom" }
    );
  }, []);

  return (
    <GeoJSON
      key={`heatmap-${stats.length}`}
      data={geoData}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

// ─── Pins Layer ───────────────────────────────────────────────────────────────
function PinsLayer({ hazards, onSelect }: { hazards: Hazard[]; onSelect: (h: Hazard) => void }) {
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
            <div style={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"5px 10px", color:"#fff", fontSize:12 }}>
              <span style={{ textTransform:"capitalize" }}>{h.defect_type.replace(/_/g," ")}</span>
              {" — "}
              <span style={{ color: h.severity==="high"?"#ef4444":h.severity==="medium"?"#f97316":"#22c55e", fontWeight:600, textTransform:"capitalize" }}>
                {h.severity}
              </span>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

// ─── View Toggle ──────────────────────────────────────────────────────────────
function ViewToggle({ view, onChange }: { view: MapView; onChange: (v: MapView) => void }) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex rounded-xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      style={{ background: "#1e293b" }}>
      <button
        onClick={() => onChange("heatmap")}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all"
        style={{ background: view==="heatmap" ? "#d97706" : "transparent", color: view==="heatmap" ? "#fff" : "#94a3b8" }}
      >
        <Layers className="w-4 h-4" /> Heatmap
      </button>
      <button
        onClick={() => onChange("pins")}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all"
        style={{ background: view==="pins" ? "#d97706" : "transparent", color: view==="pins" ? "#fff" : "#94a3b8" }}
      >
        <MapPin className="w-4 h-4" /> Pins
      </button>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function HeatmapLegend() {
  const items = [
    { color: "#ef4444", label: "> 50% high severity" },
    { color: "#f97316", label: "> 20% high severity" },
    { color: "#eab308", label: "Some reports" },
    { color: "#22c55e", label: "No active reports" },
  ];
  return (
    <div className="absolute bottom-6 right-4 z-[1000] rounded-xl border border-white/10 p-4"
      style={{ background: "rgba(15,23,42,0.9)", backdropFilter: "blur(8px)", minWidth: 190 }}>
      <p className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider mb-3">High Severity Ratio</p>
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
          <span className="text-xs text-[#94a3b8]">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Loading Overlay ──────────────────────────────────────────────────────────
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10"
        style={{ background: "rgba(15,23,42,0.9)", backdropFilter: "blur(8px)" }}>
        <div className="w-4 h-4 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#94a3b8] text-sm">Loading map data…</span>
      </div>
    </div>
  );
}

// ─── Map Inner (needs MapContainer context) ───────────────────────────────────
function MapInner({
  mapView, stats, hazards, selectedHazard, onSelectHazard
}: {
  mapView: MapView;
  stats: StateHeatmapStat[];
  hazards: Hazard[];
  selectedHazard: Hazard | null;
  onSelectHazard: (h: Hazard | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    // Fit Malaysia bounds when heatmap data loads
    if (mapView === "heatmap" && stats.length > 0) {
      map.setView([4.2105, 109.5], 6, { animate: true });
    }
  }, [mapView, stats.length]);

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

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  if (!loading && error) {
    return <MapFallback error={error} onRetry={handleRetry} />;
  }

  return (
    <MapErrorBoundary key={retryKey} onReset={handleRetry}>
      <div className="relative w-full" style={{ height: "calc(1024px - 64px)" }}>
        {loading && <LoadingOverlay />}

        <MapContainer
          center={[4.2105, 109.5]}
          zoom={6}
          style={{ width: "100%", height: "100%", background: "#0b0f19" }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Dark CartoDB tile layer */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {!loading && (
            <MapInner
              mapView={mapView}
              stats={stats}
              hazards={hazards}
              selectedHazard={selectedHazard}
              onSelectHazard={setSelectedHazard}
            />
          )}
        </MapContainer>

        {/* View toggle */}
        <ViewToggle view={mapView} onChange={(v) => { setMapView(v); setSelectedHazard(null); }} />

        {/* Heatmap legend */}
        {mapView === "heatmap" && !loading && stats.length > 0 && <HeatmapLegend />}

        {/* Hazard detail card */}
        {mapView === "pins" && selectedHazard && (
          <HazardCard hazard={selectedHazard} onClose={() => setSelectedHazard(null)} />
        )}
      </div>
    </MapErrorBoundary>
  );
}
