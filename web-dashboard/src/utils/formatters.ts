/**
 * Shared date/text formatting helpers.
 * Pure functions — no React, no side effects.
 */

/**
 * Formats an ISO timestamp to "DD MMM YYYY" in Malaysian locale.
 * Single source of truth — previously duplicated in HazardTable and HazardCard.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}
