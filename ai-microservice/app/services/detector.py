"""YOLO hazard detector.

Loads the trained `best.pt` weights once per process and turns an uploaded
photo into an aggregated :class:`DetectionResult`. The overlap-filtering logic
(custom cross-class NMS) is ported verbatim from the FYP evaluation script
(`scripts/ai-model/model-testing.py`) so the live service and the offline
evaluation agree box-for-box.

The model's six classes encode BOTH the hazard type and its severity, e.g.
`pothole-high`, `crack-low`. We split on the hyphen: the left half is the base
type, the right half is the severity level.
"""

# 1. Imports
import io
import logging
from functools import lru_cache
from threading import Lock

import numpy as np
from PIL import Image, ImageOps
from ultralytics import YOLO

from app.core.config import get_settings
from app.models.schemas import Detection, DetectionResult

logger = logging.getLogger(__name__)

# low=1, medium=2, high=3 — used to average multiple severities into one level.
_SEVERITY_ORDINAL = {"low": 1, "medium": 2, "high": 3}
_ORDINAL_SEVERITY = {1: "low", 2: "medium", 3: "high"}

# Inference is not guaranteed thread-safe; serialise calls to the shared model.
_INFER_LOCK = Lock()


# 2. Overlap detection — ported from scripts/ai-model/model-testing.py
def compute_iomin(box_a, box_b) -> float:
    """Intersection over Minimum area — catches a small box enclosed by a larger one."""
    x1 = max(box_a[0], box_b[0])
    y1 = max(box_a[1], box_b[1])
    x2 = min(box_a[2], box_b[2])
    y2 = min(box_a[3], box_b[3])

    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    if intersection == 0:
        return 0.0

    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    min_area = min(area_a, area_b)

    return intersection / min_area if min_area > 0 else 0.0


def apply_custom_nms(detections, iomin_threshold):
    """Filter redundant boxes, but keep overlapping boxes of *different* base type
    (e.g. a pothole sitting inside a crack)."""
    if not detections:
        return []

    detections = sorted(detections, key=lambda d: d["conf"], reverse=True)
    kept = []
    suppressed = set()

    for i, det_a in enumerate(detections):
        if i in suppressed:
            continue

        kept.append(det_a)
        box_a = [det_a["x1"], det_a["y1"], det_a["x2"], det_a["y2"]]
        base_type_a = det_a["label"].split("-")[0]

        for j, det_b in enumerate(detections):
            if j <= i or j in suppressed:
                continue

            box_b = [det_b["x1"], det_b["y1"], det_b["x2"], det_b["y2"]]
            base_type_b = det_b["label"].split("-")[0]

            if compute_iomin(box_a, box_b) >= iomin_threshold:
                # Exemption: never suppress a differing hazard type.
                if base_type_a != base_type_b:
                    continue
                suppressed.add(j)

    return kept


# 3. Model loader — lazy singleton
@lru_cache
def _load_model() -> YOLO:
    settings = get_settings()
    if not settings.model_exists:
        raise FileNotFoundError(
            f"YOLO weights not found at '{settings.model_path}'. "
            "Place best.pt in the ai-microservice/ folder or set MODEL_PATH."
        )
    logger.info("Loading YOLO model from %s", settings.model_path)
    return YOLO(settings.model_path)


def warm_up() -> bool:
    """Eagerly load the model at startup so the first request isn't slow.

    Returns True on success; logs and returns False if the model can't load
    (the service still starts so /health can report the misconfiguration)."""
    try:
        _load_model()
        return True
    except Exception:  # noqa: BLE001 — startup must not crash on a missing model
        logger.exception("Model warm-up failed")
        return False


# 4. Public API
def analyze_image(image_bytes: bytes) -> DetectionResult:
    """Run detection on raw image bytes and aggregate per the product rules.

    Raises ValueError if the bytes are not a decodable image.
    """
    try:
        pil = Image.open(io.BytesIO(image_bytes))
        # Respect EXIF orientation from phone cameras, then normalise to RGB.
        pil = ImageOps.exif_transpose(pil).convert("RGB")
    except Exception as exc:  # noqa: BLE001
        raise ValueError("Uploaded file is not a valid image.") from exc

    settings = get_settings()
    model = _load_model()
    image = np.asarray(pil)  # RGB HxWx3

    with _INFER_LOCK:
        results = model(image, conf=settings.conf_threshold, verbose=False)[0]

    raw = []
    for box in results.boxes:
        label = model.names[int(box.cls[0])]
        if "-" not in label:
            # Unexpected class naming; skip rather than guess type/severity.
            continue
        xyxy = box.xyxy[0]
        raw.append(
            {
                "x1": int(xyxy[0]), "y1": int(xyxy[1]),
                "x2": int(xyxy[2]), "y2": int(xyxy[3]),
                "conf": float(box.conf[0]),
                "label": label,
            }
        )

    kept = apply_custom_nms(raw, settings.iomin_threshold)
    return _aggregate(kept)


# 5. Aggregation
def _aggregate(kept: list[dict]) -> DetectionResult:
    """Turn surviving boxes into the report-ready result (types + mean severity)."""
    if not kept:
        return DetectionResult(
            detected=False,
            message="No road hazard detected. Retake the photo focusing on the defect.",
        )

    detections: list[Detection] = []
    for det in kept:
        base_type, _, level = det["label"].partition("-")
        severity = level if level in _SEVERITY_ORDINAL else "low"
        detections.append(
            Detection(
                type=base_type,
                severity=severity,
                confidence=round(det["conf"], 4),
                box=[det["x1"], det["y1"], det["x2"], det["y2"]],
            )
        )

    # Distinct base types, sorted for a stable ("crack", "pothole") ordering.
    defect_types = sorted({d.type for d in detections})

    # Mean severity across every box, rounded to the nearest level (ties round up
    # toward the more severe reading).
    ordinals = [_SEVERITY_ORDINAL[d.severity] for d in detections]
    mean_ordinal = sum(ordinals) / len(ordinals)
    severity = _ORDINAL_SEVERITY[int(mean_ordinal + 0.5)]

    # Primary type = single worst box (highest severity, then highest confidence)
    # — populates the legacy single-value defect_type column.
    worst = max(detections, key=lambda d: (_SEVERITY_ORDINAL[d.severity], d.confidence))

    mean_confidence = round(sum(d.confidence for d in detections) / len(detections), 4)

    if len(defect_types) > 1:
        summary = f"Detected {len(kept)} hazards: {' and '.join(defect_types)}."
    else:
        summary = f"Detected {defect_types[0]} ({severity} severity)."

    return DetectionResult(
        detected=True,
        defect_types=defect_types,
        primary_type=worst.type,
        severity=severity,
        confidence=mean_confidence,
        detection_count=len(detections),
        detections=detections,
        message=summary,
    )
