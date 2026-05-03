// 1. Imports
import { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS } from "../../../constants/theme";

// 2. Interfaces
interface ImageSliderProps {
  /** 1–5 image URLs. If empty the component renders nothing. */
  images: string[];
  alt:    string;
}

// 3. Component
/**
 * Lightweight image carousel for hazard report photos.
 *
 * Why not an external library: the slider has only two behaviours
 * (prev/next click, dot jump) — a library would add more bundle weight
 * than the logic itself. CSS translateX does all the animation work.
 */
export function ImageSlider({ images, alt }: ImageSliderProps) {
  const [current, setCurrent] = useState(0);

  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(images.length - 1, i)),
    [images.length],
  );

  const goPrev = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); setCurrent((i) => clamp(i - 1)); },
    [clamp],
  );
  const goNext = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); setCurrent((i) => clamp(i + 1)); },
    [clamp],
  );
  const goTo = useCallback(
    (i: number) => (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(i); },
    [],
  );

  const trackStyle = useMemo(
    () => ({ transform: `translateX(-${current * 100}%)` }),
    [current],
  );

  const isMulti = images.length > 1;

  if (images.length === 0) return null;

  return (
    <div className="img-slider">
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

      {/* Prev / next arrows — only when multiple images */}
      {isMulti && current > 0 && (
        <button
          className="img-slider-btn img-slider-prev"
          onClick={goPrev}
          aria-label="Previous image"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ChevronLeft size={16} color={COLORS.white} />
        </button>
      )}
      {isMulti && current < images.length - 1 && (
        <button
          className="img-slider-btn img-slider-next"
          onClick={goNext}
          aria-label="Next image"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ChevronRight size={16} color={COLORS.white} />
        </button>
      )}

      {/* Counter badge + dot indicators */}
      {isMulti && (
        <>
          <span className="img-slider-counter">
            {current + 1} / {images.length}
          </span>
          <div className="img-slider-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`img-slider-dot${i === current ? " active" : ""}`}
                onClick={goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                onMouseDown={(e) => e.stopPropagation()}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
