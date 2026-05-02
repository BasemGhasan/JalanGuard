import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export type Page = "map" | "docs" | "key" | "login" | "register" | "test";

export function Navbar({
  active,
  onNavigate,
  session,
}: {
  active: Page;
  onNavigate: (p: Page) => void;
  session?: Session | null;
}) {
  const linkClass = (p: Page) =>
    active === p
      ? "text-[#d97706] underline underline-offset-8 decoration-2"
      : "text-[#94a3b8] hover:text-white transition-colors";

  async function handleLogout() {
    await supabase.auth.signOut();
    onNavigate("login");
  }

  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-[#1e293b] bg-[#0b0f19] sticky top-0 z-20">
      <button onClick={() => onNavigate("map")} className="text-white tracking-tight" style={{ fontWeight: 700, fontSize: "20px" }}>
        JalanGuard <span className="text-[#94a3b8]" style={{ fontWeight: 400 }}>Open Data</span>
      </button>
      <nav className="flex items-center gap-8">
        <button onClick={() => onNavigate("map")} className={linkClass("map")}>Live Map</button>
        <button onClick={() => onNavigate("docs")} className={linkClass("docs")}>Documentation</button>
        <button onClick={() => onNavigate("test")} className={linkClass("test")}>DB Test</button>
        {session ? (
          <button onClick={handleLogout} className="text-[#94a3b8] hover:text-white transition-colors">
            Logout
          </button>
        ) : (
          <button onClick={() => onNavigate("login")} className={linkClass("login")}>Login</button>
        )}
        <button
          onClick={() => onNavigate("key")}
          className={`px-5 py-2.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white shadow-[0_0_20px_rgba(217,119,6,0.35)] transition-all ${
            active === "key" ? "ring-2 ring-[#fbbf24] ring-offset-2 ring-offset-[#0b0f19]" : ""
          }`}
        >
          {session ? "Dashboard" : "Get API Key"}
        </button>
      </nav>
    </header>
  );
}
