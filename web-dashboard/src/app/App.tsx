// 1. Imports — External
import { useState, useCallback, useEffect } from "react";
import { Toaster }                          from "sonner";

// 1. Imports — Local context / hooks
import { AuthProvider, useAuth } from "../context/AuthContext";

// 1. Imports — Components
import { Navbar }      from "./components/Navbar";
import type { Page }   from "./components/Navbar";
import { MapPage }     from "./components/MapPage";
import { DocsPage }    from "./components/DocsPage";
import { KeyPage }     from "./components/KeyPage";
import { AuthPage }    from "./components/auth/AuthPage";
import { HeatmapTest } from "./components/HeatmapTest";

// 1. Imports — Constants
import { COLORS } from "../constants/theme";

// 2. Inner shell — must live inside AuthProvider to call useAuth()
/**
 * AppInner owns the page routing state.
 * It reads session from AuthContext (no prop-drilling) and automatically
 * redirects to the auth page when a protected route is accessed while
 * the session is null or expires mid-session.
 */
function AppInner() {
  const { session } = useAuth();
  const [page, setPage] = useState<Page>("map");

  // Redirect away from protected pages when the session is lost
  useEffect(() => {
    if (!session && page === "key") setPage("auth");
  }, [session, page]);

  /** Central navigation handler — guards the "key" route. */
  const navigate = useCallback(
    (p: Page) => {
      if (p === "key" && !session) { setPage("auth"); return; }
      setPage(p);
    },
    [session],
  );

  return (
    <div style={styles.root}>
      <Navbar active={page} onNavigate={navigate} />

      {page === "map"  && <MapPage />}
      {page === "docs" && <DocsPage />}
      {page === "key"  && <KeyPage  onNavigate={navigate} />}
      {page === "auth" && <AuthPage onNavigate={navigate} />}
      {page === "test" && <HeatmapTest />}

      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: COLORS.surface,
            border:     `1px solid ${COLORS.borderSoft}`,
            color:      COLORS.textPrimary,
          },
        }}
      />
    </div>
  );
}

// 3. Root App — wraps the whole tree in the auth provider
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

// 4. Styles
const styles = {
  root: {
    width:      "100%",
    minHeight:  "100vh",
    background: COLORS.background,
    fontFamily: "Inter, system-ui, sans-serif",
    overflow:   "hidden",
  },
} as const;
