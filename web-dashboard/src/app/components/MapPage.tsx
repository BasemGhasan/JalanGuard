import { MapPin, Layers, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const pins = [
  { top: "22%", left: "18%" },
  { top: "35%", left: "42%" },
  { top: "48%", left: "28%" },
  { top: "30%", left: "65%" },
  { top: "55%", left: "70%" },
  { top: "62%", left: "50%" },
  { top: "70%", left: "82%" },
  { top: "40%", left: "80%" },
  { top: "75%", left: "22%" },
  { top: "20%", left: "55%" },
];

export function MapPage() {
  return (
    <div className="relative w-full" style={{ height: "calc(1024px - 64px)" }}>
      {/* Dark map placeholder */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, #1e293b 0%, #0f172a 40%, #0b0f19 100%)",
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px),
            radial-gradient(circle at 25% 35%, rgba(30,41,59,0.8) 0%, transparent 35%),
            radial-gradient(circle at 70% 60%, rgba(30,41,59,0.6) 0%, transparent 30%)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      >
        {/* Faux roads */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path d="M0,400 Q400,300 800,450 T1440,400" stroke="#334155" strokeWidth="3" fill="none" />
          <path d="M200,0 Q300,400 250,800 T300,1024" stroke="#334155" strokeWidth="2" fill="none" />
          <path d="M0,650 L1440,600" stroke="#334155" strokeWidth="2" fill="none" />
          <path d="M900,0 L850,1024" stroke="#334155" strokeWidth="2" fill="none" />
          <path d="M0,200 Q500,250 1000,180 T1440,220" stroke="#1e293b" strokeWidth="6" fill="none" />
        </svg>

        {/* Pins */}
        {pins.map((p, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ top: p.top, left: p.left }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#d97706] opacity-40 animate-pulse" style={{ width: "32px", height: "32px", filter: "blur(8px)" }} />
              <MapPin className="relative w-8 h-8 text-[#d97706]" fill="#d97706" strokeWidth={1.5} />
            </div>
          </div>
        ))}
      </div>

      {/* Floating segmented control */}
      <div className="absolute top-6 right-6 bg-[#1e293b] rounded-2xl p-1 flex shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/5">
        <button className="px-5 py-2 rounded-xl bg-[#d97706] text-white flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Pins
        </button>
        <button className="px-5 py-2 rounded-xl text-[#94a3b8] hover:text-white flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Heatmap
        </button>
      </div>

      {/* Issue Details Modal */}
      <div className="absolute bottom-12 left-12 w-[360px] bg-[#1e293b] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/5">
        <div className="relative">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1566207474742-de921626ad0c?w=720"
            alt="Pothole"
            className="w-full h-[180px] object-cover"
          />
          <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white" style={{ fontWeight: 600 }}>Issue #JG-2841</span>
            <span className="px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-900" style={{ fontSize: "12px", fontWeight: 600 }}>
              High Severity
            </span>
          </div>
          <p className="text-[#94a3b8] mb-4" style={{ fontSize: "14px" }}>
            Large pothole reported on Jalan Sultan Ismail. Verified by 12 commuters.
          </p>
          <div className="space-y-2 pt-3 border-t border-white/5">
            <div className="flex justify-between">
              <span className="text-[#94a3b8]" style={{ fontSize: "13px" }}>Trust Points</span>
              <span className="text-[#d97706]" style={{ fontWeight: 600 }}>450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]" style={{ fontSize: "13px" }}>Latitude</span>
              <span className="text-white" style={{ fontSize: "13px" }}>3.1412</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]" style={{ fontSize: "13px" }}>Longitude</span>
              <span className="text-white" style={{ fontSize: "13px" }}>101.6865</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
