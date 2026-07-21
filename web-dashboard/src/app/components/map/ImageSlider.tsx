// 1. Imports
import { useState, useCallback, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { COLORS } from "../../../constants/theme";

// 2. Interfaces
interface ImageSliderProps {
  /** 1–5 image URLs. Renders nothing if empty. */
  images: string[];
  alt:    string;
}

// 3. Component
/**
 * CSS-only image carousel with a full-screen lightbox.
 *
 * WHY WE USE createPortal FOR THE LIGHTBOX:
 * The HazardCard parent has `transform: translate(-50%, -50%)` applied when
 * expanded. Any CSS transform on an ancestor creates a new containing block
 * for `position: fixed` descendants — meaning the "fixed" lightbox would be
 * sized and clipped relative to the card box, not the viewport.
 * Portalling to document.body ensures the lightbox truly covers the screen.
 */
export function ImageSlider({ images, alt }: ImageSliderProps) {
  const [current,       setCurrent      ] = useState(0);
  const [lightboxOpen,  setLightboxOpen ] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const N = images.length;

  // ── Carousel navigation ──────────────────────────────────────────────────

  const goPrev = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); setCurrent((i) => Math.max(0, i - 1)); },
    [],
  );

  const goNext = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); setCurrent((i) => Math.min(N - 1, i + 1)); },
    [N],
  );

  const goTo = useCallback(
    (i: number) => (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(i); },
    [],
  );

  // ── Lightbox open / close ────────────────────────────────────────────────

  const openLightbox = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLightboxIndex(current);
      setLightboxOpen(true);
    },
    [current],
  );

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const lightboxPrev = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIndex((i) => Math.max(0, i - 1)); },
    [],
  );

  const lightboxNext = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); setLightboxIndex((i) => Math.min(N - 1, i + 1)); },
    [N],
  );

  /** Escape key closes the lightbox. */
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox]);

  // ── Carousel track style ─────────────────────────────────────────────────

  const trackStyle = useMemo(() => ({
    width:     `${N * 100}%`,
    transform: N > 1 ? `translateX(calc(-${current} * 100% / ${N}))` : "none",
  }), [current, N]);

  if (N === 0) return null;

  const isMulti = N > 1;

  // ── Lightbox JSX (portalled to document.body) ────────────────────────────

  const lightbox = lightboxOpen
    ? createPortal(
        <div
          className="img-lightbox-backdrop"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Full-size image viewer"
        >
          {/* Close (×) button */}
          <button
            className="img-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close image viewer"
          >
            <X size={20} />
          </button>

          {/* Counter badge */}
          {isMulti && (
            <div className="img-lightbox-counter">
              {lightboxIndex + 1} / {N}
            </div>
          )}

          {/* The image — click on it doesn't close the lightbox */}
          <img
            src={images[lightboxIndex]}
            alt={`${alt} photo ${lightboxIndex + 1}`}
            className="img-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Prev / Next arrows for multi-image sets */}
          {isMulti && (
            <>
              <button
                className={`img-lightbox-nav img-lightbox-prev${lightboxIndex === 0 ? " is-disabled" : ""}`}
                onClick={lightboxPrev}
                disabled={lightboxIndex === 0}
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                className={`img-lightbox-nav img-lightbox-next${lightboxIndex === N - 1 ? " is-disabled" : ""}`}
                onClick={lightboxNext}
                disabled={lightboxIndex === N - 1}
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {/* ── Carousel ─────────────────────────────────────────────────────── */}
      <div className="img-slider" onMouseDown={(e) => e.stopPropagation()}>
        <div className="img-slider-track" style={trackStyle}>
          {images.map((url, i) => (
            <img
              key={url + i}
              src={url}
              alt={`${alt} photo ${i + 1}`}
              className="img-slider-img img-slider-img--clickable"
              loading="lazy"
              onClick={openLightbox}
              title="Click to view full size"
            />
          ))}
        </div>

        {/* Zoom hint badge */}
        <div className="img-slider-zoom-hint" onClick={openLightbox}>
          <ZoomIn size={11} />
          <span>View full size</span>
        </div>

        {/* Nav arrows */}
        {isMulti && current > 0 && (
          <button className="img-slider-btn img-slider-prev" onClick={goPrev} aria-label="Previous image">
            <ChevronLeft size={16} color={COLORS.white} />
          </button>
        )}
        {isMulti && current < N - 1 && (
          <button className="img-slider-btn img-slider-next" onClick={goNext} aria-label="Next image">
            <ChevronRight size={16} color={COLORS.white} />
          </button>
        )}

        {/* Counter + dots */}
        {isMulti && (
          <>
            <span className="img-slider-counter">{current + 1} / {N}</span>
            <div className="img-slider-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`img-slider-dot${i === current ? " active" : ""}`}
                  onClick={goTo(i)}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Lightbox (portalled outside transformed ancestors) ────────────── */}
      {lightbox}
    </>
  );
}
