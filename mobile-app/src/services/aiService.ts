/**
 * Client for the JalanGuard AI detection microservice (see `ai-microservice/`).
 *
 * The submission flow calls {@link analyzeHazardPhoto} *before* anything is
 * written to the database: the photo must be verified by the YOLO model, and the
 * returned type(s) and severity are what get stored — the user cannot edit them.
 * No detection ⇒ the caller shows an error and submits nothing.
 */
import { AI_SERVICE_URL } from '../constants';
import type { AiDetectionResult, Severity } from '../types';

/** Raised for a "handled" detection outcome so the UI can show a specific message. */
export class AiDetectionError extends Error {
  /** True when the server was reachable but found no hazard (vs. a network/5xx failure). */
  readonly noHazard: boolean;
  constructor(message: string, noHazard = false) {
    super(message);
    this.name = 'AiDetectionError';
    this.noHazard = noHazard;
  }
}

/**
 * Abort the request if the model takes too long (cold start + inference).
 * The deployed service scales to zero when idle (Cloud Run free tier), so a
 * cold start alone can take 30-50s before inference even begins.
 */
const REQUEST_TIMEOUT_MS = 60_000;

/** Shape returned by the microservice (snake/loose) before we normalise it. */
interface RawResult {
  detected?: boolean;
  defect_types?: string[];
  primary_type?: string | null;
  severity?: Severity | null;
  confidence?: number | null;
  detection_count?: number;
  detections?: { type: string; severity: Severity; confidence: number; box: number[] }[];
  message?: string;
}

function normalise(raw: RawResult): AiDetectionResult {
  return {
    detected: Boolean(raw.detected),
    defectTypes: raw.defect_types ?? [],
    primaryType: raw.primary_type ?? null,
    severity: raw.severity ?? null,
    confidence: raw.confidence ?? null,
    detectionCount: raw.detection_count ?? 0,
    detections: (raw.detections ?? []).map((d) => ({
      type: d.type as 'crack' | 'pothole',
      severity: d.severity,
      confidence: d.confidence,
      box: d.box,
    })),
    message: raw.message ?? '',
  };
}

/**
 * Sends the captured photo to the detection service and returns a validated,
 * normalised result.
 *
 * @throws {AiDetectionError} when no hazard is detected (`noHazard: true`) or the
 *         service is unreachable / errors.
 */
export async function analyzeHazardPhoto(photoUri: string): Promise<AiDetectionResult> {
  const form = new FormData();
  // React Native FormData accepts a { uri, name, type } file descriptor.
  form.append('image', {
    uri: photoUri,
    name: 'hazard.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${AI_SERVICE_URL}/detect`, {
      method: 'POST',
      body: form,
      // Let RN set the multipart boundary; only declare that we accept JSON.
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    throw new AiDetectionError(
      aborted
        ? 'AI verification timed out. Check your internet connection and try again.'
        : 'Could not reach the AI service. Check your internet connection and try again.',
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (response.status === 503) {
      throw new AiDetectionError('The AI model is unavailable on the server right now.');
    }
    if (response.status === 400 || response.status === 415) {
      throw new AiDetectionError('That photo could not be processed. Retake it and try again.');
    }
    throw new AiDetectionError('AI verification failed. Please try again.');
  }

  const result = normalise((await response.json()) as RawResult);

  if (!result.detected || result.defectTypes.length === 0 || !result.severity) {
    throw new AiDetectionError(
      result.message || 'No road hazard detected in the photo. Retake it focusing on the defect.',
      true,
    );
  }

  return result;
}
