import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Session } from "../lib/supabase";
import { Navbar, type Page } from "./components/Navbar";
import { MapPage } from "./components/MapPage";
import { DocsPage } from "./components/DocsPage";
import { KeyPage } from "./components/KeyPage";
import { LoginPage, RegisterPage } from "./components/AuthPages";

export default function App() {
  const [page, setPage] = useState<Page>("map");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && (page === "key")) {
        setPage("login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function navigate(p: Page) {
    if ((p === "key") && !session) {
      setPage("login");
      return;
    }
    setPage(p);
  }

  return (
    <div className="min-h-screen w-full bg-[#0b0f19]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="mx-auto" style={{ width: "1440px", minHeight: "1024px" }}>
        <Navbar active={page} onNavigate={navigate} session={session} />
        {page === "map" && <MapPage />}
        {page === "docs" && <DocsPage />}
        {page === "key" && <KeyPage onNavigate={navigate} session={session} />}
        {page === "login" && <LoginPage onNavigate={navigate} />}
        {page === "register" && <RegisterPage onNavigate={navigate} />}
      </div>
    </div>
  );
}
