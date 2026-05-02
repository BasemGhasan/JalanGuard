import { useState } from "react";
import {
  X,
  Image,
  Zap,
  ArrowLeft,
  MapPin,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Camera,
  Share2,
  ChevronRight,
  Mail,
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
} from "lucide-react";

const POTHOLE_1 =
  "https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2FkJTIwcG90aG9sZSUyMGRhbWFnZSUyMGFzcGhhbHR8ZW58MXx8fHwxNzc0NDEzODU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const POTHOLE_2 =
  "https://images.unsplash.com/photo-1616107838939-1b29303d66c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3Rob2xlJTIwc3RyZWV0JTIwdXJiYW4lMjBkYW1hZ2V8ZW58MXx8fHwxNzc0NDEzODU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function CoreInteractionsFlow() {
  return (
    <div className="flex gap-8 items-start">
      <PhoneFrame label="Camera Viewfinder">
        <CameraViewfinder />
      </PhoneFrame>
      <PhoneFrame label="Submission Form">
        <SubmissionForm />
      </PhoneFrame>
      <PhoneFrame label="Hazard Detail">
        <HazardDetail />
      </PhoneFrame>
      <PhoneFrame label="Forgot Password">
        <ForgotPassword />
      </PhoneFrame>
      <PhoneFrame label="Settings">
        <SettingsMenu />
      </PhoneFrame>
    </div>
  );
}

/* ─── Phone Frame ─── */
function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] tracking-widest uppercase" style={{ color: "#d97706", fontWeight: 600 }}>
        {label}
      </span>
      <div
        className="flex-shrink-0 relative overflow-hidden flex flex-col"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "44px",
          backgroundColor: "#0f172a",
          boxShadow: "0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
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
   Screen 1: Camera Viewfinder
   ═══════════════════════════════════════════ */
