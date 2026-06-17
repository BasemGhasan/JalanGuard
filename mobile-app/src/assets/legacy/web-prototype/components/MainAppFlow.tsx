import { useState } from "react";
import {
  Home,
  Map,
  Clock,
  User,
  Camera,
  Bell,
  Settings,
  MapPin,
  ChevronRight,
  Star,
  Shield,
  Award,
  ThumbsUp,
  Eye,
  AlertTriangle,
  TrendingUp,
  X,
  Search,
} from "lucide-react";

const MAP_IMG =
  "https://images.unsplash.com/photo-1620662892011-f5c2d523fae2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwc2F0ZWxsaXRlJTIwbWFwJTIwY2l0eSUyMGFlcmlhbCUyMG5pZ2h0fGVufDF8fHx8MTc3NDQxMzA2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const POTHOLE_IMG =
  "https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3Rob2xlJTIwcm9hZCUyMGRhbWFnZSUyMGNsb3NlfGVufDF8fHx8MTc3NDQxMzA3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const CRACK_IMG =
  "https://images.unsplash.com/photo-1764471444628-51c4189ec183?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFja2VkJTIwYXNwaGFsdCUyMHJvYWQlMjBzdXJmYWNlfGVufDF8fHx8MTc3NDQxMzA3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const HAZARD_IMG =
  "https://images.unsplash.com/photo-1684002592905-d9745d545bb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9rZW4lMjByb2FkJTIwcGF2ZW1lbnQlMjBoYXphcmR8ZW58MXx8fHwxNzc0NDEzMDcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

type Tab = "home" | "map" | "history" | "profile";

