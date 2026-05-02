import { useState, useEffect } from "react";
import { Mail, Lock, User, Shield, Eye, EyeOff, ChevronRight } from "lucide-react";

type Screen = "splash" | "signup" | "login" | "home";

export function AuthFlow() {
  const [activeScreen, setActiveScreen] = useState<Screen>("splash");
  const [splashDone, setSplashDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Splash auto-transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashDone(true);
      setActiveScreen("signup");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex gap-8 items-start">
      {/* Splash Screen */}
      <PhoneFrame label="Splash Screen" active={activeScreen === "splash"}>
        <SplashScreen splashDone={splashDone} />
      </PhoneFrame>

      {/* Sign Up Screen */}
      <PhoneFrame label="Sign Up" active={activeScreen === "signup"}>
        <SignUpScreen
          onCreateAccount={() => setActiveScreen("home")}
          onGoToLogin={() => setActiveScreen("login")}
          showPassword={showPassword}
          togglePassword={() => setShowPassword(!showPassword)}
        />
      </PhoneFrame>

      {/* Login Screen */}
      <PhoneFrame label="Login" active={activeScreen === "login"}>
        <LoginScreen
          onLogin={() => setActiveScreen("home")}
          onGoToSignUp={() => setActiveScreen("signup")}
          showPassword={showPassword}
          togglePassword={() => setShowPassword(!showPassword)}
        />
      </PhoneFrame>
    </div>
  );
}

/* ─── Phone Frame ─── */
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
        className="flex-shrink-0 relative overflow-hidden"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "44px",
          backgroundColor: "#0f172a",
          boxShadow: active
            ? "0 0 0 2px #d97706, 0 25px 60px rgba(0,0,0,0.4)"
            : "0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 pt-4">
          <span className="text-[12px] text-white/60" style={{ fontWeight: 600 }}>
            9:41
          </span>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5 items-end">
              {[3, 5, 7, 9].map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-sm"
                  style={{ height: `${h}px`, backgroundColor: "rgba(255,255,255,0.5)" }}
                />
              ))}
            </div>
            <svg width="15" height="10" viewBox="0 0 15 10" fill="none" className="ml-1">
              <path d="M1 8C3.5 3 7 1 14 1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="ml-1 w-6 h-3 rounded-sm border border-white/40 relative">
              <div
                className="absolute inset-0.5 rounded-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.4)", width: "70%" }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30">
          <div
            className="rounded-full"
            style={{ width: "126px", height: "34px", backgroundColor: "#000" }}
          />
        </div>

        {children}
      </div>
    </div>
  );
}

/* ─── JalanGuard Logo ─── */
function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? 80 : size === "md" ? 56 : 40;
  const iconSize = size === "lg" ? 40 : size === "md" ? 28 : 20;
  const textSize = size === "lg" ? "28px" : size === "md" ? "22px" : "16px";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="rounded-2xl flex items-center justify-center"
        style={{
          width: `${dims}px`,
          height: `${dims}px`,
          background: "linear-gradient(135deg, #d97706, #f59e0b)",
          boxShadow: "0 8px 24px rgba(217,119,6,0.3)",
        }}
      >
        <Shield style={{ width: iconSize, height: iconSize, color: "#fff" }} />
      </div>
      <span
        style={{
          fontSize: textSize,
          color: "#f8fafc",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        JalanGuard
      </span>
    </div>
  );
}

