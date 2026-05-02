import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Image as ImageIcon, Zap, ArrowLeft, MapPin, Brain, ThumbsUp, ThumbsDown,
  Camera, Share2, ChevronRight, Mail, User, Bell, Shield, HelpCircle, LogOut,
  Home, Map, Clock, Settings, Award, Star, Eye, EyeOff, Lock, AlertTriangle,
  TrendingUp, Search, Trophy, CheckCircle,
} from "lucide-react";

/* ─── Assets ─── */
const POTHOLE_1 = "https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2FkJTIwcG90aG9sZSUyMGRhbWFnZSUyMGFzcGhhbHR8ZW58MXx8fHwxNzc0NDEzODU4fDA&ixlib=rb-4.1.0&q=80&w=1080";
const POTHOLE_2 = "https://images.unsplash.com/photo-1616107838939-1b29303d66c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3Rob2xlJTIwc3RyZWV0JTIwdXJiYW4lMjBkYW1hZ2V8ZW58MXx8fHwxNzc0NDEzODU5fDA&ixlib=rb-4.1.0&q=80&w=1080";
const POTHOLE_THUMB = "https://images.unsplash.com/photo-1683162113343-d65c480229ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3Rob2xlJTIwcm9hZCUyMHN1cmZhY2UlMjBkYW1hZ2UlMjBjbG9zZXVwfGVufDF8fHx8MTc3NDQxNTIyMXww&ixlib=rb-4.1.0&q=80&w=1080";
const MAP_IMG = "https://images.unsplash.com/photo-1620662892011-f5c2d523fae2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwc2F0ZWxsaXRlJTIwbWFwJTIwY2l0eSUyMGFlcmlhbCUyMG5pZ2h0fGVufDF8fHx8MTc3NDQxMzA2OXww&ixlib=rb-4.1.0&q=80&w=1080";
const CRACK_IMG = "https://images.unsplash.com/photo-1764471444628-51c4189ec183?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFja2VkJTIwYXNwaGFsdCUyMHJvYWQlMjBzdXJmYWNlfGVufDF8fHx8MTc3NDQxMzA3MHww&ixlib=rb-4.1.0&q=80&w=1080";
const HAZARD_IMG = "https://images.unsplash.com/photo-1684002592905-d9745d545bb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9rZW4lMjByb2FkJTIwcGF2ZW1lbnQlMjBoYXphcmR8ZW58MXx8fHwxNzc0NDEzMDcxfDA&ixlib=rb-4.1.0&q=80&w=1080";

/* ─── Screen types ─── */
type ScreenId =
  | "onboard1" | "onboard2" | "onboard3" | "onboard4"
  | "splash" | "signup" | "login" | "forgotPassword"
  | "home" | "map" | "history" | "profile"
  | "camera" | "submission" | "hazardDetail"
  | "notifications" | "settings";

type Transition = "push-left" | "push-right" | "dissolve" | "slide-up" | "slide-down" | "instant" | "none";

