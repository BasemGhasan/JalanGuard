/**
 * Types for the citizen reporting flow, profile stats, community voting, and the
 * derived activity feed — all backed by the Supabase `hazards` and `hazard_votes`
 * tables (no mock data).
 */
import type { Hazard, Severity } from './map';

/** Payload the app inserts into `hazards` when a citizen submits a report. */
export interface NewHazardInput {
  defectType: string;
  severity: Severity;
  confidence: number | null;
  latitude: number;
  longitude: number;
  description: string | null;
  imageUrls: string[];
  reportedBy: string;
  reporterName: string | null;
}

/** Aggregate contribution stats shown on Profile/Home. */
export interface ReportStats {
  reports: number;
  votes: number;
  trustScore: number | null;
}

export type VoteKind = 'fixed' | 'broken';

export interface VoteSummary {
  fixed: number;
  broken: number;
}

/** One entry in the derived "recent activity" feed (built from real reports). */
export interface ActivityItem {
  id: string;
  kind: 'reported' | 'resolved' | 'in_review';
  title: string;
  subtitle: string;
  createdAt: string;
  hazard: Hazard;
}