export function MainAppFlow() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  return (
    <div className="flex gap-8 items-start">
      <PhoneFrame label="Home" active={activeTab === "home"}>
        <HomeScreen onMapTap={() => setActiveTab("map")} />
        <BottomNav active="home" onTabChange={setActiveTab} />
      </PhoneFrame>

      <PhoneFrame label="Map" active={activeTab === "map"}>
        <MapScreen showSheet={showBottomSheet} onPinTap={() => setShowBottomSheet(!showBottomSheet)} />
        <BottomNav active="map" onTabChange={setActiveTab} />
      </PhoneFrame>

      <PhoneFrame label="History" active={activeTab === "history"}>
        <HistoryScreen />
        <BottomNav active="history" onTabChange={setActiveTab} />
      </PhoneFrame>

      <PhoneFrame label="Profile" active={activeTab === "profile"}>
        <ProfileScreen />
        <BottomNav active="profile" onTabChange={setActiveTab} />
      </PhoneFrame>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Phone Frame
   ═══════════════════════════════════════════ */
function PhoneFrame({
  children,
  label,
  active,
}: {
  children: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="text-[11px] tracking-widest uppercase"
        style={{ color: active ? "#d97706" : "#64748b", fontWeight: 600 }}
      >
        {label}
        {active && (
          <span
            className="inline-block w-1.5 h-1.5 rounded-full ml-2 align-middle"
            style={{ backgroundColor: "#d97706" }}
          />
        )}
      </span>
      <div
        className="flex-shrink-0 relative overflow-hidden flex flex-col"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "44px",
          backgroundColor: "#0f172a",
          boxShadow: active
            ? "0 0 0 2px #d97706, 0 25px 60px rgba(0,0,0,0.4)"
            : "0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 pt-4">
          <span className="text-[12px] text-white/60" style={{ fontWeight: 600 }}>9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5 items-end">
              {[3, 5, 7, 9].map((h, i) => (
                <div key={i} className="w-[3px] rounded-sm" style={{ height: `${h}px`, backgroundColor: "rgba(255,255,255,0.5)" }} />
              ))}
            </div>
            <div className="ml-2 w-6 h-3 rounded-sm border border-white/40 relative">
              <div className="absolute inset-0.5 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.4)", width: "70%" }} />
            </div>
          </div>
        </div>
        {/* Dynamic Island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30">
          <div className="rounded-full" style={{ width: "126px", height: "34px", backgroundColor: "#000" }} />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Bottom Navigation Bar
   ═══════════════════════════════════════════ */
function BottomNav({ active, onTabChange }: { active: Tab; onTabChange: (t: Tab) => void }) {
  const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: "home", icon: Home, label: "Home" },
    { id: "map", icon: Map, label: "Map" },
    { id: "history", icon: Clock, label: "History" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {/* FAB */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30">
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "#d97706",
            boxShadow: "0 6px 20px rgba(217,119,6,0.45)",
          }}
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>

      <div
        className="flex items-center justify-around px-4"
        style={{
          height: "82px",
          backgroundColor: "#334155",
          borderTop: "1px solid rgba(226,232,240,0.1)",
          borderRadius: "0 0 44px 44px",
          paddingBottom: "16px",
        }}
      >
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          // Leave gap in middle for FAB
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1"
              style={{ marginRight: i === 1 ? "40px" : 0, marginLeft: i === 2 ? "40px" : 0 }}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: isActive ? "#d97706" : "#e2e8f0" }}
                fill={isActive ? "#d97706" : "none"}
              />
              <span
                className="text-[10px]"
                style={{ color: isActive ? "#d97706" : "#e2e8f0", fontWeight: isActive ? 600 : 400 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Home Screen
   ═══════════════════════════════════════════ */
function HomeScreen({ onMapTap }: { onMapTap: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto pt-16 pb-24 px-6" style={{ backgroundColor: "#0f172a" }}>
      {/* Header */}
      <div className="flex items-center justify-between mt-6 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}
          >
            <span className="text-[14px] text-white" style={{ fontWeight: 700 }}>JG</span>
          </div>
          <div>
            <p className="text-[13px]" style={{ color: "#94a3b8" }}>Good morning</p>
            <p className="text-[17px]" style={{ color: "#f8fafc", fontWeight: 700 }}>Hello, User!</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ backgroundColor: "#334155" }}>
          <Bell className="w-5 h-5" style={{ color: "#e2e8f0" }} />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: "#dc2626" }} />
        </button>
      </div>

      {/* Summary Card */}
      <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#334155" }}>
        <p className="text-[13px] mb-4" style={{ color: "#94a3b8", fontWeight: 500 }}>Your Contributions</p>
        <div className="flex justify-between">
          {[
            { value: "3", label: "Hazards\nReported", icon: AlertTriangle },
            { value: "12", label: "Votes\nCast", icon: ThumbsUp },
            { value: "750", label: "Trust\nScore", icon: TrendingUp },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: "rgba(217,119,6,0.15)" }}>
                  <Icon className="w-5 h-5" style={{ color: "#d97706" }} />
                </div>
                <span className="text-[22px]" style={{ color: "#d97706", fontWeight: 700 }}>{stat.value}</span>
                <span className="text-[10px] whitespace-pre-line mt-0.5" style={{ color: "#94a3b8" }}>{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini-Map Card */}
      <button onClick={onMapTap} className="w-full rounded-2xl overflow-hidden mb-5 relative" style={{ height: "180px" }}>
        <img src={MAP_IMG} alt="Map" className="w-full h-full object-cover" style={{ filter: "brightness(0.5) saturate(0.7)" }} />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)" }} />
        {/* Pins on map */}
        {[
          { top: "30%", left: "25%" },
          { top: "45%", left: "60%" },
          { top: "35%", left: "75%" },
        ].map((pos, i) => (
          <div key={i} className="absolute" style={{ top: pos.top, left: pos.left }}>
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#d97706" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
          <div>
            <p className="text-[15px] text-left" style={{ color: "#f8fafc", fontWeight: 600 }}>Community Map</p>
            <p className="text-[11px] text-left" style={{ color: "#94a3b8" }}>5 hazards near you</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(217,119,6,0.2)" }}>
            <ChevronRight className="w-4 h-4" style={{ color: "#d97706" }} />
          </div>
        </div>
      </button>

      {/* Recent Activity */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[15px]" style={{ color: "#f8fafc", fontWeight: 600 }}>Recent Activity</p>
          <button className="text-[12px]" style={{ color: "#d97706", fontWeight: 500 }}>See All</button>
        </div>

        {[
          { title: "Pothole reported", subtitle: "Jl. Sudirman · 2h ago", color: "#d97706" },
          { title: "Vote confirmed", subtitle: "Jl. Thamrin · 5h ago", color: "#16a34a" },
          { title: "Badge earned", subtitle: "Road Hero · 1d ago", color: "#8b5cf6" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: i < 2 ? "1px solid rgba(51,65,85,0.6)" : "none" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            </div>
            <div className="flex-1">
              <p className="text-[13px]" style={{ color: "#f8fafc", fontWeight: 500 }}>{item.title}</p>
              <p className="text-[11px]" style={{ color: "#64748b" }}>{item.subtitle}</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "#475569" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Interactive Map Screen
   ═══════════════════════════════════════════ */
function MapScreen({ showSheet, onPinTap }: { showSheet: boolean; onPinTap: () => void }) {
  const [mapMode, setMapMode] = useState<"pins" | "zones">("pins");

  const pins = [
    { top: "28%", left: "22%", severity: "high" },
    { top: "42%", left: "55%", severity: "medium" },
    { top: "55%", left: "35%", severity: "high" },
    { top: "38%", left: "75%", severity: "low" },
    { top: "65%", left: "65%", severity: "medium" },
  ];

  return (
    <div className="flex-1 relative" style={{ backgroundColor: "#0f172a" }}>
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <img src={MAP_IMG} alt="Map" className="w-full h-full object-cover" style={{ filter: "brightness(0.45) saturate(0.6) hue-rotate(200deg)" }} />

        {/* Grid overlay for map feel */}
        <div className="absolute inset-0" style={{ opacity: 0.08 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`h${i}`} className="absolute w-full" style={{ top: `${i * 44}px`, height: "1px", backgroundColor: "#94a3b8" }} />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`v${i}`} className="absolute h-full" style={{ left: `${i * 34}px`, width: "1px", backgroundColor: "#94a3b8" }} />
          ))}
        </div>

        {/* Roads */}
        <div className="absolute" style={{ top: "200px", left: 0, right: 0, height: "3px", backgroundColor: "#475569", opacity: 0.6 }} />
        <div className="absolute" style={{ top: "350px", left: 0, right: 0, height: "4px", backgroundColor: "#475569", opacity: 0.5 }} />
        <div className="absolute" style={{ top: "100px", left: "130px", width: "3px", height: "600px", backgroundColor: "#475569", opacity: 0.5 }} />
        <div className="absolute" style={{ top: "50px", left: "260px", width: "3px", height: "500px", backgroundColor: "#475569", opacity: 0.4 }} />

        {/* Choropleth zones (visible in both modes but more prominent in zones mode) */}
        {(mapMode === "zones" ? [
          { top: "22%", left: "15%", w: 140, h: 120 },
          { top: "50%", left: "40%", w: 160, h: 130 },
          { top: "35%", left: "60%", w: 100, h: 100 },
        ] : []).map((zone, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: zone.top,
              left: zone.left,
              width: `${zone.w}px`,
              height: `${zone.h}px`,
              background: "radial-gradient(circle, rgba(220,38,38,0.4) 0%, rgba(220,38,38,0.15) 40%, transparent 70%)",
            }}
          />
        ))}

        {/* Pins */}
        {mapMode === "pins" &&
          pins.map((pin, i) => (
            <button key={i} onClick={onPinTap} className="absolute group" style={{ top: pin.top, left: pin.left }}>
              {/* Pulse ring */}
              <div
                className="absolute -inset-2 rounded-full animate-ping"
                style={{
                  backgroundColor: pin.severity === "high" ? "#dc2626" : "#d97706",
                  opacity: 0.15,
                  animationDuration: "2s",
                }}
              />
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center relative z-10"
                style={{
                  backgroundColor: "#d97706",
                  boxShadow: "0 2px 8px rgba(217,119,6,0.5)",
                }}
              >
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "6px solid #d97706",
                  marginTop: "-1px",
                  marginLeft: "3px",
                }}
              />
            </button>
          ))}

        {/* User location */}
        <div className="absolute" style={{ top: "48%", left: "45%" }}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-full animate-ping" style={{ backgroundColor: "#3b82f6", opacity: 0.15, animationDuration: "2s" }} />
            <div className="w-5 h-5 rounded-full border-3 border-white flex items-center justify-center" style={{ backgroundColor: "#3b82f6", borderWidth: "3px" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-16 left-0 right-0 z-10 px-6 flex flex-col items-center gap-3">
        {/* Search */}
        <div className="w-full rounded-2xl px-4 py-3 flex items-center gap-3" style={{ backgroundColor: "#334155", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
          <Search className="w-4 h-4" style={{ color: "#94a3b8" }} />
          <span className="text-[13px]" style={{ color: "#94a3b8" }}>Search hazards...</span>
        </div>

        {/* Mode toggle */}
        <div className="rounded-full p-1 flex" style={{ backgroundColor: "#334155", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
          {(["pins", "zones"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              className="px-5 py-2 rounded-full text-[12px] capitalize"
              style={{
                backgroundColor: mapMode === mode ? "#d97706" : "transparent",
                color: mapMode === mode ? "#fff" : "#94a3b8",
                fontWeight: mapMode === mode ? 600 : 400,
              }}
            >
              {mode === "pins" ? "📍 Pins" : "🔥 Red Zones"}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Sheet */}
      {showSheet && (
        <div
          className="absolute bottom-24 left-0 right-0 z-20 mx-4 rounded-2xl p-5"
          style={{ backgroundColor: "#1e293b", boxShadow: "0 -8px 32px rgba(0,0,0,0.4)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <img src={POTHOLE_IMG} alt="Hazard" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[14px]" style={{ color: "#f8fafc", fontWeight: 600 }}>Severe Pothole</p>
                <p className="text-[11px]" style={{ color: "#94a3b8" }}>Jl. Sudirman · 0.3 km</p>
              </div>
            </div>
            <button onClick={onPinTap} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#334155" }}>
              <X className="w-4 h-4" style={{ color: "#94a3b8" }} />
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-[10px]" style={{ backgroundColor: "#dc262620", color: "#f87171", fontWeight: 600 }}>High Severity</span>
            <span className="px-2.5 py-1 rounded-full text-[10px]" style={{ backgroundColor: "#d9770620", color: "#d97706", fontWeight: 600 }}>Pending</span>
          </div>
          <button className="w-full py-3 rounded-xl text-[13px]" style={{ backgroundColor: "#d97706", color: "#fff", fontWeight: 600 }}>
            View Details
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Report History Screen
   ═══════════════════════════════════════════ */
function HistoryScreen() {
  const reports = [
    {
      title: "Severe Pothole",
      location: "Jl. Sudirman, Jakarta",
      date: "Mar 24, 2026",
      severity: "High",
      severityColor: "#dc2626",
      status: "Pending",
      statusColor: "#d97706",
      img: POTHOLE_IMG,
    },
    {
      title: "Road Crack",
      location: "Jl. Thamrin, Jakarta",
      date: "Mar 22, 2026",
      severity: "Medium",
      severityColor: "#f59e0b",
      status: "Verified",
      statusColor: "#3b82f6",
      img: CRACK_IMG,
    },
    {
      title: "Broken Pavement",
      location: "Jl. Gatot Subroto",
      date: "Mar 18, 2026",
      severity: "High",
      severityColor: "#dc2626",
      status: "Fixed",
      statusColor: "#16a34a",
      img: HAZARD_IMG,
    },
    {
      title: "Surface Damage",
      location: "Jl. Rasuna Said",
      date: "Mar 12, 2026",
      severity: "Low",
      severityColor: "#22c55e",
      status: "Fixed",
      statusColor: "#16a34a",
      img: CRACK_IMG,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto pt-16 pb-24 px-6" style={{ backgroundColor: "#0f172a" }}>
      {/* Header */}
      <div className="flex items-center justify-between mt-6 mb-2">
        <h1 className="text-[24px]" style={{ color: "#f8fafc", fontWeight: 700 }}>My Reports</h1>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#334155" }}>
          <Search className="w-5 h-5" style={{ color: "#e2e8f0" }} />
        </button>
      </div>
      <p className="text-[13px] mb-5" style={{ color: "#94a3b8" }}>
        {reports.length} total reports
      </p>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {["All", "Pending", "Verified", "Fixed"].map((filter, i) => (
          <button
            key={filter}
            className="px-4 py-2 rounded-full text-[12px] whitespace-nowrap"
            style={{
              backgroundColor: i === 0 ? "#d97706" : "#334155",
              color: i === 0 ? "#fff" : "#94a3b8",
              fontWeight: i === 0 ? 600 : 400,
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Report Cards */}
      <div className="flex flex-col gap-3">
        {reports.map((report, i) => (
          <div key={i} className="rounded-2xl overflow-hidden flex" style={{ backgroundColor: "#334155" }}>
            {/* Thumbnail */}
            <div className="w-24 h-28 flex-shrink-0">
              <img src={report.img} alt={report.title} className="w-full h-full object-cover" />
            </div>
            {/* Info */}
            <div className="flex-1 p-3.5 flex flex-col justify-between">
              <div>
                <p className="text-[14px] mb-0.5" style={{ color: "#f8fafc", fontWeight: 600 }}>{report.title}</p>
                <p className="text-[11px] mb-0.5" style={{ color: "#94a3b8" }}>{report.location}</p>
                <p className="text-[10px]" style={{ color: "#64748b" }}>{report.date}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <span
                  className="px-2 py-0.5 rounded-full text-[9px]"
                  style={{ backgroundColor: `${report.severityColor}20`, color: report.severityColor, fontWeight: 600 }}
                >
                  {report.severity}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[9px]"
                  style={{
                    backgroundColor: `${report.statusColor}20`,
                    color: report.statusColor,
                    fontWeight: 600,
                  }}
                >
                  {report.status}
                </span>
              </div>
            </div>
            <div className="flex items-center pr-3">
              <ChevronRight className="w-4 h-4" style={{ color: "#475569" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   User Profile Screen
   ═══════════════════════════════════════════ */
function ProfileScreen() {
  const badges = [
    { icon: Star, label: "First Report", unlocked: true },
    { icon: Shield, label: "Road Hero", unlocked: true },
    { icon: Award, label: "Verifier", unlocked: true },
    { icon: Eye, label: "Watchman", unlocked: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto pt-16 pb-24 px-6" style={{ backgroundColor: "#0f172a" }}>
      {/* Header */}
      <div className="flex items-center justify-end mt-6 mb-6">
        <button className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#334155" }}>
          <Settings className="w-5 h-5" style={{ color: "#e2e8f0" }} />
        </button>
      </div>

      {/* Avatar & Name */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-3"
          style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)", boxShadow: "0 8px 24px rgba(217,119,6,0.3)" }}
        >
          <span className="text-[32px] text-white" style={{ fontWeight: 700 }}>JG</span>
        </div>
        <h2 className="text-[20px] mb-1" style={{ color: "#f8fafc", fontWeight: 700 }}>JalanGuard User</h2>
        <button className="text-[13px]" style={{ color: "#d97706", fontWeight: 500 }}>
          Edit Profile
        </button>
      </div>

      {/* Stats */}
      <div className="flex rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: "#334155" }}>
        {[
          { value: "24", label: "Reports" },
          { value: "58", label: "Verifies" },
          { value: "#12", label: "Rank" },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex-1 py-4 flex flex-col items-center"
            style={{ borderRight: i < 2 ? "1px solid rgba(71,85,105,0.5)" : "none" }}
          >
            <span className="text-[20px]" style={{ color: "#d97706", fontWeight: 700 }}>{stat.value}</span>
            <span className="text-[11px]" style={{ color: "#94a3b8" }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Trust Dashboard */}
      <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: "#334155" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[14px]" style={{ color: "#f8fafc", fontWeight: 600 }}>Trust Score</p>
          <p className="text-[14px]" style={{ color: "#d97706", fontWeight: 700 }}>Level 4</p>
        </div>
        <p className="text-[11px] mb-3" style={{ color: "#94a3b8" }}>Trusted Contributor</p>
        <div className="w-full h-3 rounded-full overflow-hidden mb-2" style={{ backgroundColor: "#0f172a" }}>
          <div
            className="h-full rounded-full"
            style={{ width: "75%", background: "linear-gradient(90deg, #d97706, #f59e0b)" }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-[10px]" style={{ color: "#64748b" }}>750 pts</span>
          <span className="text-[10px]" style={{ color: "#64748b" }}>1000 pts</span>
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#334155" }}>
        <p className="text-[14px] mb-4" style={{ color: "#f8fafc", fontWeight: 600 }}>Badges Earned</p>
        <div className="grid grid-cols-4 gap-3">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div key={i} className="flex flex-col items-center" style={{ opacity: badge.unlocked ? 1 : 0.35 }}>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                  style={{
                    backgroundColor: badge.unlocked ? "rgba(217,119,6,0.15)" : "rgba(71,85,105,0.3)",
                    border: badge.unlocked ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(71,85,105,0.3)",
                  }}
                >
                  <Icon
                    className="w-7 h-7"
                    style={{ color: badge.unlocked ? "#d97706" : "#475569" }}
                    fill={badge.unlocked && badge.icon === Star ? "#d97706" : "none"}
                  />
                </div>
                <span className="text-[10px] text-center" style={{ color: badge.unlocked ? "#e2e8f0" : "#475569", fontWeight: 500 }}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
