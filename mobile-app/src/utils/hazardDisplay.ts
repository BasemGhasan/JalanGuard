/**
 * Presentation helpers shared by every hazard-showing screen (History, Home,
 * Hazard Detail, Notifications) so labels, colours and formatting stay
 * consistent instead of being re-derived ad hoc per screen.
 */
import type { BadgeTone } from '../styles/components';
import type { Hazard, Severity } from '../types';

/**
 * All AI-detected defect types for a hazard (e.g. ["crack", "pothole"]).
 * Falls back to `[defect_type]` for legacy rows where `defect_types` is empty/null.
 */
export function getDefectTypes(hazard: Pick<Hazard, 'defect_type' | 'defect_types'>): string[] {
  return hazard.defect_types && hazard.defect_types.length > 0
    ? hazard.defect_types
    : [hazard.defect_type];
}

/** "pot_hole" → "Pot Hole". */
export function prettyDefectType(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** All defect types, formatted and joined, e.g. "Crack + Pothole". */
export function prettyDefectTypes(hazard: Pick<Hazard, 'defect_type' | 'defect_types'>): string {
  return getDefectTypes(hazard).map(prettyDefectType).join(' + ');
}

/** Badge colour for a severity level. */
export function severityTone(severity: Severity): BadgeTone {
  return severity === 'high' ? 'danger' : severity === 'medium' ? 'warning' : 'success';
}

/** Badge colour for a hazard lifecycle status. */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case 'resolved':
    case 'fixed':
      return 'success';
    case 'active':
      return 'warning';
    default:
      return 'neutral';
  }
}

/** Compact "12 Jul 2026" formatting for created_at timestamps. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
