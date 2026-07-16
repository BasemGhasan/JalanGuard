/**
 * Client-side severity estimate — a deterministic *placeholder* for the YOLO
 * inference microservice that is planned but not yet built.
 *
 * It is intentionally transparent about being provisional: confidence is capped
 * low so the UI can label the result "preliminary" rather than pretending a
 * trained model produced it. When the real service lands, swap `estimateSeverity`
 * for a call to it — nothing else in the submission flow needs to change.
 */
import type { Severity } from '../types';

export interface SeverityEstimate {
  severity: Severity;
  /** 0–1. Deliberately modest to signal this is a heuristic, not a trained model. */
  confidence: number;
}

/** Rough per-type base risk; potholes read as more severe than hairline cracks. */
const TYPE_BASE: Record<string, number> = {
  pothole: 0.55,
  debris: 0.5,
  crack: 0.4,
};

/**
 * Estimates severity from the defect type and the captured photo's byte size
 * (a crude proxy for how much detail/area the defect occupies in frame).
 *
 * @param defectType e.g. "pothole" | "crack" | "debris"
 * @param imageBytes size of the captured JPEG in bytes (0 if unknown)
 */
export function estimateSeverity(defectType: string, imageBytes: number): SeverityEstimate {
  const base = TYPE_BASE[defectType.toLowerCase()] ?? 0.42;

  // Larger files ≈ more in-frame detail. Map ~0.3 MB→+0, ~2 MB→+~0.17.
  const megabytes = imageBytes / (1024 * 1024);
  const sizeBoost = Math.min(Math.max(megabytes - 0.3, 0) * 0.1, 0.17);

  const score = base + sizeBoost;

  const severity: Severity = score >= 0.6 ? 'high' : score >= 0.45 ? 'medium' : 'low';

  // Cap confidence low — this is a heuristic standing in for a real model.
  const confidence = Math.round(Math.min(score, 0.65) * 100) / 100;

  return { severity, confidence };
}
