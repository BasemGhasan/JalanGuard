import { useState } from "react";
import { Navbar, type Page } from "./components/Navbar";
import { MapPage } from "./components/MapPage";
import { DocsPage } from "./components/DocsPage";
import { KeyPage } from "./components/KeyPage";
import { LoginPage, RegisterPage } from "./components/AuthPages";

export default function App() {
  const [page, setPage] = useState<Page>("map");

  return (
    <div className="min-h-screen w-full bg-[#0b0f19]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="mx-auto" style={{ width: "1440px", minHeight: "1024px" }}>
        <Navbar active={page} onNavigate={setPage} />
        {page === "map" && <MapPage />}
        {page === "docs" && <DocsPage />}
        {page === "key" && <KeyPage onNavigate={setPage} />}
        {page === "login" && <LoginPage onNavigate={setPage} />}
        {page === "register" && <RegisterPage onNavigate={setPage} />}
      </div>
    </div>
  );
}