function CameraViewfinder() {
  return (
    <div className="w-full h-full relative">
      {/* Camera feed background */}
      <img src={POTHOLE_1} alt="Camera feed" className="w-full h-full object-cover" />

      {/* Rule of thirds grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/15" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/15" />
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/15" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/15" />
      </div>

      {/* AI Bounding Box */}
      <div className="absolute flex items-center justify-center" style={{ top: "32%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <div className="relative" style={{ width: "160px", height: "130px" }}>
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3" style={{ borderColor: "#d97706", borderWidth: "3px 0 0 3px" }} />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3" style={{ borderColor: "#d97706", borderWidth: "3px 3px 0 0" }} />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3" style={{ borderColor: "#d97706", borderWidth: "0 0 3px 3px" }} />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3" style={{ borderColor: "#d97706", borderWidth: "0 3px 3px 0" }} />

          {/* Scanning line animation */}
          <div className="absolute left-1 right-1 h-0.5 animate-pulse" style={{ top: "50%", backgroundColor: "#d97706", opacity: 0.6 }} />

          {/* AI tag */}
          <div
            className="absolute -top-8 left-0 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
            style={{ backgroundColor: "#d97706" }}
          >
            <Brain className="w-3 h-3 text-white" />
            <span className="text-[10px] text-white" style={{ fontWeight: 600 }}>AI Scanning</span>
          </div>

          {/* Severity tag */}
          <div
            className="absolute -bottom-8 right-0 px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: "#dc2626" }}
          >
            <span className="text-[10px] text-white" style={{ fontWeight: 600 }}>⚠ High Severity</span>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        className="absolute top-14 left-6 w-10 h-10 rounded-full flex items-center justify-center z-20"
        style={{ backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Top right info */}
      <div
        className="absolute top-14 right-6 px-3 py-1.5 rounded-full flex items-center gap-1.5 z-20"
        style={{ backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
      >
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#16a34a" }} />
        <span className="text-[11px] text-white" style={{ fontWeight: 500 }}>LIVE</span>
      </div>

      {/* Bottom control bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center px-10"
        style={{
          height: "160px",
          background: "linear-gradient(to top, rgba(15,23,42,0.95) 60%, transparent 100%)",
          borderRadius: "0 0 44px 44px",
          paddingBottom: "36px",
        }}
      >
        {/* Gallery */}
        <button
          className="w-12 h-12 rounded-xl flex items-center justify-center absolute left-10"
          style={{ backgroundColor: "rgba(51,65,85,0.7)" }}
        >
          <Image className="w-5 h-5" style={{ color: "#e2e8f0" }} />
        </button>

        {/* Capture button */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ border: "4px solid #d97706" }}
          >
            <div
              className="w-16 h-16 rounded-full"
              style={{ backgroundColor: "#d97706", boxShadow: "0 0 20px rgba(217,119,6,0.4)" }}
            />
          </div>
        </div>

        {/* Flash */}
        <button
          className="w-12 h-12 rounded-xl flex items-center justify-center absolute right-10"
          style={{ backgroundColor: "rgba(51,65,85,0.7)" }}
        >
          <Zap className="w-5 h-5" style={{ color: "#e2e8f0" }} />
        </button>
      </div>

      {/* Detection info bar */}
      <div
        className="absolute left-6 right-6 z-20 rounded-2xl px-4 py-3 flex items-center justify-between"
        style={{ bottom: "175px", backgroundColor: "rgba(15,23,42,0.8)", backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: "#d97706" }} />
          <span className="text-[11px]" style={{ color: "#94a3b8" }}>-6.2088, 106.8456</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: "#d97706" }} />
          <span className="text-[11px]" style={{ color: "#d97706", fontWeight: 600 }}>Pothole Detected</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Screen 2: Submission Form
   ═══════════════════════════════════════════ */
function SubmissionForm() {
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: "#0f172a" }}>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 pt-16 pb-4 mt-4">
        <button className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#334155" }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#e2e8f0" }} />
        </button>
        <h1 className="text-[18px]" style={{ color: "#f8fafc", fontWeight: 700 }}>Submit Report</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Image Preview */}
        <div className="rounded-2xl overflow-hidden mb-5 relative" style={{ height: "220px" }}>
          <img src={POTHOLE_1} alt="Captured" className="w-full h-full object-cover" />
          {/* Bounding box overlay on preview */}
          <div className="absolute" style={{ top: "25%", left: "30%", width: "40%", height: "45%" }}>
            <div className="w-full h-full relative">
              <div className="absolute top-0 left-0 w-5 h-5" style={{ borderTop: "2px solid #d97706", borderLeft: "2px solid #d97706" }} />
              <div className="absolute top-0 right-0 w-5 h-5" style={{ borderTop: "2px solid #d97706", borderRight: "2px solid #d97706" }} />
              <div className="absolute bottom-0 left-0 w-5 h-5" style={{ borderBottom: "2px solid #d97706", borderLeft: "2px solid #d97706" }} />
              <div className="absolute bottom-0 right-0 w-5 h-5" style={{ borderBottom: "2px solid #d97706", borderRight: "2px solid #d97706" }} />
            </div>
          </div>
          {/* AI badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg flex items-center gap-1" style={{ backgroundColor: "rgba(15,23,42,0.8)" }}>
            <Brain className="w-3 h-3" style={{ color: "#d97706" }} />
            <span className="text-[10px]" style={{ color: "#d97706", fontWeight: 600 }}>AI Analyzed</span>
          </div>
        </div>

        {/* Auto-filled GPS Card */}
        <div className="rounded-2xl p-4 mb-3 flex items-center gap-4" style={{ backgroundColor: "#334155" }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(217,119,6,0.15)" }}>
            <MapPin className="w-5 h-5" style={{ color: "#d97706" }} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] mb-0.5" style={{ color: "#94a3b8" }}>GPS Coordinates</p>
            <p className="text-[14px]" style={{ color: "#f8fafc", fontWeight: 600 }}>-6.2088° S, 106.8456° E</p>
            <p className="text-[11px]" style={{ color: "#64748b" }}>Jl. Sudirman, Jakarta Pusat</p>
          </div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(22,163,74,0.2)" }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#16a34a" }} />
          </div>
        </div>

        {/* Auto-filled Severity Card */}
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-4" style={{ backgroundColor: "#334155" }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(217,119,6,0.15)" }}>
            <Brain className="w-5 h-5" style={{ color: "#d97706" }} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] mb-0.5" style={{ color: "#94a3b8" }}>AI Severity Assessment</p>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[12px]" style={{ backgroundColor: "rgba(217,119,6,0.2)", color: "#d97706", fontWeight: 700 }}>
                High Severity
              </span>
              <span className="text-[11px]" style={{ color: "#64748b" }}>92% confidence</span>
            </div>
          </div>
        </div>

        {/* Category selection */}
        <p className="text-[13px] mb-2.5" style={{ color: "#94a3b8", fontWeight: 500 }}>Hazard Type</p>
        <div className="flex gap-2 mb-5 flex-wrap">
          {["Pothole", "Crack", "Sinkhole", "Debris"].map((type, i) => (
            <button
              key={type}
              className="px-4 py-2.5 rounded-xl text-[12px]"
              style={{
                backgroundColor: i === 0 ? "#d97706" : "#334155",
                color: i === 0 ? "#fff" : "#94a3b8",
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Description input */}
        <p className="text-[13px] mb-2.5" style={{ color: "#94a3b8", fontWeight: 500 }}>Description</p>
        <textarea
          placeholder="Add an optional description..."
          className="w-full rounded-2xl px-4 py-4 text-[14px] resize-none outline-none"
          rows={3}
          style={{ backgroundColor: "#334155", color: "#f8fafc", border: "none" }}
        />
      </div>

      {/* Submit button - fixed bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4" style={{ background: "linear-gradient(to top, #0f172a 80%, transparent)" }}>
        <button
          className="w-full py-4 rounded-2xl text-[16px] flex items-center justify-center gap-2"
          style={{ backgroundColor: "#d97706", color: "#fff", fontWeight: 700, boxShadow: "0 8px 24px rgba(217,119,6,0.3)" }}
        >
          Submit Report
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Screen 3: Hazard Detail & Voting
   ═══════════════════════════════════════════ */
function HazardDetail() {
  const [vote, setVote] = useState<"fixed" | "broken" | null>(null);

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: "#0f172a" }}>
      {/* Hero Image */}
      <div className="relative" style={{ height: "300px" }}>
        <img src={POTHOLE_2} alt="Hazard" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0f172a 5%, transparent 50%)" }} />
        {/* Back + Share */}
        <button className="absolute top-14 left-6 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button className="absolute top-14 right-6 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}>
          <Share2 className="w-5 h-5 text-white" />
        </button>
        {/* Severity badge */}
        <div className="absolute bottom-4 left-6 px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(217,119,6,0.2)", border: "1px solid rgba(217,119,6,0.4)" }}>
          <span className="text-[12px]" style={{ color: "#d97706", fontWeight: 600 }}>⚠ High Severity</span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <h2 className="text-[22px] mt-4 mb-1" style={{ color: "#f8fafc", fontWeight: 700 }}>Severe Pothole</h2>

        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
            <span className="text-[12px]" style={{ color: "#94a3b8" }}>Jl. Sudirman, Jakarta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px]" style={{ color: "#64748b" }}>Mar 24, 2026</span>
          </div>
        </div>

        {/* Reporter info */}
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ backgroundColor: "#334155" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}>
            <span className="text-[12px] text-white" style={{ fontWeight: 700 }}>AR</span>
          </div>
          <div className="flex-1">
            <p className="text-[13px]" style={{ color: "#f8fafc", fontWeight: 600 }}>Ahmad R.</p>
            <p className="text-[11px]" style={{ color: "#94a3b8" }}>Trusted Contributor · 42 reports</p>
          </div>
          <div className="px-2 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: "rgba(217,119,6,0.15)" }}>
            <Shield className="w-3 h-3" style={{ color: "#d97706" }} />
            <span className="text-[9px]" style={{ color: "#d97706", fontWeight: 600 }}>Lvl 4</span>
          </div>
        </div>

        {/* Voting Section */}
        <div className="mb-5">
          <p className="text-[15px] mb-1" style={{ color: "#f8fafc", fontWeight: 600 }}>Community Verification</p>
          <p className="text-[12px] mb-4" style={{ color: "#94a3b8" }}>Has this hazard been resolved?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setVote("fixed")}
              className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 text-[13px] transition-all"
              style={{
                backgroundColor: vote === "fixed" ? "#d97706" : "#334155",
                color: vote === "fixed" ? "#fff" : "#e2e8f0",
                fontWeight: 600,
                border: vote === "fixed" ? "2px solid #d97706" : "2px solid transparent",
              }}
            >
              <ThumbsUp className="w-5 h-5" />
              Yes, it's fixed
            </button>
            <button
              onClick={() => setVote("broken")}
              className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 text-[13px] transition-all"
              style={{
                backgroundColor: vote === "broken" ? "#d97706" : "#334155",
                color: vote === "broken" ? "#fff" : "#e2e8f0",
                fontWeight: 600,
                border: vote === "broken" ? "2px solid #d97706" : "2px solid transparent",
              }}
            >
              <ThumbsDown className="w-5 h-5" />
              Still broken
            </button>
          </div>

          {/* Vote stats */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="text-[11px]" style={{ color: "#64748b" }}>24 votes</span>
            <span className="text-[11px]" style={{ color: "#64748b" }}>·</span>
            <span className="text-[11px]" style={{ color: "#dc2626" }}>79% say still broken</span>
          </div>
        </div>

        {/* Add updated photo */}
        <button
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[14px]"
          style={{ backgroundColor: "#334155", color: "#e2e8f0", fontWeight: 500 }}
        >
          <Camera className="w-5 h-5" style={{ color: "#d97706" }} />
          Add Updated Photo
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Screen 4: Forgot Password
   ═══════════════════════════════════════════ */
function ForgotPassword() {
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: "#0f172a" }}>
      {/* Header */}
      <div className="flex items-center px-6 pt-16 mt-4">
        <button className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#334155" }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#e2e8f0" }} />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-12">
        {/* Lock icon */}
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(217,119,6,0.2), rgba(217,119,6,0.05))", border: "1px solid rgba(217,119,6,0.2)" }}
          >
            <Mail className="w-10 h-10" style={{ color: "#d97706" }} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[26px] text-center mb-2" style={{ color: "#f8fafc", fontWeight: 700 }}>Reset Password</h1>
        <p className="text-[14px] text-center mb-10 px-4" style={{ color: "#94a3b8" }}>
          Enter your email to receive a password reset link
        </p>

        {/* Email Field */}
        <div
          className="flex items-center gap-3 px-4 rounded-2xl mb-8"
          style={{ backgroundColor: "#334155", height: "56px" }}
        >
          <Mail className="w-5 h-5" style={{ color: "#94a3b8" }} />
          <input
            type="email"
            placeholder="Email Address"
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ color: "#f8fafc" }}
          />
        </div>

        {/* CTA */}
        <button
          className="w-full py-4 rounded-2xl text-[16px] flex items-center justify-center gap-2"
          style={{ backgroundColor: "#d97706", color: "#fff", fontWeight: 700, boxShadow: "0 8px 24px rgba(217,119,6,0.3)" }}
        >
          Send Reset Link
        </button>

        {/* Footer link */}
        <div className="flex justify-center mt-6">
          <button className="text-[14px]" style={{ color: "#94a3b8" }}>
            Back to{" "}
            <span style={{ color: "#d97706", fontWeight: 600 }}>Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Screen 5: Settings Menu
   ═══════════════════════════════════════════ */
