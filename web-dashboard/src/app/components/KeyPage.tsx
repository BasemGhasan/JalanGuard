// 1. Imports — External
import { useState, useCallback } from "react";
import { Copy, RefreshCw, User, Key, Shield, Check } from "lucide-react";

// 1. Imports — Local context / hooks / types / components
import { useAuth }       from "../../context/AuthContext";
import { LogoutModal }   from "./auth/LogoutModal";
import type { Page }     from "./Navbar";

// 2. Interfaces
interface KeyPageProps {
  onNavigate: (p: Page) => void;
}

// 3. Component
/**
 * Developer settings page showing account info and the Supabase JWT access token.
 *
 * Both logout buttons use the LogoutModal confirmation flow — supabase.auth.signOut()
 * is never called directly; it lives inside the modal's confirmed handler only.
 */
export function KeyPage({ onNavigate }: KeyPageProps) {
  const { session }                   = useAuth();
  const [copied, setCopied]           = useState(false);
  const [showLogout, setShowLogout]   = useState(false);

  const apiKey   = session?.access_token ?? "pk_live_*******************";
  const email    = session?.user?.email  ?? "developer@example.com";
  const initials = email.charAt(0).toUpperCase();

  // ── Logout modal handlers ──────────────────────────────────────────────
  const handleOpenLogout  = useCallback(() => setShowLogout(true),  []);
  const handleCloseLogout = useCallback(() => setShowLogout(false), []);

  const handleLoggedOut = useCallback(() => {
    setShowLogout(false);
    onNavigate("map");
  }, [onNavigate]);

  // ── Copy handler ───────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [apiKey]);

  return (
    <>
      <div className="px-8 py-16 flex flex-col items-center" style={{ minHeight: "calc(1024px - 64px)" }}>
        <div className="w-full max-w-[720px]">

          {/* Page header */}
          <div className="mb-10 text-center">
            <div
              className="inline-block px-3 py-1 rounded-full border mb-4"
              style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", background: "#1e293b", color: "#94a3b8", borderColor: "rgba(255,255,255,0.05)" }}
            >
              DASHBOARD
            </div>
            <h1 className="text-white mb-3" style={{ fontSize: "40px", fontWeight: 700, lineHeight: 1.1 }}>
              Developer Settings
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "16px" }}>
              Manage your account credentials and access keys.
            </p>
          </div>

          {/* Main card */}
          <div
            className="rounded-3xl p-10 border"
            style={{
              background:  "#1e293b",
              borderColor: "rgba(255,255,255,0.05)",
              boxShadow:   "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(217,119,6,0.05)",
            }}
          >
            {/* Top-right logout */}
            <div className="flex justify-end -mt-4 -mr-4 mb-2">
              <button
                onClick={handleOpenLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8" }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>

            {/* Section 1: Account */}
            <div className="pb-8 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4" style={{ color: "#d97706" }} />
                <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Account
                </span>
              </div>
              <div
                className="flex items-center justify-between rounded-xl p-4 border"
                style={{ background: "#0f172a", borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg, #d97706, #92400e)", fontWeight: 600 }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-white" style={{ fontSize: "14px" }}>Logged in as</div>
                    <div className="font-mono" style={{ color: "#94a3b8", fontSize: "13px" }}>{email}</div>
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full border"
                  style={{
                    background:   "rgba(16,185,129,0.10)",
                    color:        "#34d399",
                    borderColor:  "rgba(16,185,129,0.20)",
                    fontSize:     "12px",
                    fontWeight:   600,
                  }}
                >
                  {session?.user?.email_confirmed_at ? "Verified" : "Pending"}
                </span>
              </div>
            </div>

            {/* Section 2: API Key */}
            <div className="pt-8">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4" style={{ color: "#d97706" }} />
                <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Your Access Token
                </span>
              </div>

              <div
                className="flex items-center gap-3 rounded-xl border p-2 pl-5 mb-5"
                style={{ background: "#0f172a", borderColor: "rgba(255,255,255,0.05)" }}
              >
                <Key className="w-4 h-4 flex-shrink-0" style={{ color: "#94a3b8" }} />
                <input
                  readOnly
                  value={session ? apiKey : "pk_live_*******************"}
                  className="flex-1 bg-transparent text-white font-mono outline-none"
                  style={{ fontSize: "13px", letterSpacing: "0.03em" }}
                />
                <button
                  onClick={handleCopy}
                  disabled={!session}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                  style={{ background: "#1e293b", color: "#94a3b8" }}
                  title="Copy"
                >
                  {copied
                    ? <Check className="w-4 h-4" style={{ color: "#34d399" }} />
                    : <Copy className="w-4 h-4" />
                  }
                </button>
              </div>

              <div className="flex items-start gap-2 mb-6 px-1">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#94a3b8" }} />
                <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.5 }}>
                  This is your Supabase JWT access token. Use it as a Bearer token in API requests.
                  It expires periodically and will refresh automatically.
                </p>
              </div>

              {/* Bottom logout button */}
              <button
                onClick={handleOpenLogout}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-colors"
                style={{ borderColor: "#d97706", color: "#d97706", fontWeight: 600 }}
              >
                <RefreshCw className="w-4 h-4" />
                Sign Out &amp; Refresh Session
              </button>
            </div>
          </div>

          <div className="mt-6 text-center" style={{ fontSize: "13px", color: "#94a3b8" }}>
            Powered by{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#d97706" }}
            >
              Supabase Auth
            </a>
          </div>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showLogout && (
        <LogoutModal
          onClose={handleCloseLogout}
          onLoggedOut={handleLoggedOut}
        />
      )}
    </>
  );
}