/* ─── Main Prototype Component ─── */
export function InteractivePrototype() {
  const [screen, setScreen] = useState<ScreenId>("onboard1");
  const [prevScreen, setPrevScreen] = useState<ScreenId | null>(null);
  const [transition, setTransition] = useState<Transition>("none");
  const [animating, setAnimating] = useState(false);
  const historyStack = useRef<ScreenId[]>([]);

  const navigate = useCallback((to: ScreenId, trans: Transition) => {
    if (animating) return;
    historyStack.current.push(screen);
    setPrevScreen(screen);
    setScreen(to);
    if (trans === "instant") {
      setTransition("none");
      return;
    }
    setTransition(trans);
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      setTransition("none");
      setPrevScreen(null);
    }, 350);
  }, [screen, animating]);

  const goBack = useCallback((trans: Transition = "push-right") => {
    const prev = historyStack.current.pop();
    if (!prev) return;
    setPrevScreen(screen);
    setScreen(prev);
    if (trans === "instant") { setTransition("none"); return; }
    setTransition(trans);
    setAnimating(true);
    setTimeout(() => { setAnimating(false); setTransition("none"); setPrevScreen(null); }, 350);
  }, [screen, animating]);

  // Splash auto-transition
  useEffect(() => {
    if (screen === "splash") {
      const t = setTimeout(() => navigate("signup", "dissolve"), 2000);
      return () => clearTimeout(t);
    }
  }, [screen]);

  // Map screen name for display
  const screenLabels: Record<ScreenId, string> = {
    onboard1: "Onboarding 1/4", onboard2: "Onboarding 2/4", onboard3: "Onboarding 3/4", onboard4: "Onboarding 4/4",
    splash: "Splash", signup: "Sign Up", login: "Login", forgotPassword: "Forgot Password",
    home: "Home", map: "Map", history: "History", profile: "Profile",
    camera: "Camera", submission: "Submit Report", hazardDetail: "Hazard Detail",
    notifications: "Notifications", settings: "Settings",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Screen label */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] tracking-widest uppercase" style={{ color: "#d97706", fontWeight: 600 }}>
          {screenLabels[screen]}
        </span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: "#334155", color: "#94a3b8" }}>
          Interactive
        </span>
      </div>

      {/* Phone Frame */}
      <div
        className="relative overflow-hidden"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "44px",
          backgroundColor: "#0f172a",
          boxShadow: "0 0 0 2px #d97706, 0 25px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Status Bar - z-40 so it's always on top */}
        <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-8 pt-4">
          <span className="text-[12px] text-white/60" style={{ fontWeight: 600 }}>9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5 items-end">
              {[3,5,7,9].map((h,i) => <div key={i} className="w-[3px] rounded-sm" style={{ height:`${h}px`, backgroundColor:"rgba(255,255,255,0.5)" }} />)}
            </div>
            <div className="ml-2 w-6 h-3 rounded-sm border border-white/40 relative">
              <div className="absolute inset-0.5 rounded-sm" style={{ backgroundColor:"rgba(255,255,255,0.4)", width:"70%" }} />
            </div>
          </div>
        </div>
        {/* Dynamic Island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40">
          <div className="rounded-full" style={{ width:"126px", height:"34px", backgroundColor:"#000" }} />
        </div>

        {/* Screen Content with transition */}
        <div className="w-full h-full relative overflow-hidden">
          {/* Current screen */}
          <div
            className="absolute inset-0"
            style={getTransitionStyle(transition, "enter", animating)}
          >
            <ScreenRenderer
              id={screen}
              navigate={navigate}
              goBack={goBack}
            />
          </div>
          {/* Previous screen (for transition) */}
          {prevScreen && animating && (
            <div
              className="absolute inset-0"
              style={getTransitionStyle(transition, "exit", animating)}
            >
              <ScreenRenderer
                id={prevScreen}
                navigate={() => {}}
                goBack={() => {}}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation (for testing) */}
      <div className="flex flex-wrap justify-center gap-1.5 max-w-[390px]">
        {(["onboard1","splash","signup","login","home","map","history","profile","camera","notifications","settings"] as ScreenId[]).map(s => (
          <button
            key={s}
            onClick={() => navigate(s, "dissolve")}
            className="px-2 py-1 rounded-lg text-[9px]"
            style={{
              backgroundColor: screen === s ? "#d97706" : "#1e293b",
              color: screen === s ? "#fff" : "#64748b",
              fontWeight: screen === s ? 600 : 400,
            }}
          >
            {screenLabels[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Transition Helpers ─── */
function getTransitionStyle(transition: Transition, phase: "enter" | "exit", animating: boolean): React.CSSProperties {
  const dur = "350ms";
  const ease = "cubic-bezier(0.4, 0, 0.2, 1)";
  if (transition === "none" || transition === "instant") {
    return phase === "enter" ? { zIndex: 2 } : { zIndex: 1, opacity: 0 };
  }
  if (transition === "push-left") {
    if (phase === "enter") return { zIndex: 2, animation: `${animating ? "slideInRight" : "none"} ${dur} ${ease} forwards` };
    return { zIndex: 1, animation: `${animating ? "slideOutLeft" : "none"} ${dur} ${ease} forwards` };
  }
  if (transition === "push-right") {
    if (phase === "enter") return { zIndex: 2, animation: `${animating ? "slideInLeft" : "none"} ${dur} ${ease} forwards` };
    return { zIndex: 1, animation: `${animating ? "slideOutRight" : "none"} ${dur} ${ease} forwards` };
  }
  if (transition === "dissolve") {
    if (phase === "enter") return { zIndex: 2, animation: `${animating ? "fadeIn" : "none"} ${dur} ${ease} forwards` };
    return { zIndex: 1, animation: `${animating ? "fadeOut" : "none"} ${dur} ${ease} forwards` };
  }
  if (transition === "slide-up") {
    if (phase === "enter") return { zIndex: 2, animation: `${animating ? "slideInUp" : "none"} ${dur} ${ease} forwards` };
    return { zIndex: 1 };
  }
  if (transition === "slide-down") {
    if (phase === "enter") return { zIndex: 2, animation: `${animating ? "slideInDown" : "none"} ${dur} ${ease} forwards` };
    return { zIndex: 1 };
  }
  return {};
}

/* ─── Screen Renderer ─── */
function ScreenRenderer({ id, navigate, goBack }: { id: ScreenId; navigate: (to: ScreenId, t: Transition) => void; goBack: (t?: Transition) => void }) {
  switch (id) {
    case "onboard1": return <OnboardingScreen step={1} navigate={navigate} />;
    case "onboard2": return <OnboardingScreen step={2} navigate={navigate} />;
    case "onboard3": return <OnboardingScreen step={3} navigate={navigate} />;
    case "onboard4": return <OnboardingScreen step={4} navigate={navigate} />;
    case "splash": return <SplashScreen />;
    case "signup": return <SignUpScreen navigate={navigate} />;
    case "login": return <LoginScreen navigate={navigate} />;
    case "forgotPassword": return <ForgotPasswordScreen navigate={navigate} goBack={goBack} />;
    case "home": return <HomeScreenWired navigate={navigate} />;
    case "map": return <MapScreenWired navigate={navigate} />;
    case "history": return <HistoryScreenWired navigate={navigate} />;
    case "profile": return <ProfileScreenWired navigate={navigate} />;
    case "camera": return <CameraViewfinderWired navigate={navigate} goBack={goBack} />;
    case "submission": return <SubmissionFormWired navigate={navigate} goBack={goBack} />;
    case "hazardDetail": return <HazardDetailWired goBack={goBack} />;
    case "notifications": return <NotificationsWired goBack={goBack} />;
    case "settings": return <SettingsWired navigate={navigate} goBack={goBack} />;
    default: return null;
  }
}

/* ═══════════════════════════════════════════════════════
   ONBOARDING SCREENS (preserving exact visuals)
   ═══════════════════════════════════════════════════════ */
function OnboardingScreen({ step, navigate }: { step: number; navigate: (to: ScreenId, t: Transition) => void }) {
  const nextScreens: Record<number, ScreenId> = { 1: "onboard2", 2: "onboard3", 3: "onboard4" };
  const icons = [Camera, MapPin, ThumbsUp, Award];
  const titles = ["Report Hazards Instantly", "Navigate Safely", "Verify & Update", "Earn Trust Badges"];
  const descs = [
    "Just snap a photo. Our built-in AI automatically detects the road defect, calculates its severity, and tags your exact location.",
    "Explore the live community map to view reported road defects, check hazard statuses, and avoid high-risk zones in your town.",
    "Keep the map accurate. Help your fellow drivers by voting to confirm if a nearby hazard is still dangerous or has been repaired.",
    "Build your civic reputation! Gain trust points and unlock exclusive badges.",
  ];
  const Icon = icons[step - 1];

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: "#f8fafc" }}>
      <div className="flex items-center justify-between px-8 pt-16 pb-2">
        <div className="w-10" />
        <button onClick={() => navigate("signup", "dissolve")} className="text-sm tracking-wide" style={{ color: "#334155" }}>Skip</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center" style={{ backgroundColor: "#fef3c7" }}>
          <Icon className="w-8 h-8" style={{ color: "#d97706" }} />
        </div>
        {/* Simplified illustration placeholder */}
        <div className="w-[220px] h-[300px] rounded-[28px] overflow-hidden mb-4" style={{ backgroundColor: "#0f172a", border: "6px solid #1a1a2e" }}>
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}>
            <Icon className="w-16 h-16" style={{ color: "#d97706", opacity: 0.3 }} />
          </div>
        </div>
      </div>
      <div className="px-8 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-[22px] mb-2" style={{ color: "#0f172a", fontWeight: 700 }}>{titles[step - 1]}</h2>
          <p className="text-[14px] leading-[1.6] px-2" style={{ color: "#334155" }}>{descs[step - 1]}</p>
        </div>
        {step < 4 ? (
          <div className="flex items-center justify-between">
            <PaginationDots active={step} />
            <button onClick={() => navigate(nextScreens[step], "push-left")} className="px-7 py-3 rounded-full text-[14px] text-white flex items-center gap-1.5" style={{ backgroundColor: "#d97706", fontWeight: 600 }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <PaginationDots active={4} />
            <button onClick={() => navigate("signup", "push-left")} className="w-full py-4 rounded-full text-[16px] text-white" style={{ backgroundColor: "#d97706", fontWeight: 700 }}>
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PaginationDots({ active }: { active: number }) {
  return (
    <div className="flex gap-2 items-center">
      {[1,2,3,4].map(i => (
        <div key={i} className="rounded-full" style={{ width: i === active ? "24px" : "8px", height: "8px", backgroundColor: i === active ? "#d97706" : "#e2e8f0", borderRadius: "4px" }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   AUTH SCREENS
   ═══════════════════════════════════════════════════════ */
function SplashScreen() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative" style={{ backgroundColor: "#0f172a" }}>
      <div className="absolute" style={{ width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }} />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="rounded-2xl flex items-center justify-center" style={{ width:"80px", height:"80px", background:"linear-gradient(135deg, #d97706, #f59e0b)", boxShadow:"0 8px 24px rgba(217,119,6,0.3)" }}>
          <Shield style={{ width:40, height:40, color:"#fff" }} />
        </div>
        <span style={{ fontSize:"28px", color:"#f8fafc", fontWeight:700, letterSpacing:"-0.02em" }}>JalanGuard</span>
      </div>
      <p className="mt-4 text-[13px] tracking-wide" style={{ color:"#94a3b8" }}>AI-Powered Road Safety</p>
      <div className="mt-12 flex gap-1.5">
        {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor:"#d97706", animation:`splashPulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
      </div>
      <div className="absolute bottom-12"><p className="text-[11px]" style={{ color:"#475569" }}>Safer roads, together.</p></div>
    </div>
  );
}

function InputField({ icon, placeholder, type = "text", showToggle, onToggle, isVisible }: { icon: React.ReactNode; placeholder: string; type?: string; showToggle?: boolean; onToggle?: () => void; isVisible?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 rounded-2xl" style={{ backgroundColor:"#334155", height:"56px" }}>
      <div style={{ color:"#94a3b8" }}>{icon}</div>
      <input type={showToggle ? (isVisible ? "text" : "password") : type} placeholder={placeholder} className="flex-1 bg-transparent outline-none text-[15px]" style={{ color:"#f8fafc" }} />
      {showToggle && <button onClick={onToggle} className="p-1" style={{ color:"#94a3b8" }}>{isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>}
    </div>
  );
}

function GoogleButton() {
  return (
    <button className="w-full flex items-center justify-center gap-3 rounded-2xl" style={{ height:"56px", backgroundColor:"#334155", color:"#f8fafc", fontSize:"15px", fontWeight:500 }}>
      <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Continue with Google
    </button>
  );
}

function SignUpScreen({ navigate }: { navigate: (to: ScreenId, t: Transition) => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="flex-1 flex flex-col px-6 pt-20">
        <div className="flex justify-center mb-8 mt-4">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl flex items-center justify-center" style={{ width:"40px", height:"40px", background:"linear-gradient(135deg, #d97706, #f59e0b)" }}><Shield style={{ width:20, height:20, color:"#fff" }} /></div>
            <span style={{ fontSize:"16px", color:"#f8fafc", fontWeight:700 }}>JalanGuard</span>
          </div>
        </div>
        <div className="mb-8">
          <h1 className="text-[26px] text-center mb-2" style={{ color:"#f8fafc", fontWeight:700 }}>Create an Account</h1>
          <p className="text-[14px] text-center" style={{ color:"#94a3b8" }}>Join the community and help make roads safer</p>
        </div>
        <div className="flex flex-col gap-4 mb-6">
          <InputField icon={<User className="w-5 h-5" />} placeholder="Full Name" />
          <InputField icon={<Mail className="w-5 h-5" />} placeholder="Email Address" type="email" />
          <InputField icon={<Lock className="w-5 h-5" />} placeholder="Password" type="password" showToggle onToggle={() => setShowPw(!showPw)} isVisible={showPw} />
        </div>
        <button onClick={() => navigate("home", "push-left")} className="w-full rounded-2xl flex items-center justify-center gap-2" style={{ height:"56px", backgroundColor:"#d97706", color:"#fff", fontSize:"16px", fontWeight:700, boxShadow:"0 8px 24px rgba(217,119,6,0.3)" }}>
          Create Account <ChevronRight className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor:"#334155" }} />
          <span className="text-[12px]" style={{ color:"#64748b" }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor:"#334155" }} />
        </div>
        <GoogleButton />
      </div>
      <div className="pb-12 pt-6 flex justify-center">
        <p className="text-[14px]" style={{ color:"#94a3b8" }}>
          Already have an account?{" "}<button onClick={() => navigate("login", "instant")} className="underline" style={{ color:"#d97706", fontWeight:600 }}>Login</button>
        </p>
      </div>
    </div>
  );
}

function LoginScreen({ navigate }: { navigate: (to: ScreenId, t: Transition) => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="flex-1 flex flex-col px-6 pt-20">
        <div className="flex justify-center mb-8 mt-4">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl flex items-center justify-center" style={{ width:"40px", height:"40px", background:"linear-gradient(135deg, #d97706, #f59e0b)" }}><Shield style={{ width:20, height:20, color:"#fff" }} /></div>
            <span style={{ fontSize:"16px", color:"#f8fafc", fontWeight:700 }}>JalanGuard</span>
          </div>
        </div>
        <div className="mb-8">
          <h1 className="text-[26px] text-center mb-2" style={{ color:"#f8fafc", fontWeight:700 }}>Welcome Back</h1>
          <p className="text-[14px] text-center" style={{ color:"#94a3b8" }}>Login to continue reporting hazards</p>
        </div>
        <div className="flex flex-col gap-4 mb-2">
          <InputField icon={<Mail className="w-5 h-5" />} placeholder="Email Address" type="email" />
          <InputField icon={<Lock className="w-5 h-5" />} placeholder="Password" type="password" showToggle onToggle={() => setShowPw(!showPw)} isVisible={showPw} />
        </div>
        <div className="flex justify-end mb-6">
          <button onClick={() => navigate("forgotPassword", "push-left")} className="text-[13px]" style={{ color:"#e2e8f0", fontWeight:500 }}>Forgot Password?</button>
        </div>
        <button onClick={() => navigate("home", "push-left")} className="w-full rounded-2xl flex items-center justify-center gap-2" style={{ height:"56px", backgroundColor:"#d97706", color:"#fff", fontSize:"16px", fontWeight:700, boxShadow:"0 8px 24px rgba(217,119,6,0.3)" }}>
          Login <ChevronRight className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor:"#334155" }} />
          <span className="text-[12px]" style={{ color:"#64748b" }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor:"#334155" }} />
        </div>
        <GoogleButton />
      </div>
      <div className="pb-12 pt-6 flex justify-center">
        <p className="text-[14px]" style={{ color:"#94a3b8" }}>
          Don't have an account?{" "}<button onClick={() => navigate("signup", "instant")} className="underline" style={{ color:"#d97706", fontWeight:600 }}>Sign up</button>
        </p>
      </div>
    </div>
  );
}

function ForgotPasswordScreen({ navigate, goBack }: { navigate: (to: ScreenId, t: Transition) => void; goBack: (t?: Transition) => void }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="flex items-center px-6 pt-16 mt-4">
        <button onClick={() => goBack("push-right")} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor:"#334155" }}>
          <ArrowLeft className="w-5 h-5" style={{ color:"#e2e8f0" }} />
        </button>
      </div>
      <div className="flex-1 flex flex-col px-6 pt-12">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background:"linear-gradient(135deg, rgba(217,119,6,0.2), rgba(217,119,6,0.05))", border:"1px solid rgba(217,119,6,0.2)" }}>
            <Mail className="w-10 h-10" style={{ color:"#d97706" }} />
          </div>
        </div>
        <h1 className="text-[26px] text-center mb-2" style={{ color:"#f8fafc", fontWeight:700 }}>Reset Password</h1>
        <p className="text-[14px] text-center mb-10 px-4" style={{ color:"#94a3b8" }}>Enter your email to receive a password reset link</p>
        <div className="flex items-center gap-3 px-4 rounded-2xl mb-8" style={{ backgroundColor:"#334155", height:"56px" }}>
          <Mail className="w-5 h-5" style={{ color:"#94a3b8" }} />
          <input type="email" placeholder="Email Address" className="flex-1 bg-transparent outline-none text-[15px]" style={{ color:"#f8fafc" }} />
        </div>
        <button className="w-full py-4 rounded-2xl text-[16px] flex items-center justify-center gap-2" style={{ backgroundColor:"#d97706", color:"#fff", fontWeight:700, boxShadow:"0 8px 24px rgba(217,119,6,0.3)" }}>
          Send Reset Link
        </button>
        <div className="flex justify-center mt-6">
          <button onClick={() => navigate("login", "push-right")} className="text-[14px]" style={{ color:"#94a3b8" }}>
            Back to <span style={{ color:"#d97706", fontWeight:600 }}>Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BOTTOM NAVIGATION (shared)
   ═══════════════════════════════════════════════════════ */
function BottomNavWired({ active, navigate }: { active: string; navigate: (to: ScreenId, t: Transition) => void }) {
  const tabs: { id: ScreenId; icon: typeof Home; label: string }[] = [
    { id: "home", icon: Home, label: "Home" },
    { id: "map", icon: Map, label: "Map" },
    { id: "history", icon: Clock, label: "History" },
    { id: "profile", icon: User, label: "Profile" },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30">
        <button onClick={() => navigate("camera", "slide-up")} className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor:"#d97706", boxShadow:"0 6px 20px rgba(217,119,6,0.45)" }}>
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="flex items-center justify-around px-4" style={{ height:"82px", backgroundColor:"#334155", borderTop:"1px solid rgba(226,232,240,0.1)", borderRadius:"0 0 44px 44px", paddingBottom:"16px" }}>
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button key={tab.id} onClick={() => navigate(tab.id, "instant")} className="flex flex-col items-center gap-1" style={{ marginRight: i === 1 ? "40px" : 0, marginLeft: i === 2 ? "40px" : 0 }}>
              <Icon className="w-5 h-5" style={{ color: isActive ? "#d97706" : "#e2e8f0" }} fill={isActive ? "#d97706" : "none"} />
              <span className="text-[10px]" style={{ color: isActive ? "#d97706" : "#e2e8f0", fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN APP SCREENS
   ═══════════════════════════════════════════════════════ */
function HomeScreenWired({ navigate }: { navigate: (to: ScreenId, t: Transition) => void }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="flex-1 overflow-y-auto pt-16 pb-24 px-6">
        <div className="flex items-center justify-between mt-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background:"linear-gradient(135deg, #d97706, #f59e0b)" }}>
              <span className="text-[14px] text-white" style={{ fontWeight:700 }}>JG</span>
            </div>
            <div>
              <p className="text-[13px]" style={{ color:"#94a3b8" }}>Good morning</p>
              <p className="text-[17px]" style={{ color:"#f8fafc", fontWeight:700 }}>Hello, User!</p>
            </div>
          </div>
          <button onClick={() => navigate("notifications", "push-left")} className="w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ backgroundColor:"#334155" }}>
            <Bell className="w-5 h-5" style={{ color:"#e2e8f0" }} />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor:"#dc2626" }} />
          </button>
        </div>

        {/* Summary Card */}
        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor:"#334155" }}>
          <p className="text-[13px] mb-4" style={{ color:"#94a3b8", fontWeight:500 }}>Your Contributions</p>
          <div className="flex justify-between">
            {[
              { value:"3", label:"Hazards\nReported", icon: AlertTriangle },
              { value:"12", label:"Votes\nCast", icon: ThumbsUp },
              { value:"750", label:"Trust\nScore", icon: TrendingUp },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor:"rgba(217,119,6,0.15)" }}>
                    <Icon className="w-5 h-5" style={{ color:"#d97706" }} />
                  </div>
                  <span className="text-[22px]" style={{ color:"#d97706", fontWeight:700 }}>{stat.value}</span>
                  <span className="text-[10px] whitespace-pre-line mt-0.5" style={{ color:"#94a3b8" }}>{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini-Map Card */}
        <button onClick={() => navigate("map", "instant")} className="w-full rounded-2xl overflow-hidden mb-5 relative" style={{ height:"180px" }}>
          <img src={MAP_IMG} alt="Map" className="w-full h-full object-cover" style={{ filter:"brightness(0.5) saturate(0.7)" }} />
          <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)" }} />
          {[{ top:"30%", left:"25%" }, { top:"45%", left:"60%" }, { top:"35%", left:"75%" }].map((pos, i) => (
            <div key={i} className="absolute" style={{ top:pos.top, left:pos.left }}>
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor:"#d97706" }}><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>
            </div>
          ))}
          <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
            <div>
              <p className="text-[15px] text-left" style={{ color:"#f8fafc", fontWeight:600 }}>Community Map</p>
              <p className="text-[11px] text-left" style={{ color:"#94a3b8" }}>5 hazards near you</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor:"rgba(217,119,6,0.2)" }}>
              <ChevronRight className="w-4 h-4" style={{ color:"#d97706" }} />
            </div>
          </div>
        </button>

        {/* Recent Activity */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[15px]" style={{ color:"#f8fafc", fontWeight:600 }}>Recent Activity</p>
            <button className="text-[12px]" style={{ color:"#d97706", fontWeight:500 }}>See All</button>
          </div>
          {[
            { title:"Pothole reported", subtitle:"Jl. Sudirman · 2h ago", color:"#d97706" },
            { title:"Vote confirmed", subtitle:"Jl. Thamrin · 5h ago", color:"#16a34a" },
            { title:"Badge earned", subtitle:"Road Hero · 1d ago", color:"#8b5cf6" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: i < 2 ? "1px solid rgba(51,65,85,0.6)" : "none" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:`${item.color}20` }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor:item.color }} />
              </div>
              <div className="flex-1">
                <p className="text-[13px]" style={{ color:"#f8fafc", fontWeight:500 }}>{item.title}</p>
                <p className="text-[11px]" style={{ color:"#64748b" }}>{item.subtitle}</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color:"#475569" }} />
            </div>
          ))}
        </div>
      </div>
      <BottomNavWired active="home" navigate={navigate} />
    </div>
  );
}

function MapScreenWired({ navigate }: { navigate: (to: ScreenId, t: Transition) => void }) {
  const [showSheet, setShowSheet] = useState(false);
  const [mapMode, setMapMode] = useState<"pins"|"zones">("pins");
  const pins = [
    { top:"28%", left:"22%", severity:"high" },
    { top:"42%", left:"55%", severity:"medium" },
    { top:"55%", left:"35%", severity:"high" },
    { top:"38%", left:"75%", severity:"low" },
    { top:"65%", left:"65%", severity:"medium" },
  ];

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <img src={MAP_IMG} alt="Map" className="w-full h-full object-cover" style={{ filter:"brightness(0.45) saturate(0.6) hue-rotate(200deg)" }} />
          <div className="absolute inset-0" style={{ opacity:0.08 }}>
            {Array.from({ length:20 }).map((_,i) => <div key={`h${i}`} className="absolute w-full" style={{ top:`${i*44}px`, height:"1px", backgroundColor:"#94a3b8" }} />)}
            {Array.from({ length:12 }).map((_,i) => <div key={`v${i}`} className="absolute h-full" style={{ left:`${i*34}px`, width:"1px", backgroundColor:"#94a3b8" }} />)}
          </div>
          <div className="absolute" style={{ top:"200px", left:0, right:0, height:"3px", backgroundColor:"#475569", opacity:0.6 }} />
          <div className="absolute" style={{ top:"350px", left:0, right:0, height:"4px", backgroundColor:"#475569", opacity:0.5 }} />
          <div className="absolute" style={{ top:"100px", left:"130px", width:"3px", height:"600px", backgroundColor:"#475569", opacity:0.5 }} />
          <div className="absolute" style={{ top:"50px", left:"260px", width:"3px", height:"500px", backgroundColor:"#475569", opacity:0.4 }} />

          {mapMode === "zones" && [
            { top:"22%", left:"15%", w:140, h:120 },
            { top:"50%", left:"40%", w:160, h:130 },
            { top:"35%", left:"60%", w:100, h:100 },
          ].map((zone,i) => <div key={i} className="absolute rounded-full" style={{ top:zone.top, left:zone.left, width:`${zone.w}px`, height:`${zone.h}px`, background:"radial-gradient(circle, rgba(220,38,38,0.4) 0%, rgba(220,38,38,0.15) 40%, transparent 70%)" }} />)}

          {mapMode === "pins" && pins.map((pin,i) => (
            <button key={i} onClick={() => setShowSheet(true)} className="absolute" style={{ top:pin.top, left:pin.left }}>
              <div className="absolute -inset-2 rounded-full animate-ping" style={{ backgroundColor: pin.severity === "high" ? "#dc2626" : "#d97706", opacity:0.15, animationDuration:"2s" }} />
              <div className="w-6 h-6 rounded-full flex items-center justify-center relative z-10" style={{ backgroundColor:"#d97706", boxShadow:"0 2px 8px rgba(217,119,6,0.5)" }}>
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
              <div style={{ width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:"6px solid #d97706", marginTop:"-1px", marginLeft:"3px" }} />
            </button>
          ))}

          <div className="absolute" style={{ top:"48%", left:"45%" }}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-full animate-ping" style={{ backgroundColor:"#3b82f6", opacity:0.15, animationDuration:"2s" }} />
              <div className="w-5 h-5 rounded-full border-3 border-white flex items-center justify-center" style={{ backgroundColor:"#3b82f6", borderWidth:"3px" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-16 left-0 right-0 z-10 px-6 flex flex-col items-center gap-3">
          <div className="w-full rounded-2xl px-4 py-3 flex items-center gap-3" style={{ backgroundColor:"#334155", boxShadow:"0 4px 16px rgba(0,0,0,0.3)" }}>
            <Search className="w-4 h-4" style={{ color:"#94a3b8" }} />
            <span className="text-[13px]" style={{ color:"#94a3b8" }}>Search hazards...</span>
          </div>
          <div className="rounded-full p-1 flex" style={{ backgroundColor:"#334155", boxShadow:"0 4px 16px rgba(0,0,0,0.3)" }}>
            {(["pins","zones"] as const).map(mode => (
              <button key={mode} onClick={() => setMapMode(mode)} className="px-5 py-2 rounded-full text-[12px] capitalize" style={{ backgroundColor: mapMode === mode ? "#d97706" : "transparent", color: mapMode === mode ? "#fff" : "#94a3b8", fontWeight: mapMode === mode ? 600 : 400 }}>
                {mode === "pins" ? "📍 Pins" : "🔥 Red Zones"}
              </button>
            ))}
          </div>
        </div>

        {showSheet && (
          <div className="absolute bottom-24 left-0 right-0 z-20 mx-4 rounded-2xl p-5" style={{ backgroundColor:"#1e293b", boxShadow:"0 -8px 32px rgba(0,0,0,0.4)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden"><img src={POTHOLE_1} alt="Hazard" className="w-full h-full object-cover" /></div>
                <div>
                  <p className="text-[14px]" style={{ color:"#f8fafc", fontWeight:600 }}>Severe Pothole</p>
                  <p className="text-[11px]" style={{ color:"#94a3b8" }}>Jl. Sudirman · 0.3 km</p>
                </div>
              </div>
              <button onClick={() => setShowSheet(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor:"#334155" }}>
                <X className="w-4 h-4" style={{ color:"#94a3b8" }} />
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px]" style={{ backgroundColor:"#dc262620", color:"#f87171", fontWeight:600 }}>High Severity</span>
              <span className="px-2.5 py-1 rounded-full text-[10px]" style={{ backgroundColor:"#d9770620", color:"#d97706", fontWeight:600 }}>Pending</span>
            </div>
            <button onClick={() => { setShowSheet(false); navigate("hazardDetail", "slide-up"); }} className="w-full py-3 rounded-xl text-[13px]" style={{ backgroundColor:"#d97706", color:"#fff", fontWeight:600 }}>
              View Details
            </button>
          </div>
        )}
      </div>
      <BottomNavWired active="map" navigate={navigate} />
    </div>
  );
}

function HistoryScreenWired({ navigate }: { navigate: (to: ScreenId, t: Transition) => void }) {
  const reports = [
    { title:"Severe Pothole", location:"Jl. Sudirman, Jakarta", date:"Mar 24, 2026", severity:"High", severityColor:"#dc2626", status:"Pending", statusColor:"#d97706", img: POTHOLE_1 },
    { title:"Road Crack", location:"Jl. Thamrin, Jakarta", date:"Mar 22, 2026", severity:"Medium", severityColor:"#f59e0b", status:"Verified", statusColor:"#3b82f6", img: CRACK_IMG },
    { title:"Broken Pavement", location:"Jl. Gatot Subroto", date:"Mar 18, 2026", severity:"High", severityColor:"#dc2626", status:"Fixed", statusColor:"#16a34a", img: HAZARD_IMG },
    { title:"Surface Damage", location:"Jl. Rasuna Said", date:"Mar 12, 2026", severity:"Low", severityColor:"#22c55e", status:"Fixed", statusColor:"#16a34a", img: CRACK_IMG },
  ];

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="flex-1 overflow-y-auto pt-16 pb-24 px-6">
        <div className="flex items-center justify-between mt-6 mb-2">
          <h1 className="text-[24px]" style={{ color:"#f8fafc", fontWeight:700 }}>My Reports</h1>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor:"#334155" }}>
            <Search className="w-5 h-5" style={{ color:"#e2e8f0" }} />
          </button>
        </div>
        <p className="text-[13px] mb-5" style={{ color:"#94a3b8" }}>{reports.length} total reports</p>
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {["All","Pending","Verified","Fixed"].map((filter,i) => (
            <button key={filter} className="px-4 py-2 rounded-full text-[12px] whitespace-nowrap" style={{ backgroundColor: i === 0 ? "#d97706" : "#334155", color: i === 0 ? "#fff" : "#94a3b8", fontWeight: i === 0 ? 600 : 400 }}>{filter}</button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {reports.map((report,i) => (
            <div key={i} className="rounded-2xl overflow-hidden flex" style={{ backgroundColor:"#334155" }}>
              <div className="w-24 h-28 flex-shrink-0"><img src={report.img} alt={report.title} className="w-full h-full object-cover" /></div>
              <div className="flex-1 p-3.5 flex flex-col justify-between">
                <div>
                  <p className="text-[14px] mb-0.5" style={{ color:"#f8fafc", fontWeight:600 }}>{report.title}</p>
                  <p className="text-[11px] mb-0.5" style={{ color:"#94a3b8" }}>{report.location}</p>
                  <p className="text-[10px]" style={{ color:"#64748b" }}>{report.date}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ backgroundColor:`${report.severityColor}20`, color:report.severityColor, fontWeight:600 }}>{report.severity}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ backgroundColor:`${report.statusColor}20`, color:report.statusColor, fontWeight:600 }}>{report.status}</span>
                </div>
              </div>
              <div className="flex items-center pr-3"><ChevronRight className="w-4 h-4" style={{ color:"#475569" }} /></div>
            </div>
          ))}
        </div>
      </div>
      <BottomNavWired active="history" navigate={navigate} />
    </div>
  );
}

function ProfileScreenWired({ navigate }: { navigate: (to: ScreenId, t: Transition) => void }) {
  const badges = [
    { icon: Star, label:"First Report", unlocked:true },
    { icon: Shield, label:"Road Hero", unlocked:true },
    { icon: Award, label:"Verifier", unlocked:true },
    { icon: Eye, label:"Watchman", unlocked:false },
  ];
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="flex-1 overflow-y-auto pt-16 pb-24 px-6">
        <div className="flex items-center justify-end mt-6 mb-6">
          <button onClick={() => navigate("settings", "push-left")} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor:"#334155" }}>
            <Settings className="w-5 h-5" style={{ color:"#e2e8f0" }} />
          </button>
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3" style={{ background:"linear-gradient(135deg, #d97706, #f59e0b)", boxShadow:"0 8px 24px rgba(217,119,6,0.3)" }}>
            <span className="text-[32px] text-white" style={{ fontWeight:700 }}>JG</span>
          </div>
          <h2 className="text-[20px] mb-1" style={{ color:"#f8fafc", fontWeight:700 }}>JalanGuard User</h2>
          <button className="text-[13px]" style={{ color:"#d97706", fontWeight:500 }}>Edit Profile</button>
        </div>
        <div className="flex rounded-2xl overflow-hidden mb-6" style={{ backgroundColor:"#334155" }}>
          {[{ value:"24", label:"Reports" }, { value:"58", label:"Verifies" }, { value:"#12", label:"Rank" }].map((stat,i) => (
            <div key={i} className="flex-1 py-4 flex flex-col items-center" style={{ borderRight: i < 2 ? "1px solid rgba(71,85,105,0.5)" : "none" }}>
              <span className="text-[20px]" style={{ color:"#d97706", fontWeight:700 }}>{stat.value}</span>
              <span className="text-[11px]" style={{ color:"#94a3b8" }}>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor:"#334155" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[14px]" style={{ color:"#f8fafc", fontWeight:600 }}>Trust Score</p>
            <p className="text-[14px]" style={{ color:"#d97706", fontWeight:700 }}>Level 4</p>
          </div>
          <p className="text-[11px] mb-3" style={{ color:"#94a3b8" }}>Trusted Contributor</p>
          <div className="w-full h-3 rounded-full overflow-hidden mb-2" style={{ backgroundColor:"#0f172a" }}>
            <div className="h-full rounded-full" style={{ width:"75%", background:"linear-gradient(90deg, #d97706, #f59e0b)" }} />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px]" style={{ color:"#64748b" }}>750 pts</span>
            <span className="text-[10px]" style={{ color:"#64748b" }}>1000 pts</span>
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor:"#334155" }}>
          <p className="text-[14px] mb-4" style={{ color:"#f8fafc", fontWeight:600 }}>Badges Earned</p>
          <div className="grid grid-cols-4 gap-3">
            {badges.map((badge,i) => {
              const Icon = badge.icon;
              return (
                <div key={i} className="flex flex-col items-center" style={{ opacity: badge.unlocked ? 1 : 0.35 }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2" style={{ backgroundColor: badge.unlocked ? "rgba(217,119,6,0.15)" : "rgba(71,85,105,0.3)", border: badge.unlocked ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(71,85,105,0.3)" }}>
                    <Icon className="w-7 h-7" style={{ color: badge.unlocked ? "#d97706" : "#475569" }} fill={badge.unlocked && badge.icon === Star ? "#d97706" : "none"} />
                  </div>
                  <span className="text-[10px] text-center" style={{ color: badge.unlocked ? "#e2e8f0" : "#475569", fontWeight:500 }}>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNavWired active="profile" navigate={navigate} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CORE INTERACTION SCREENS
   ═══════════════════════════════════════════════════════ */
function CameraViewfinderWired({ navigate, goBack }: { navigate: (to: ScreenId, t: Transition) => void; goBack: (t?: Transition) => void }) {
  return (
    <div className="w-full h-full relative">
      <img src={POTHOLE_1} alt="Camera feed" className="w-full h-full object-cover" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/15" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/15" />
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/15" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/15" />
      </div>
      <div className="absolute flex items-center justify-center" style={{ top:"32%", left:"50%", transform:"translate(-50%,-50%)" }}>
        <div className="relative" style={{ width:"160px", height:"130px" }}>
          <div className="absolute top-0 left-0 w-8 h-8" style={{ borderColor:"#d97706", borderWidth:"3px 0 0 3px", borderStyle:"solid" }} />
          <div className="absolute top-0 right-0 w-8 h-8" style={{ borderColor:"#d97706", borderWidth:"3px 3px 0 0", borderStyle:"solid" }} />
          <div className="absolute bottom-0 left-0 w-8 h-8" style={{ borderColor:"#d97706", borderWidth:"0 0 3px 3px", borderStyle:"solid" }} />
          <div className="absolute bottom-0 right-0 w-8 h-8" style={{ borderColor:"#d97706", borderWidth:"0 3px 3px 0", borderStyle:"solid" }} />
          <div className="absolute left-1 right-1 h-0.5 animate-pulse" style={{ top:"50%", backgroundColor:"#d97706", opacity:0.6 }} />
          <div className="absolute -top-8 left-0 px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ backgroundColor:"#d97706" }}>
            <Brain className="w-3 h-3 text-white" /><span className="text-[10px] text-white" style={{ fontWeight:600 }}>AI Scanning</span>
          </div>
          <div className="absolute -bottom-8 right-0 px-2.5 py-1 rounded-lg" style={{ backgroundColor:"#dc2626" }}>
            <span className="text-[10px] text-white" style={{ fontWeight:600 }}>⚠ High Severity</span>
          </div>
        </div>
      </div>
      <button onClick={() => goBack("slide-down")} className="absolute top-14 left-6 w-10 h-10 rounded-full flex items-center justify-center z-20" style={{ backgroundColor:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)" }}>
        <X className="w-5 h-5 text-white" />
      </button>
      <div className="absolute top-14 right-6 px-3 py-1.5 rounded-full flex items-center gap-1.5 z-20" style={{ backgroundColor:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)" }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor:"#16a34a" }} />
        <span className="text-[11px] text-white" style={{ fontWeight:500 }}>LIVE</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center px-10" style={{ height:"160px", background:"linear-gradient(to top, rgba(15,23,42,0.95) 60%, transparent 100%)", borderRadius:"0 0 44px 44px", paddingBottom:"36px" }}>
        <button className="w-12 h-12 rounded-xl flex items-center justify-center absolute left-10" style={{ backgroundColor:"rgba(51,65,85,0.7)" }}>
          <ImageIcon className="w-5 h-5" style={{ color:"#e2e8f0" }} />
        </button>
        <button onClick={() => navigate("submission", "dissolve")} className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ border:"4px solid #d97706" }}>
            <div className="w-16 h-16 rounded-full" style={{ backgroundColor:"#d97706", boxShadow:"0 0 20px rgba(217,119,6,0.4)" }} />
          </div>
        </button>
        <button className="w-12 h-12 rounded-xl flex items-center justify-center absolute right-10" style={{ backgroundColor:"rgba(51,65,85,0.7)" }}>
          <Zap className="w-5 h-5" style={{ color:"#e2e8f0" }} />
        </button>
      </div>
      <div className="absolute left-6 right-6 z-20 rounded-2xl px-4 py-3 flex items-center justify-between" style={{ bottom:"175px", backgroundColor:"rgba(15,23,42,0.8)", backdropFilter:"blur(8px)" }}>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color:"#d97706" }} />
          <span className="text-[11px]" style={{ color:"#94a3b8" }}>-6.2088, 106.8456</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color:"#d97706" }} />
          <span className="text-[11px]" style={{ color:"#d97706", fontWeight:600 }}>Pothole Detected</span>
        </div>
      </div>
    </div>
  );
}

function SubmissionFormWired({ navigate, goBack }: { navigate: (to: ScreenId, t: Transition) => void; goBack: (t?: Transition) => void }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="flex items-center gap-4 px-6 pt-16 pb-4 mt-4">
        <button onClick={() => goBack()} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor:"#334155" }}>
          <ArrowLeft className="w-5 h-5" style={{ color:"#e2e8f0" }} />
        </button>
        <h1 className="text-[18px]" style={{ color:"#f8fafc", fontWeight:700 }}>Submit Report</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <div className="rounded-2xl overflow-hidden mb-5 relative" style={{ height:"220px" }}>
          <img src={POTHOLE_1} alt="Captured" className="w-full h-full object-cover" />
          <div className="absolute" style={{ top:"25%", left:"30%", width:"40%", height:"45%" }}>
            <div className="w-full h-full relative">
              <div className="absolute top-0 left-0 w-5 h-5" style={{ borderTop:"2px solid #d97706", borderLeft:"2px solid #d97706" }} />
              <div className="absolute top-0 right-0 w-5 h-5" style={{ borderTop:"2px solid #d97706", borderRight:"2px solid #d97706" }} />
              <div className="absolute bottom-0 left-0 w-5 h-5" style={{ borderBottom:"2px solid #d97706", borderLeft:"2px solid #d97706" }} />
              <div className="absolute bottom-0 right-0 w-5 h-5" style={{ borderBottom:"2px solid #d97706", borderRight:"2px solid #d97706" }} />
            </div>
          </div>
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg flex items-center gap-1" style={{ backgroundColor:"rgba(15,23,42,0.8)" }}>
            <Brain className="w-3 h-3" style={{ color:"#d97706" }} />
            <span className="text-[10px]" style={{ color:"#d97706", fontWeight:600 }}>AI Analyzed</span>
          </div>
        </div>
        <div className="rounded-2xl p-4 mb-3 flex items-center gap-4" style={{ backgroundColor:"#334155" }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor:"rgba(217,119,6,0.15)" }}>
            <MapPin className="w-5 h-5" style={{ color:"#d97706" }} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] mb-0.5" style={{ color:"#94a3b8" }}>GPS Coordinates</p>
            <p className="text-[14px]" style={{ color:"#f8fafc", fontWeight:600 }}>-6.2088° S, 106.8456° E</p>
            <p className="text-[11px]" style={{ color:"#64748b" }}>Jl. Sudirman, Jakarta Pusat</p>
          </div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor:"rgba(22,163,74,0.2)" }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor:"#16a34a" }} />
          </div>
        </div>
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-4" style={{ backgroundColor:"#334155" }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor:"rgba(217,119,6,0.15)" }}>
            <Brain className="w-5 h-5" style={{ color:"#d97706" }} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] mb-0.5" style={{ color:"#94a3b8" }}>AI Severity Assessment</p>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[12px]" style={{ backgroundColor:"rgba(217,119,6,0.2)", color:"#d97706", fontWeight:700 }}>High Severity</span>
              <span className="text-[11px]" style={{ color:"#64748b" }}>92% confidence</span>
            </div>
          </div>
        </div>
        <p className="text-[13px] mb-2.5" style={{ color:"#94a3b8", fontWeight:500 }}>Hazard Type</p>
        <div className="flex gap-2 mb-5 flex-wrap">
          {["Pothole","Crack","Sinkhole","Debris"].map((type,i) => (
            <button key={type} className="px-4 py-2.5 rounded-xl text-[12px]" style={{ backgroundColor: i === 0 ? "#d97706" : "#334155", color: i === 0 ? "#fff" : "#94a3b8", fontWeight: i === 0 ? 600 : 400 }}>{type}</button>
          ))}
        </div>
        <p className="text-[13px] mb-2.5" style={{ color:"#94a3b8", fontWeight:500 }}>Description</p>
        <textarea placeholder="Add an optional description..." className="w-full rounded-2xl px-4 py-4 text-[14px] resize-none outline-none" rows={3} style={{ backgroundColor:"#334155", color:"#f8fafc", border:"none" }} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4" style={{ background:"linear-gradient(to top, #0f172a 80%, transparent)" }}>
        <button onClick={() => navigate("home", "slide-down")} className="w-full py-4 rounded-2xl text-[16px] flex items-center justify-center gap-2" style={{ backgroundColor:"#d97706", color:"#fff", fontWeight:700, boxShadow:"0 8px 24px rgba(217,119,6,0.3)" }}>
          Submit Report <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function HazardDetailWired({ goBack }: { goBack: (t?: Transition) => void }) {
  const [vote, setVote] = useState<"fixed"|"broken"|null>(null);
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="relative" style={{ height:"300px" }}>
        <img src={POTHOLE_2} alt="Hazard" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background:"linear-gradient(to top, #0f172a 5%, transparent 50%)" }} />
        <button onClick={() => goBack("slide-down")} className="absolute top-14 left-6 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)" }}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button className="absolute top-14 right-6 w-10 h-10 rounded-full flex items-center justify-center z-10" style={{ backgroundColor:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)" }}>
          <Share2 className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-4 left-6 px-3 py-1.5 rounded-full" style={{ backgroundColor:"rgba(217,119,6,0.2)", border:"1px solid rgba(217,119,6,0.4)" }}>
          <span className="text-[12px]" style={{ color:"#d97706", fontWeight:600 }}>⚠ High Severity</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-12">
        <h2 className="text-[22px] mt-4 mb-1" style={{ color:"#f8fafc", fontWeight:700 }}>Severe Pothole</h2>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" style={{ color:"#94a3b8" }} />
            <span className="text-[12px]" style={{ color:"#94a3b8" }}>Jl. Sudirman, Jakarta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px]" style={{ color:"#64748b" }}>Mar 24, 2026</span>
          </div>
        </div>
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ backgroundColor:"#334155" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:"linear-gradient(135deg, #d97706, #f59e0b)" }}>
            <span className="text-[12px] text-white" style={{ fontWeight:700 }}>AR</span>
          </div>
          <div className="flex-1">
            <p className="text-[13px]" style={{ color:"#f8fafc", fontWeight:600 }}>Ahmad R.</p>
            <p className="text-[11px]" style={{ color:"#94a3b8" }}>Trusted Contributor · 42 reports</p>
          </div>
          <div className="px-2 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor:"rgba(217,119,6,0.15)" }}>
            <Shield className="w-3 h-3" style={{ color:"#d97706" }} />
            <span className="text-[9px]" style={{ color:"#d97706", fontWeight:600 }}>Lvl 4</span>
          </div>
        </div>
        <div className="mb-5">
          <p className="text-[15px] mb-1" style={{ color:"#f8fafc", fontWeight:600 }}>Community Verification</p>
          <p className="text-[12px] mb-4" style={{ color:"#94a3b8" }}>Has this hazard been resolved?</p>
          <div className="flex gap-3">
            <button onClick={() => setVote("fixed")} className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 text-[13px] transition-all" style={{ backgroundColor: vote === "fixed" ? "#d97706" : "#334155", color: vote === "fixed" ? "#fff" : "#e2e8f0", fontWeight:600, border: vote === "fixed" ? "2px solid #d97706" : "2px solid transparent" }}>
              <ThumbsUp className="w-5 h-5" />Yes, it's fixed
            </button>
            <button onClick={() => setVote("broken")} className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 text-[13px] transition-all" style={{ backgroundColor: vote === "broken" ? "#d97706" : "#334155", color: vote === "broken" ? "#fff" : "#e2e8f0", fontWeight:600, border: vote === "broken" ? "2px solid #d97706" : "2px solid transparent" }}>
              <ThumbsDown className="w-5 h-5" />Still broken
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="text-[11px]" style={{ color:"#64748b" }}>24 votes</span>
            <span className="text-[11px]" style={{ color:"#64748b" }}>·</span>
            <span className="text-[11px]" style={{ color:"#dc2626" }}>79% say still broken</span>
          </div>
        </div>
        <button className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[14px]" style={{ backgroundColor:"#334155", color:"#e2e8f0", fontWeight:500 }}>
          <Camera className="w-5 h-5" style={{ color:"#d97706" }} />Add Updated Photo
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NOTIFICATIONS SCREEN
   ═══════════════════════════════════════════════════════ */
function NotificationsWired({ goBack }: { goBack: (t?: Transition) => void }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="flex items-center justify-between px-6 pt-16 pb-3 mt-4">
        <button onClick={() => goBack()} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor:"#334155" }}>
          <ArrowLeft className="w-5 h-5" style={{ color:"#e2e8f0" }} />
        </button>
        <h1 className="text-[18px]" style={{ color:"#f8fafc", fontWeight:700 }}>Notifications</h1>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ backgroundColor:"#334155" }}>
          <Bell className="w-5 h-5" style={{ color:"#e2e8f0" }} />
          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor:"#d97706" }}>
            <span className="text-[9px] text-white" style={{ fontWeight:700 }}>4</span>
          </div>
        </button>
      </div>
      <div className="flex gap-2 px-6 mb-4">
        {["All","Actions","Updates","Rewards"].map((f,i) => (
          <button key={f} className="px-3.5 py-2 rounded-full text-[11px]" style={{ backgroundColor: i === 0 ? "#d97706" : "#334155", color: i === 0 ? "#fff" : "#94a3b8", fontWeight: i === 0 ? 600 : 400 }}>{f}</button>
        ))}
      </div>
      <div className="px-6 mb-2"><p className="text-[11px] tracking-wider uppercase" style={{ color:"#64748b", fontWeight:600 }}>Today</p></div>
      <div className="flex-1 overflow-y-auto px-6 pb-10">
        {/* Gamification */}
        <div className="flex items-start gap-3 py-4" style={{ borderBottom:"1px solid rgba(226,232,240,0.06)" }}>
          <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor:"rgba(217,119,6,0.15)" }}>
            <Trophy className="w-5 h-5" style={{ color:"#d97706" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-[1.5]" style={{ color:"#f8fafc", fontWeight:500 }}>You earned <span style={{ color:"#d97706", fontWeight:700 }}>50 Trust Points!</span> Thanks for being an active guardian.</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Star className="w-3 h-3" style={{ color:"#d97706" }} fill="#d97706" />
              <span className="text-[10px]" style={{ color:"#64748b" }}>Total: 800 pts</span>
            </div>
          </div>
          <span className="text-[10px] flex-shrink-0 mt-1" style={{ color:"#64748b" }}>2m ago</span>
        </div>
        {/* Status Update */}
        <div className="flex items-start gap-3 py-4" style={{ borderBottom:"1px solid rgba(226,232,240,0.06)" }}>
          <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden">
            <img src={POTHOLE_THUMB} alt="Pothole" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-[1.5]" style={{ color:"#f8fafc", fontWeight:500 }}>A pothole you reported near <span style={{ color:"#e2e8f0", fontWeight:600 }}>Jalan Gasing</span> has been marked as fixed by the community.</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <CheckCircle className="w-3 h-3" style={{ color:"#16a34a" }} />
              <span className="text-[10px]" style={{ color:"#16a34a", fontWeight:500 }}>Resolved</span>
            </div>
          </div>
          <span className="text-[10px] flex-shrink-0 mt-1" style={{ color:"#64748b" }}>15m ago</span>
        </div>
        {/* Photo Request */}
        <div className="rounded-2xl p-4 mt-3 mb-3" style={{ backgroundColor:"#334155" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" style={{ color:"#d97706" }} />
              <span className="text-[11px]" style={{ color:"#d97706", fontWeight:600 }}>Photo Update Request</span>
            </div>
            <span className="text-[10px]" style={{ color:"#64748b" }}>1h ago</span>
          </div>
          <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background:"linear-gradient(135deg, #3b82f6, #6366f1)" }}>
              <span className="text-[12px] text-white" style={{ fontWeight:700 }}>NK</span>
            </div>
            <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden -ml-5 border-2" style={{ borderColor:"#334155" }}>
              <img src={POTHOLE_1} alt="Report" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-[1.5]" style={{ color:"#f8fafc", fontWeight:500 }}>A nearby guardian requested to add an updated photo to your report at <span style={{ color:"#e2e8f0", fontWeight:600 }}>Jalan Ampang</span>.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3 h-3" style={{ color:"#94a3b8" }} />
            <span className="text-[10px]" style={{ color:"#94a3b8" }}>Jalan Ampang, Kuala Lumpur · 0.5 km away</span>
          </div>
          <div className="flex gap-2.5">
            <button className="flex-1 py-3 rounded-xl text-[13px] flex items-center justify-center gap-1.5" style={{ backgroundColor:"#d97706", color:"#fff", fontWeight:600, boxShadow:"0 4px 12px rgba(217,119,6,0.25)" }}>
              <ThumbsUp className="w-4 h-4" />Approve
            </button>
            <button className="flex-1 py-3 rounded-xl text-[13px] flex items-center justify-center gap-1.5" style={{ backgroundColor:"transparent", color:"#e2e8f0", fontWeight:500, border:"1.5px solid #e2e8f0" }}>
              <ThumbsDown className="w-4 h-4" />Reject
            </button>
          </div>
        </div>
        {/* 30-Day Check-in */}
        <div className="mb-2 mt-2"><p className="text-[11px] tracking-wider uppercase" style={{ color:"#64748b", fontWeight:600 }}>Earlier this week</p></div>
        <div className="rounded-2xl p-4 mt-1 mb-3" style={{ backgroundColor:"#334155" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color:"#f59e0b" }} />
              <span className="text-[11px]" style={{ color:"#f59e0b", fontWeight:600 }}>30-Day Check-in</span>
            </div>
            <span className="text-[10px]" style={{ color:"#64748b" }}>2d ago</span>
          </div>
          <div className="flex gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
              <img src={POTHOLE_THUMB} alt="Original report" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-[1.5]" style={{ color:"#f8fafc", fontWeight:500 }}>JalanGuard hasn't received an update on a reported pothole at <span style={{ color:"#e2e8f0", fontWeight:600 }}>Jalan Tuanku Abdul Rahman</span>. Is it still dangerous?</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" style={{ color:"#94a3b8" }} />
              <span className="text-[10px]" style={{ color:"#94a3b8" }}>1.2 km away</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" style={{ color:"#dc2626" }} />
              <span className="text-[10px]" style={{ color:"#dc2626", fontWeight:500 }}>High Severity</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button className="flex-1 py-3 rounded-xl text-[13px] flex items-center justify-center gap-1.5" style={{ backgroundColor:"#d97706", color:"#fff", fontWeight:600, boxShadow:"0 4px 12px rgba(217,119,6,0.25)" }}>
              <AlertTriangle className="w-4 h-4" />Yes, still broken
            </button>
            <button className="flex-1 py-3 rounded-xl text-[13px] flex items-center justify-center gap-1.5" style={{ backgroundColor:"#1e293b", color:"#e2e8f0", fontWeight:500 }}>
              <CheckCircle className="w-4 h-4" />No, it's fixed
            </button>
          </div>
        </div>
        {/* Badge notification */}
        <div className="flex items-start gap-3 py-4" style={{ borderBottom:"1px solid rgba(226,232,240,0.06)" }}>
          <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor:"rgba(139,92,246,0.15)" }}>
            <Star className="w-5 h-5" style={{ color:"#8b5cf6" }} fill="#8b5cf6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-[1.5]" style={{ color:"#f8fafc", fontWeight:500 }}>You unlocked the <span style={{ color:"#8b5cf6", fontWeight:700 }}>Road Hero</span> badge! Keep it up.</p>
            <span className="text-[10px]" style={{ color:"#64748b" }}>Badge · Achievement</span>
          </div>
          <span className="text-[10px] flex-shrink-0 mt-1" style={{ color:"#64748b" }}>3d ago</span>
        </div>
        {/* Vote notification */}
        <div className="flex items-start gap-3 py-4">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden">
            <img src={POTHOLE_1} alt="Report" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-[1.5]" style={{ color:"#f8fafc", fontWeight:500 }}>Your report at <span style={{ color:"#e2e8f0", fontWeight:600 }}>Jalan Bukit Bintang</span> received <span style={{ color:"#d97706", fontWeight:600 }}>12 community votes</span>.</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <ThumbsUp className="w-3 h-3" style={{ color:"#d97706" }} />
              <span className="text-[10px]" style={{ color:"#64748b" }}>Community Activity</span>
            </div>
          </div>
          <span className="text-[10px] flex-shrink-0 mt-1" style={{ color:"#64748b" }}>5d ago</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SETTINGS SCREEN
   ═══════════════════════════════════════════════════════ */
function SettingsWired({ navigate, goBack }: { navigate: (to: ScreenId, t: Transition) => void; goBack: (t?: Transition) => void }) {
  const settingsItems = [
    { icon: User, label:"Account", subtitle:"Manage your profile" },
    { icon: Bell, label:"Notifications", subtitle:"Alerts & push settings" },
    { icon: Shield, label:"Privacy", subtitle:"Data & permissions" },
    { icon: HelpCircle, label:"Help & Support", subtitle:"FAQs & contact" },
  ];
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:"#0f172a" }}>
      <div className="flex items-center justify-between px-6 pt-16 pb-4 mt-4">
        <button onClick={() => goBack()} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor:"#334155" }}>
          <ArrowLeft className="w-5 h-5" style={{ color:"#e2e8f0" }} />
        </button>
        <h1 className="text-[18px]" style={{ color:"#f8fafc", fontWeight:700 }}>Settings</h1>
        <div className="w-10" />
      </div>
      <div className="mx-6 mb-6 rounded-2xl p-4 flex items-center gap-4" style={{ backgroundColor:"#334155" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background:"linear-gradient(135deg, #d97706, #f59e0b)" }}>
          <span className="text-[18px] text-white" style={{ fontWeight:700 }}>JG</span>
        </div>
        <div className="flex-1">
          <p className="text-[16px]" style={{ color:"#f8fafc", fontWeight:600 }}>JalanGuard User</p>
          <p className="text-[12px]" style={{ color:"#94a3b8" }}>user@jalanguard.com</p>
        </div>
        <ChevronRight className="w-5 h-5" style={{ color:"#475569" }} />
      </div>
      <div className="mx-6 rounded-2xl overflow-hidden" style={{ backgroundColor:"#334155" }}>
        {settingsItems.map((item,i) => {
          const Icon = item.icon;
          return (
            <div key={i}>
              <button className="w-full flex items-center gap-4 px-4 text-left" style={{ height:"64px" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor:"rgba(217,119,6,0.1)" }}>
                  <Icon className="w-5 h-5" style={{ color:"#d97706" }} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px]" style={{ color:"#f8fafc", fontWeight:500 }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color:"#64748b" }}>{item.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color:"#475569" }} />
              </button>
              {i < settingsItems.length - 1 && <div className="mx-4 h-px" style={{ backgroundColor:"rgba(226,232,240,0.08)" }} />}
            </div>
          );
        })}
      </div>
      <div className="mx-6 mt-6 rounded-2xl p-4" style={{ backgroundColor:"#334155" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px]" style={{ color:"#94a3b8" }}>App Version</span>
          <span className="text-[13px]" style={{ color:"#f8fafc", fontWeight:500 }}>2.1.0</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px]" style={{ color:"#94a3b8" }}>Dark Mode</span>
          <div className="w-11 h-6 rounded-full relative" style={{ backgroundColor:"#d97706" }}>
            <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5" />
          </div>
        </div>
      </div>
      <div className="mx-6 mt-4">
        <button onClick={() => navigate("login", "dissolve")} className="w-full py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2" style={{ backgroundColor:"rgba(220,38,38,0.1)", color:"#f87171", fontWeight:600, border:"1px solid rgba(220,38,38,0.2)" }}>
          <LogOut className="w-5 h-5" />Log Out
        </button>
      </div>
      <div className="mt-auto pb-10 flex justify-center">
        <p className="text-[11px]" style={{ color:"#475569" }}>© 2026 JalanGuard. All rights reserved.</p>
      </div>
    </div>
  );
}
