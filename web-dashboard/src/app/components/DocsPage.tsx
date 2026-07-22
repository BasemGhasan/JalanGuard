// 1. Imports — External
import { useMemo } from "react";
import { ExternalLink, BookOpen } from "lucide-react";

// 1. Imports — Local constants
import { COLORS, SPACING, FONT_SIZES } from "../../constants/theme";

// 2. Config
/**
 * Base URL of the FastAPI backend. The auto-generated Swagger UI is served at
 * `${base}/docs`. Configurable via VITE_API_BASE_URL so staging/production can
 * point at their own deployment; falls back to the local dev server.
 */
const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "http://localhost:8000";

const DOCS_URL = `${API_BASE_URL}/docs`;

// 3. Component
/**
 * API Reference page.
 *
 * Thin presentation shell: embeds the FastAPI-generated, always-up-to-date
 * Swagger UI in an iframe. No hand-maintained request/response examples — the
 * documentation is generated from the backend's OpenAPI schema.
 */
export function DocsPage() {
  const iframeSrc = useMemo(() => DOCS_URL, []);

  return (
    <div style={styles.page} className="jg-page-shell">
      {/* ── Header bar ─────────────────────────────────────────────── */}
      <div style={styles.header} className="jg-docs-header">
        <div style={styles.titleWrap}>
          <BookOpen size={18} color={COLORS.secondary} />
          <div>
            <h1 style={styles.title} className="jg-docs-title">API Reference</h1>
            <p style={styles.subtitle}>
              Live Swagger documentation generated from the JalanGuard Open Data API.
            </p>
          </div>
        </div>

        <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" style={styles.openBtn} className="jg-docs-openbtn">
          Open in new tab
          <ExternalLink size={14} />
        </a>
      </div>

      {/* ── Embedded Swagger UI ────────────────────────────────────── */}
      <div style={styles.frameWrap}>
        <iframe
          src={iframeSrc}
          title="JalanGuard API — Swagger UI"
          style={styles.iframe}
        />
        <noscript>
          <a href={DOCS_URL}>Open the API documentation</a>
        </noscript>
      </div>

      {/* Fallback hint if the backend is not reachable */}
      <p style={styles.hint} className="jg-docs-hint">
        Not loading? Ensure the API is running at{" "}
        <code style={styles.code}>{API_BASE_URL}</code>, or open the docs directly
        using the button above.
      </p>
    </div>
  );
}

// 4. Styles — all values from COLORS / SPACING / FONT_SIZES
const styles = {
  page: {
    minHeight:     "calc(100vh - 64px)",
    display:       "flex",
    flexDirection: "column" as const,
    background:    COLORS.background,
  },
  header: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    gap:            SPACING.md,
    padding:        `${SPACING.lg}px ${SPACING.xl}px`,
    borderBottom:   `1px solid ${COLORS.surface}`,
  },
  titleWrap: {
    display:    "flex",
    alignItems: "flex-start",
    gap:        SPACING.sm + 4,
  },
  title: {
    color:      COLORS.textPrimary,
    fontSize:   FONT_SIZES.xl,
    fontWeight: 700,
    margin:     0,
    lineHeight: 1.2,
  },
  subtitle: {
    color:    COLORS.textMuted,
    fontSize: FONT_SIZES.sm + 1,
    margin:   `${SPACING.xs}px 0 0`,
  },
  openBtn: {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            SPACING.xs + 2,
    padding:        `${SPACING.sm}px ${SPACING.md}px`,
    borderRadius:   10,
    background:     COLORS.surface,
    border:         `1px solid ${COLORS.borderSoft}`,
    color:          COLORS.textPrimary,
    fontSize:       FONT_SIZES.sm + 1,
    fontWeight:     600,
    textDecoration: "none",
    flexShrink:     0,
    whiteSpace:     "nowrap" as const,
  },
  frameWrap: {
    flex:       1,
    minHeight:  0,
    background: COLORS.white,
  },
  iframe: {
    width:   "100%",
    height:  "100%",
    minHeight: "calc(100vh - 220px)",
    border:  "none",
    display: "block",
  },
  hint: {
    color:      COLORS.textMuted,
    fontSize:   FONT_SIZES.sm,
    textAlign:  "center" as const,
    padding:    `${SPACING.sm}px ${SPACING.xl}px ${SPACING.md}px`,
    margin:     0,
  },
  code: {
    fontFamily:   "monospace",
    fontSize:     FONT_SIZES.sm,
    color:        COLORS.textPrimary,
    background:   COLORS.surface,
    padding:      "2px 6px",
    borderRadius: 6,
  },
} as const;
