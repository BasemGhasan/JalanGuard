import {
  ArrowLeft,
  Trophy,
  Star,
  CheckCircle,
  Camera,
  AlertTriangle,
  Clock,
  MapPin,
  Bell,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

const POTHOLE_THUMB =
  "https://images.unsplash.com/photo-1683162113343-d65c480229ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3Rob2xlJTIwcm9hZCUyMHN1cmZhY2UlMjBkYW1hZ2UlMjBjbG9zZXVwfGVufDF8fHx8MTc3NDQxNTIyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const POTHOLE_1 =
  "https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2FkJTIwcG90aG9sZSUyMGRhbWFnZSUyMGFzcGhhbHR8ZW58MXx8fHwxNzc0NDEzODU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function NotificationsScreen() {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] tracking-widest uppercase" style={{ color: "#d97706", fontWeight: 600 }}>
        Notifications & Approvals
      </span>
      <div
        className="flex-shrink-0 relative overflow-hidden flex flex-col"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "44px",
          backgroundColor: "#0f172a",
          boxShadow: "0 0 0 2px #d97706, 0 25px 60px rgba(0,0,0,0.4)",
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

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-16 pb-3 mt-4">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#334155" }}>
            <ArrowLeft className="w-5 h-5" style={{ color: "#e2e8f0" }} />
          </button>
          <h1 className="text-[18px]" style={{ color: "#f8fafc", fontWeight: 700 }}>Notifications</h1>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ backgroundColor: "#334155" }}>
            <Bell className="w-5 h-5" style={{ color: "#e2e8f0" }} />
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "#d97706" }}>
              <span className="text-[9px] text-white" style={{ fontWeight: 700 }}>4</span>
            </div>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 px-6 mb-4">
          {["All", "Actions", "Updates", "Rewards"].map((f, i) => (
            <button
              key={f}
              className="px-3.5 py-2 rounded-full text-[11px]"
              style={{
                backgroundColor: i === 0 ? "#d97706" : "#334155",
                color: i === 0 ? "#fff" : "#94a3b8",
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Section label */}
        <div className="px-6 mb-2">
          <p className="text-[11px] tracking-wider uppercase" style={{ color: "#64748b", fontWeight: 600 }}>Today</p>
        </div>

        {/* Scrollable Notification List */}
        <div className="flex-1 overflow-y-auto px-6 pb-10">
          {/* ── Notification 1: Gamification Alert ── */}
          <div className="flex items-start gap-3 py-4" style={{ borderBottom: "1px solid rgba(226,232,240,0.06)" }}>
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: "rgba(217,119,6,0.15)" }}
            >
              <Trophy className="w-5 h-5" style={{ color: "#d97706" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-[1.5]" style={{ color: "#f8fafc", fontWeight: 500 }}>
                You earned <span style={{ color: "#d97706", fontWeight: 700 }}>50 Trust Points!</span> Thanks for being an active guardian.
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Star className="w-3 h-3" style={{ color: "#d97706" }} fill="#d97706" />
                <span className="text-[10px]" style={{ color: "#64748b" }}>Total: 800 pts</span>
              </div>
            </div>
            <span className="text-[10px] flex-shrink-0 mt-1" style={{ color: "#64748b" }}>2m ago</span>
          </div>

          {/* ── Notification 2: Status Update ── */}
          <div className="flex items-start gap-3 py-4" style={{ borderBottom: "1px solid rgba(226,232,240,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden">
              <img src={POTHOLE_THUMB} alt="Pothole" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-[1.5]" style={{ color: "#f8fafc", fontWeight: 500 }}>
                A pothole you reported near <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Jalan Gasing</span> has been marked as fixed by the community.
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <CheckCircle className="w-3 h-3" style={{ color: "#16a34a" }} />
                <span className="text-[10px]" style={{ color: "#16a34a", fontWeight: 500 }}>Resolved</span>
              </div>
            </div>
            <span className="text-[10px] flex-shrink-0 mt-1" style={{ color: "#64748b" }}>15m ago</span>
          </div>

          {/* ── Notification 3: Progressive Photo Request (Actionable) ── */}
          <div className="rounded-2xl p-4 mt-3 mb-3" style={{ backgroundColor: "#334155" }}>
            {/* New badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" style={{ color: "#d97706" }} />
                <span className="text-[11px]" style={{ color: "#d97706", fontWeight: 600 }}>Photo Update Request</span>
              </div>
              <span className="text-[10px]" style={{ color: "#64748b" }}>1h ago</span>
            </div>

            <div className="flex gap-3 mb-3">
              {/* User avatar */}
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
              >
                <span className="text-[12px] text-white" style={{ fontWeight: 700 }}>NK</span>
              </div>
              {/* Pothole thumb */}
              <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden -ml-5 border-2" style={{ borderColor: "#334155" }}>
                <img src={POTHOLE_1} alt="Report" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-[1.5]" style={{ color: "#f8fafc", fontWeight: 500 }}>
                  A nearby guardian requested to add an updated photo to your report at <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Jalan Ampang</span>.
                </p>
              </div>
            </div>

            {/* Location chip */}
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="w-3 h-3" style={{ color: "#94a3b8" }} />
              <span className="text-[10px]" style={{ color: "#94a3b8" }}>Jalan Ampang, Kuala Lumpur · 0.5 km away</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <button
                className="flex-1 py-3 rounded-xl text-[13px] flex items-center justify-center gap-1.5"
                style={{ backgroundColor: "#d97706", color: "#fff", fontWeight: 600, boxShadow: "0 4px 12px rgba(217,119,6,0.25)" }}
              >
                <ThumbsUp className="w-4 h-4" />
                Approve
              </button>
              <button
                className="flex-1 py-3 rounded-xl text-[13px] flex items-center justify-center gap-1.5"
                style={{ backgroundColor: "transparent", color: "#e2e8f0", fontWeight: 500, border: "1.5px solid #e2e8f0" }}
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>

          {/* Section label - Earlier */}
          <div className="mb-2 mt-2">
            <p className="text-[11px] tracking-wider uppercase" style={{ color: "#64748b", fontWeight: 600 }}>Earlier this week</p>
          </div>

          {/* ── Notification 4: 30-Day Check-in (Actionable) ── */}
          <div className="rounded-2xl p-4 mt-1 mb-3" style={{ backgroundColor: "#334155" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: "#f59e0b" }} />
                <span className="text-[11px]" style={{ color: "#f59e0b", fontWeight: 600 }}>30-Day Check-in</span>
              </div>
              <span className="text-[10px]" style={{ color: "#64748b" }}>2d ago</span>
            </div>

            <div className="flex gap-3 mb-3">
              {/* Pothole thumb */}
              <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
                <img src={POTHOLE_THUMB} alt="Original report" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-[1.5]" style={{ color: "#f8fafc", fontWeight: 500 }}>
                  JalanGuard hasn't received an update on a reported pothole at <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Jalan Tuanku Abdul Rahman</span>. Is it still dangerous?
                </p>
              </div>
            </div>

            {/* Context */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" style={{ color: "#94a3b8" }} />
                <span className="text-[10px]" style={{ color: "#94a3b8" }}>1.2 km away</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" style={{ color: "#dc2626" }} />
                <span className="text-[10px]" style={{ color: "#dc2626", fontWeight: 500 }}>High Severity</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <button
                className="flex-1 py-3 rounded-xl text-[13px] flex items-center justify-center gap-1.5"
                style={{ backgroundColor: "#d97706", color: "#fff", fontWeight: 600, boxShadow: "0 4px 12px rgba(217,119,6,0.25)" }}
              >
                <AlertTriangle className="w-4 h-4" />
                Yes, still broken
              </button>
              <button
                className="flex-1 py-3 rounded-xl text-[13px] flex items-center justify-center gap-1.5"
                style={{ backgroundColor: "#1e293b", color: "#e2e8f0", fontWeight: 500 }}
              >
                <CheckCircle className="w-4 h-4" />
                No, it's fixed
              </button>
            </div>
          </div>

          {/* ── Notification 5: Another gamification ── */}
          <div className="flex items-start gap-3 py-4" style={{ borderBottom: "1px solid rgba(226,232,240,0.06)" }}>
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: "rgba(139,92,246,0.15)" }}
            >
              <Star className="w-5 h-5" style={{ color: "#8b5cf6" }} fill="#8b5cf6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-[1.5]" style={{ color: "#f8fafc", fontWeight: 500 }}>
                You unlocked the <span style={{ color: "#8b5cf6", fontWeight: 700 }}>Road Hero</span> badge! Keep it up.
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px]" style={{ color: "#64748b" }}>Badge · Achievement</span>
              </div>
            </div>
            <span className="text-[10px] flex-shrink-0 mt-1" style={{ color: "#64748b" }}>3d ago</span>
          </div>

          {/* ── Notification 6: Another status update ── */}
          <div className="flex items-start gap-3 py-4">
            <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden">
              <img src={POTHOLE_1} alt="Report" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-[1.5]" style={{ color: "#f8fafc", fontWeight: 500 }}>
                Your report at <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Jalan Bukit Bintang</span> received <span style={{ color: "#d97706", fontWeight: 600 }}>12 community votes</span>.
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <ThumbsUp className="w-3 h-3" style={{ color: "#d97706" }} />
                <span className="text-[10px]" style={{ color: "#64748b" }}>Community Activity</span>
              </div>
            </div>
            <span className="text-[10px] flex-shrink-0 mt-1" style={{ color: "#64748b" }}>5d ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
