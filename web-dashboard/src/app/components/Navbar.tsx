// 1. Imports — External
import { useState, useCallback } from "react";

// 1. Imports — Local context / hooks / constants / components
import { COLORS, FONT_SIZES } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { AppButton } from "./ui/appButton";
import { LogoutModal } from "./auth/LogoutModal";

// 2. Types
/** All navigable pages in the application. */
export type Page = "map" | "docs" | "key" | "auth" | "explorer";

// 2. Interfaces
interface NavbarProps {
  active: Page;
  onNavigate: (p: Page) => void;
}

// 3. Component
/**
 * Sticky top navigation bar.
 *
 * Logged-out state:
 *   • "Login" text link → navigates to the auth page.
 *   • "Get API Key" amber button → navigates to the auth page.
 *
 * Logged-in state:
 *   • "Logout" text link → opens the LogoutModal confirmation flow.
 *   • "My Dashboard" amber button → navigates to the key page (Profile Management).
 *
 * Logout is a two-step flow: clicking "Logout" only opens the modal.
 * supabase.auth.signOut() is called inside LogoutModal, only if the user
 * clicks the final "Log Out" button.
 */
export function Navbar({ active, onNavigate }: NavbarProps) {
  const { session } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const isLoggedIn = session !== null;

  // ── Navigation handlers ──────────────────────────────────────────────────
  const handleNavToMap = useCallback(() => onNavigate("map"), [onNavigate]);
  const handleNavToDocs = useCallback(() => onNavigate("docs"), [onNavigate]);
  const handleNavToExplorer = useCallback(() => onNavigate("explorer"), [onNavigate]);
  const handleNavToAuth = useCallback(() => onNavigate("auth"), [onNavigate]);

  // ── Logout modal handlers ────────────────────────────────────────────────
  const handleOpenLogout = useCallback(() => setShowLogout(true), []);
  const handleCloseLogout = useCallback(() => setShowLogout(false), []);

  /** After signOut resolves in the modal, return the user to the map. */
  const handleLoggedOut = useCallback(() => {
    setShowLogout(false);
    onNavigate("map");
  }, [onNavigate]);

  // ── My Dashboard navigation ──────────────────────────────────────────────
  const handleMyDashboard = useCallback(() => {
    onNavigate("key");
  }, [onNavigate]);

  // ── Derived: link style per page ─────────────────────────────────────────
  const linkStyle = useCallback(
    (p: Page) => ({
      ...styles.navLink,
      color: active === p ? COLORS.secondary : COLORS.textMuted,
      textDecoration: active === p ? "underline" : "none",
      textUnderlineOffset: active === p ? ("8px" as const) : undefined,
    }),
    [active],
  );

  return (
    <>
      <header style={styles.header}>
        <div style={styles.brandContainer}>
          {/* logo */}
          <img src="/assets/images/transparentCircledLogo.PNG" alt="JalanGuard Logo" style={styles.logo} />
          {/* Brand */}
          <button style={styles.brand} onClick={() => globalThis.location.reload()}>
            JalanGuard{" "}
            <span style={styles.brandSub}>Open Data</span>
          </button>
        </div>

        {/* Nav links */}
        <nav style={styles.nav}>
          <button style={linkStyle("map")} onClick={handleNavToMap}>
            Live Map
          </button>
          {/* Documentation covers the developer API — meaningless without an
              API key, so it's hidden until there's a session to view it with. */}
          {isLoggedIn && (
            <button style={linkStyle("docs")} onClick={handleNavToDocs}>
              Documentation
            </button>
          )}
          <button style={linkStyle("explorer")} onClick={handleNavToExplorer}>
            Data Explorer
          </button>

          {/* Auth state: Logout ↔ Login */}
          {isLoggedIn ? (
            <button style={styles.navLink} onClick={handleOpenLogout}>
              Logout
            </button>
          ) : (
            <button style={linkStyle("auth")} onClick={handleNavToAuth}>
              Login
            </button>
          )}

          {/* Auth state: My Dashboard ↔ Get API Key */}
          <AppButton
            variant="primary"
            style={styles.ctaBtn}
            onClick={isLoggedIn ? handleMyDashboard : handleNavToAuth}
          >
            {isLoggedIn ? "My Dashboard" : "Get API Key"}
          </AppButton>
        </nav>
      </header>

      {/* Logout confirmation modal — rendered outside the header flow */}
      {showLogout && (
        <LogoutModal
          onClose={handleCloseLogout}
          onLoggedOut={handleLoggedOut}
        />
      )}
    </>
  );
}

// 4. Styles
const styles = {
  header: {
    height: 64,
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${COLORS.surface}`,
    background: COLORS.background,
    position: "sticky" as const,
    top: 0,
    zIndex: 20,
  },
  brandContainer : {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brand: {
    background: "transparent",
    border: "none",
    color: COLORS.textPrimary,
    fontWeight: 700,
    fontSize: FONT_SIZES.lg + 2,
    cursor: "pointer",
    letterSpacing: "-0.02em",
    padding: 0,
  },
  brandSub: {
    color: COLORS.textMuted,
    fontWeight: 400,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  navLink: {
    background: "transparent",
    border: "none",
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm + 2,
    fontWeight: 500,
    cursor: "pointer",
    padding: 0,
    transition: "color 0.15s ease",
  },
  /** Overrides merged over the shared AppButton primary variant. */
  ctaBtn: {
    padding: "10px 20px",
  },
  logo: {
    height: 55,
    width: "auto",
  },
} as const;
