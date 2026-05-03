// 1. Imports
import { useState, useEffect } from "react";
import { supabase }    from "../lib/supabase";
import type { Session } from "../lib/supabase";
import { Navbar, type Page } from "./components/Navbar";
import { MapPage }     from "./components/MapPage";
import { DocsPage }    from "./components/DocsPage";
import { KeyPage }     from "./components/KeyPage";
import { LoginPage, RegisterPage } from "./components/AuthPages";
import { HeatmapTest } from "./components/HeatmapTest";

// 2. Component
/**
 * Root application shell.
 * Handles auth state and top-level page routing.
 * The map page fills the viewport minus the navbar — no fixed widths or outer padding.
 */
export default function App() {
  const [page,    setPage]    = useState<Page>("map");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (!sess && page === "key") setPage("login");
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigate = (p: Page) => {
    if (p === "key" && !session) { setPage("login"); return; }
    setPage(p);
  };

  return (
    <div style={styles.root}>
      <Navbar active={page} onNavigate={navigate} session={session} />

      {page === "map"      && <MapPage />}
      {page === "docs"     && <DocsPage />}
      {page === "key"      && <KeyPage onNavigate={navigate} session={session} />}
      {page === "login"    && <LoginPage onNavigate={navigate} />}
      {page === "register" && <RegisterPage onNavigate={navigate} />}
      {page === "test"     && <HeatmapTest />}
    </div>
  );
}

// 3. Styles
const styles = {
  root: {
    width:      "100%",
    minHeight:  "100vh",
    background: "#0B0F19",
    fontFamily: "Inter, system-ui, sans-serif",
    overflow:   "hidden",
  },
} as const;
