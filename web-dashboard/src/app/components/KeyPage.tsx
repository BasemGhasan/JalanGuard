import { useState } from "react";
import { Copy, RefreshCw, User, Key, Shield, LogOut, Check } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { Page } from "./Navbar";

export function KeyPage({
  onNavigate,
  session,
}: {
  onNavigate: (p: Page) => void;
  session?: Session | null;
}) {
  const [copied, setCopied] = useState(false);
  const apiKey = session?.access_token ?? "pk_live_*******************";
  const email = session?.user?.email ?? "developer@example.com";
  const initials = email.charAt(0).toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    onNavigate("login");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="px-8 py-16 flex flex-col items-center" style={{ minHeight: "calc(1024px - 64px)" }}>
      <div className="w-full max-w-[720px]">
        <div className="mb-10 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-[#1e293b] text-[#94a3b8] mb-4 border border-white/5" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em" }}>
            DASHBOARD
          </div>
          <h1 className="text-white mb-3" style={{ fontSize: "40px", fontWeight: 700, lineHeight: 1.1 }}>
            Developer Settings
          </h1>
          <p className="text-[#94a3b8]" style={{ fontSize: "16px" }}>
            Manage your account credentials and access keys.
          </p>
        </div>

        <div className="bg-[#1e293b] rounded-3xl p-10 border border-white/5 shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(217,119,6,0.05)]">
          <div className="flex justify-end -mt-4 -mr-4 mb-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>

          {/* Section 1: Account */}
          <div className="pb-8 border-b border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#d97706]" />
              <span className="text-[#94a3b8]" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Account
              </span>
            </div>
            <div className="flex items-center justify-between bg-[#0f172a] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d97706] to-[#92400e] flex items-center justify-center text-white" style={{ fontWeight: 600 }}>
                  {initials}
                </div>
                <div>
                  <div className="text-white" style={{ fontSize: "14px" }}>Logged in as</div>
                  <div className="text-[#94a3b8] font-mono" style={{ fontSize: "13px" }}>{email}</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20" style={{ fontSize: "12px", fontWeight: 600 }}>
                {session?.user?.email_confirmed_at ? "Verified" : "Pending"}
              </span>
            </div>
          </div>

          {/* Section 2: API Key (Supabase JWT) */}
          <div className="pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-[#d97706]" />
              <span className="text-[#94a3b8]" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Your Access Token
              </span>
            </div>

            <div className="flex items-center gap-3 bg-[#0f172a] rounded-xl border border-white/5 p-2 pl-5 mb-5 focus-within:border-[#d97706]/40 transition-colors">
              <Key className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
              <input
                readOnly
                value={session ? apiKey : "pk_live_*******************"}
                className="flex-1 bg-transparent text-white font-mono outline-none"
                style={{ fontSize: "13px", letterSpacing: "0.03em" }}
              />
              <button
                onClick={handleCopy}
                disabled={!session}
                className="w-10 h-10 rounded-lg bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center text-[#94a3b8] hover:text-white transition-colors disabled:opacity-40"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-start gap-2 mb-6 px-1">
              <Shield className="w-4 h-4 text-[#94a3b8] mt-0.5 flex-shrink-0" />
              <p className="text-[#94a3b8]" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                This is your Supabase JWT access token. Use it as a Bearer token in API requests. It expires periodically and will refresh automatically.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#d97706] text-[#d97706] hover:bg-[#d97706]/10 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <RefreshCw className="w-4 h-4" />
              Sign Out &amp; Refresh Session
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-[#94a3b8]" style={{ fontSize: "13px" }}>
          Powered by{" "}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#d97706] hover:underline">
            Supabase Auth
          </a>
        </div>
      </div>
    </div>
  );
}
