/**
 * Shared hazard defect-type helpers.
 * Single source of truth — was previously re-implemented ad hoc in
 * HazardCard, PinsLayer, HazardTable and exportUtils.
 */
import type { Hazard } from "../types/map";

/**
 * All AI-detected defect types for a hazard (e.g. ["crack", "pothole"]).
 * Falls back to `[defect_type]` for legacy rows where `defect_types` is empty/null.
 */
export function getDefectTypes(hazard: Pick<Hazard, "defect_type" | "defect_types">): string[] {
  return hazard.defect_types && hazard.defect_types.length > 0
    ? hazard.defect_types
    : [hazard.defect_type];
}

/** "pot_hole" → "pot hole". */
export function formatDefectType(type: string): string {
  return type.replace(/_/g, " ");
}

/** All defect types, formatted and joined, e.g. "crack + pothole". */
export function formatDefectTypes(hazard: Pick<Hazard, "defect_type" | "defect_types">): string {
  return getDefectTypes(hazard).map(formatDefectType).join(" + ");
}
