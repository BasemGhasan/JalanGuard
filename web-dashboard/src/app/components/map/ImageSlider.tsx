// 1. Imports
import { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS } from "../../../constants/theme";

// 2. Interfaces
interface ImageSliderProps {
  /** 1–5 image URLs. Renders nothing if empty. */
  images: string[];
  alt:    string;
}

// 3. Component
/**
 * CSS-only image carousel — no external library.
 *
 * Layout contract:
 *   - `.img-slider` wrapper: overflow:hidden, width from parent.
 *   - `.img-slider-track` inline width = N × 100%, so each panel is exactly
 *     1/N of the track = 100% of the slider container.
 *   - translateX moves by `current / N × 100%` of track = exactly one panel.
 *
 * Why not translateX(-current * 100%):
 *   CSS translateX percentages are relative to the element itself (the track),
 *   not its parent. With the track being N× wider, -100% would skip N panels
 *   at once. Dividing by N gives the correct per-panel translation.
 */
export function ImageSlider({ images, alt }: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const N = images.length;

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrent((i) => Math.max(0, i - 1));
    },
    [],
  );

  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrent((i) => Math.min(N - 1, i + 1));
    },
    [N],
  );

  const goTo = useCallback(
    (i: number) => (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrent(i);
    },
    [],
  );

  /**
   * Track must be N×100% wide so each image fills the slider container.
   * translateX moves exactly one slide = 100%/N of the track.
   */
  const trackStyle = useMemo(() => ({
    width:     `${N * 100}%`,
    transform: N > 1
      ? `translateX(calc(-${current} * 100% / ${N}))`
      : "none",
  }), [current, N]);

  if (N === 0) return null;

  const isMulti = N > 1;

  return (
    <div className="img-slider" onMouseDown={(e) => e.stopPropagation()}>
      {/* Sliding strip */}
      <div className="img-slider-track" style={trackStyle}>
        {images.map((url, i) => (
          <img
            key={url + i}
            src={url}
            alt={`${alt} photo ${i + 1}`}
            className="img-slider-img"
            loading="lazy"
          />
        ))}
      </div>

      {/* Nav arrows */}
      {isMulti && current > 0 && (
        <button
          className="img-slider-btn img-slider-prev"
          onClick={goPrev}
          aria-label="Previous image"
        >
          <ChevronLeft size={16} color={COLORS.white} />
        </button>
      )}
      {isMulti && current < N - 1 && (
        <button
          className="img-slider-btn img-slider-next"
          onClick={goNext}
          aria-label="Next image"
        >
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
  );
}
