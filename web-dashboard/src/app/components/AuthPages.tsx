import { Mail, Lock, User, Shield } from "lucide-react";
import type { Page } from "./Navbar";

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center px-8 py-16" style={{ minHeight: "calc(1024px - 64px)" }}>
      {children}
    </div>
  );
}

function Field({ icon: Icon, label, type, placeholder }: { icon: typeof Mail; label: string; type: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-[#94a3b8] mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>{label}</label>
      <div className="flex items-center gap-3 bg-[#0f172a] rounded-xl border border-[#94a3b8]/20 px-4 py-3 focus-within:border-[#d97706]/60 transition-colors">
        <Icon className="w-4 h-4 text-[#94a3b8]" />
        <input
          type={type}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white outline-none placeholder:text-[#94a3b8]/60"
          style={{ fontSize: "15px" }}
        />
      </div>
    </div>
  );
}

export function LoginPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <AuthShell>
      <div
        className="w-[440px] bg-[#1e293b] rounded-2xl p-10 border border-white/5"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 80px rgba(217,119,6,0.08)" }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d97706] to-[#92400e] mb-5 shadow-[0_8px_24px_rgba(217,119,6,0.4)]">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div className="text-white mb-1" style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            JalanGuard
          </div>
          <h1 className="text-white" style={{ fontSize: "28px", fontWeight: 700 }}>Welcome Back</h1>
          <p className="text-[#94a3b8] mt-2" style={{ fontSize: "14px" }}>
            Sign in to access your developer dashboard.
          </p>
        </div>

        <div className="space-y-5 mb-6">
          <Field icon={Mail} label="Email Address" type="email" placeholder="developer@example.com" />
          <Field icon={Lock} label="Password" type="password" placeholder="••••••••••••" />
        </div>

        <div className="flex justify-end mb-6">
          <button className="text-[#94a3b8] hover:text-white" style={{ fontSize: "13px" }}>Forgot password?</button>
        </div>

        <button
          onClick={() => onNavigate("key")}
          className="w-full py-3.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white shadow-[0_8px_24px_rgba(217,119,6,0.3)] transition-all"
          style={{ fontWeight: 600, fontSize: "15px" }}
        >
          Login
        </button>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-[#94a3b8]" style={{ fontSize: "14px" }}>
          Don't have an account?{" "}
          <button onClick={() => onNavigate("register")} className="text-[#d97706] hover:underline" style={{ fontWeight: 600 }}>
            Register here
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

export function RegisterPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <AuthShell>
      <div
        className="w-[460px] bg-[#1e293b] rounded-2xl p-10 border border-white/5"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 80px rgba(217,119,6,0.08)" }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d97706] to-[#92400e] mb-5 shadow-[0_8px_24px_rgba(217,119,6,0.4)]">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-white" style={{ fontSize: "26px", fontWeight: 700 }}>Create Developer Account</h1>
          <p className="text-[#94a3b8] mt-2" style={{ fontSize: "14px" }}>
            Join the open-source road safety ecosystem.
          </p>
        </div>

        <div className="space-y-5 mb-6">
          <Field icon={User} label="Full Name" type="text" placeholder="Ada Lovelace" />
          <Field icon={Mail} label="Email Address" type="email" placeholder="developer@example.com" />
          <Field icon={Lock} label="Password" type="password" placeholder="At least 12 characters" />
        </div>

        <button
          onClick={() => onNavigate("key")}
          className="w-full py-3.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white shadow-[0_8px_24px_rgba(217,119,6,0.3)] transition-all mb-6"
          style={{ fontWeight: 600, fontSize: "15px" }}
        >
          Create Account
        </button>

        <p className="text-[#94a3b8] text-center" style={{ fontSize: "12px", lineHeight: 1.6 }}>
          By registering, you agree to follow our{" "}
          <span className="text-[#d97706] cursor-pointer hover:underline">Community Data Guidelines</span>.
        </p>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-[#94a3b8]" style={{ fontSize: "14px" }}>
          Already have an account?{" "}
          <button onClick={() => onNavigate("login")} className="text-[#d97706] hover:underline" style={{ fontWeight: 600 }}>
            Login here
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
