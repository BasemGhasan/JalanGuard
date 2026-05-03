/**
 * useDraggableCard — manages drag, snap-to-corner, and expand/collapse
 * state for the HazardCard overlay.
 *
 * Separation rationale: all interaction logic lives here so HazardCard
 * remains a pure UI component with no drag-event boilerplate.
 */

import { useState, useRef, useEffect, useCallback } from "react";

// 1. Types
export type CardCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface DragOffset {
  x: number;
  y: number;
}

export interface UseDraggableCardReturn {
  corner:      CardCorner;
  isExpanded:  boolean;
  isDragging:  boolean;
  cardRef:     React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onCardClick: () => void;
  onCollapse:  () => void;
}

// 2. Hook
/**
 * Why snap-to-corner: prevents the card from parking in the middle of the
 * map and obscuring hazard pins. Four fixed anchor positions keep the layout
 * predictable for users.
 *
 * @param initialCorner - Which corner the card starts in on first mount.
 */
export function useDraggableCard(
  initialCorner: CardCorner = "bottom-left",
): UseDraggableCardReturn {
  const [corner,     setCorner]     = useState<CardCorner>(initialCorner);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const cardRef    = useRef<HTMLDivElement | null>(null);
  const dragOffset = useRef<DragOffset>({ x: 0, y: 0 });
  /** True if the pointer moved enough to count as a drag (prevents expand-on-drag). */
  const dragMoved  = useRef(false);

  // ── Drag start ──────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (isExpanded) return;
    e.preventDefault();

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    dragMoved.current = false;
    setIsDragging(true);
  }, [isExpanded]);

  // ── Drag move / end (attached to window while dragging) ─────────────────
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent) => {
      dragMoved.current = true;
      const card = cardRef.current;
      if (!card) return;

      // Override CSS corner classes with live position during drag
      card.style.left      = `${e.clientX - dragOffset.current.x}px`;
      card.style.top       = `${e.clientY - dragOffset.current.y}px`;
      card.style.right     = "unset";
      card.style.bottom    = "unset";
      card.style.transform = "none";
    };

    const handleUp = () => {
      setIsDragging(false);

      const card      = cardRef.current;
      const container = card?.parentElement;
      if (!card || !container) return;

      if (dragMoved.current) {
        const cr = card.getBoundingClientRect();
        const pr = container.getBoundingClientRect();

        // Snap to whichever corner the card centre is closest to
        const cardCX = cr.left + cr.width  / 2;
        const cardCY = cr.top  + cr.height / 2;
        const conCX  = pr.left + pr.width  / 2;
        const conCY  = pr.top  + pr.height / 2;

        const isLeft = cardCX < conCX;
        const isTop  = cardCY < conCY;

        const snapped: CardCorner =
          isTop  && isLeft  ? "top-left"    :
          isTop  && !isLeft ? "top-right"   :
          !isTop && isLeft  ? "bottom-left" : "bottom-right";

        setCorner(snapped);
      }

      // Clear inline position — CSS corner class takes over
      card.style.left      = "";
      card.style.top       = "";
      card.style.right     = "";
      card.style.bottom    = "";
      card.style.transform = "";
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup",   handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup",   handleUp);
    };
  }, [isDragging]);

  // ── Expand / collapse ────────────────────────────────────────────────────
  const onCardClick = useCallback(() => {
    /** Ignore if the pointer moved — user was dragging, not clicking. */
    if (dragMoved.current) return;
    if (!isExpanded) setIsExpanded(true);
  }, [isExpanded]);

  const onCollapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  return {
    corner,
    isExpanded,
    isDragging,
    cardRef,
    onMouseDown,
    onCardClick,
    onCollapse,
  };
}