function SettingsMenu() {
  const settingsItems = [
    { icon: User, label: "Account", subtitle: "Manage your profile" },
    { icon: Bell, label: "Notifications", subtitle: "Alerts & push settings" },
    { icon: Shield, label: "Privacy", subtitle: "Data & permissions" },
    { icon: HelpCircle, label: "Help & Support", subtitle: "FAQs & contact" },
  ];

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: "#0f172a" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-16 pb-4 mt-4">
        <button className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#334155" }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#e2e8f0" }} />
        </button>
        <h1 className="text-[18px]" style={{ color: "#f8fafc", fontWeight: 700 }}>Settings</h1>
        <div className="w-10" />
      </div>

      {/* Profile card */}
      <div className="mx-6 mb-6 rounded-2xl p-4 flex items-center gap-4" style={{ backgroundColor: "#334155" }}>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}
        >
          <span className="text-[18px] text-white" style={{ fontWeight: 700 }}>JG</span>
        </div>
        <div className="flex-1">
          <p className="text-[16px]" style={{ color: "#f8fafc", fontWeight: 600 }}>JalanGuard User</p>
          <p className="text-[12px]" style={{ color: "#94a3b8" }}>user@jalanguard.com</p>
        </div>
        <ChevronRight className="w-5 h-5" style={{ color: "#475569" }} />
      </div>

      {/* Settings list */}
      <div className="mx-6 rounded-2xl overflow-hidden" style={{ backgroundColor: "#334155" }}>
        {settingsItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i}>
              <button
                className="w-full flex items-center gap-4 px-4 text-left"
                style={{ height: "64px" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(217,119,6,0.1)" }}>
                  <Icon className="w-5 h-5" style={{ color: "#d97706" }} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px]" style={{ color: "#f8fafc", fontWeight: 500 }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: "#64748b" }}>{item.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: "#475569" }} />
              </button>
              {i < settingsItems.length - 1 && (
                <div className="mx-4 h-px" style={{ backgroundColor: "rgba(226,232,240,0.08)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* App info */}
      <div className="mx-6 mt-6 rounded-2xl p-4" style={{ backgroundColor: "#334155" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px]" style={{ color: "#94a3b8" }}>App Version</span>
          <span className="text-[13px]" style={{ color: "#f8fafc", fontWeight: 500 }}>2.1.0</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px]" style={{ color: "#94a3b8" }}>Dark Mode</span>
          <div className="w-11 h-6 rounded-full relative" style={{ backgroundColor: "#d97706" }}>
            <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5" />
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="mx-6 mt-4">
        <button
          className="w-full py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2"
          style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#f87171", fontWeight: 600, border: "1px solid rgba(220,38,38,0.2)" }}
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      {/* Footer */}
      <div className="mt-auto pb-10 flex justify-center">
        <p className="text-[11px]" style={{ color: "#475569" }}>© 2026 JalanGuard. All rights reserved.</p>
      </div>
    </div>
  );
}