/* ─── Input Field ─── */
function InputField({
  icon,
  placeholder,
  type = "text",
  showToggle,
  onToggle,
  isVisible,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  showToggle?: boolean;
  onToggle?: () => void;
  isVisible?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 rounded-2xl"
      style={{
        backgroundColor: "#334155",
        height: "56px",
      }}
    >
      <div style={{ color: "#94a3b8" }}>{icon}</div>
      <input
        type={showToggle ? (isVisible ? "text" : "password") : type}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-[15px]"
        style={{ color: "#f8fafc", fontWeight: 400 }}
      />
      {showToggle && (
        <button onClick={onToggle} className="p-1" style={{ color: "#94a3b8" }}>
          {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}

/* ─── Google Button ─── */
function GoogleButton() {
  return (
    <button
      className="w-full flex items-center justify-center gap-3 rounded-2xl"
      style={{
        height: "56px",
        backgroundColor: "#334155",
        color: "#f8fafc",
        fontSize: "15px",
        fontWeight: 500,
      }}
    >
      {/* Google "G" */}
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      Continue with Google
    </button>
  );
}

/* ─── Splash Screen ─── */
function SplashScreen({ splashDone }: { splashDone: boolean }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{ backgroundColor: "#0f172a" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute"
        style={{
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="relative z-10">
        <Logo size="lg" />
      </div>

      {/* Tagline */}
      <p
        className="mt-4 text-[13px] tracking-wide"
        style={{ color: "#94a3b8", fontWeight: 400 }}
      >
        AI-Powered Road Safety
      </p>

      {/* Loading indicator */}
      <div className="mt-12 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "#d97706",
              opacity: splashDone ? 1 : 0.3,
              animation: splashDone ? "none" : `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>

      {/* Bottom */}
      <div className="absolute bottom-12 flex flex-col items-center">
        <p className="text-[11px]" style={{ color: "#475569" }}>
          Safer roads, together.
        </p>
      </div>
    </div>
  );
}

/* ─── Sign Up Screen ─── */
function SignUpScreen({
  onCreateAccount,
  onGoToLogin,
  showPassword,
  togglePassword,
}: {
  onCreateAccount: () => void;
  onGoToLogin: () => void;
  showPassword: boolean;
  togglePassword: () => void;
}) {
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="flex-1 flex flex-col px-6 pt-20">
        {/* Logo */}
        <div className="flex justify-center mb-8 mt-4">
          <Logo size="sm" />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1
            className="text-[26px] text-center mb-2"
            style={{ color: "#f8fafc", fontWeight: 700 }}
          >
            Create an Account
          </h1>
          <p
            className="text-[14px] text-center"
            style={{ color: "#94a3b8" }}
          >
            Join the community and help make roads safer
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 mb-6">
          <InputField
            icon={<User className="w-5 h-5" />}
            placeholder="Full Name"
          />
          <InputField
            icon={<Mail className="w-5 h-5" />}
            placeholder="Email Address"
            type="email"
          />
          <InputField
            icon={<Lock className="w-5 h-5" />}
            placeholder="Password"
            type="password"
            showToggle
            onToggle={togglePassword}
            isVisible={showPassword}
          />
        </div>

        {/* CTA */}
        <button
          onClick={onCreateAccount}
          className="w-full rounded-2xl flex items-center justify-center gap-2"
          style={{
            height: "56px",
            backgroundColor: "#d97706",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(217,119,6,0.3)",
          }}
        >
          Create Account
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: "#334155" }} />
          <span className="text-[12px]" style={{ color: "#64748b" }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#334155" }} />
        </div>

        {/* Google */}
        <GoogleButton />
      </div>

      {/* Footer */}
      <div className="pb-12 pt-6 flex justify-center">
        <p className="text-[14px]" style={{ color: "#94a3b8" }}>
          Already have an account?{" "}
          <button
            onClick={onGoToLogin}
            className="underline"
            style={{ color: "#d97706", fontWeight: 600 }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─── Login Screen ─── */
function LoginScreen({
  onLogin,
  onGoToSignUp,
  showPassword,
  togglePassword,
}: {
  onLogin: () => void;
  onGoToSignUp: () => void;
  showPassword: boolean;
  togglePassword: () => void;
}) {
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="flex-1 flex flex-col px-6 pt-20">
        {/* Logo */}
        <div className="flex justify-center mb-8 mt-4">
          <Logo size="sm" />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1
            className="text-[26px] text-center mb-2"
            style={{ color: "#f8fafc", fontWeight: 700 }}
          >
            Welcome Back
          </h1>
          <p
            className="text-[14px] text-center"
            style={{ color: "#94a3b8" }}
          >
            Login to continue reporting hazards
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 mb-2">
          <InputField
            icon={<Mail className="w-5 h-5" />}
            placeholder="Email Address"
            type="email"
          />
          <InputField
            icon={<Lock className="w-5 h-5" />}
            placeholder="Password"
            type="password"
            showToggle
            onToggle={togglePassword}
            isVisible={showPassword}
          />
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end mb-6">
          <button
            className="text-[13px]"
            style={{ color: "#e2e8f0", fontWeight: 500 }}
          >
            Forgot Password?
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={onLogin}
          className="w-full rounded-2xl flex items-center justify-center gap-2"
          style={{
            height: "56px",
            backgroundColor: "#d97706",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(217,119,6,0.3)",
          }}
        >
          Login
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: "#334155" }} />
          <span className="text-[12px]" style={{ color: "#64748b" }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#334155" }} />
        </div>

        {/* Google */}
        <GoogleButton />
      </div>

      {/* Footer */}
      <div className="pb-12 pt-6 flex justify-center">
        <p className="text-[14px]" style={{ color: "#94a3b8" }}>
          Don't have an account?{" "}
          <button
            onClick={onGoToSignUp}
            className="underline"
            style={{ color: "#d97706", fontWeight: 600 }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
