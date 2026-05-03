/**
 * useDraggableCard — smooth drag, snap-to-corner, and expand/collapse.
 *
 * Performance strategy:
 *  - Only 2 React state values: `corner` (for data attr) and `isExpanded`.
 *  - `dragging` is a plain ref — zero React re-renders during a drag.
 *  - All positioning uses `transform: translate(x, y)` from a fixed
 *    `top:0; left:0` base — GPU-composited, never triggers layout reflow.
 *  - A single persistent window listener replaces the per-drag effect.
 *  - `is-dragging` class is applied via direct classList mutation.
 */

import { useState, useRef, useEffect, useCallback } from "react";

// 1. Types ─────────────────────────────────────────────────────────────────

export type CardCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface UseDraggableCardReturn {
  corner:      CardCorner;
  isExpanded:  boolean;
  cardRef:     React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onCardClick: () => void;
  onCollapse:  () => void;
}

// 2. Helpers ───────────────────────────────────────────────────────────────

const GAP = 16; // px gap from map edge

/**
 * Compute translate(x, y) values that place the card at the given corner.
 * All arithmetic — no DOM reflow.
 */
function cornerXY(
  c:     CardCorner,
  cardW: number, cardH: number,
  conW:  number, conH:  number,
): [number, number] {
  switch (c) {
    case "top-left":     return [GAP,             GAP            ];
    case "top-right":    return [conW - cardW - GAP, GAP            ];
    case "bottom-left":  return [GAP,             conH - cardH - GAP];
    case "bottom-right": return [conW - cardW - GAP, conH - cardH - GAP];
  }
}

// 3. Hook ──────────────────────────────────────────────────────────────────

export function useDraggableCard(
  initial: CardCorner = "bottom-left",
): UseDraggableCardReturn {
  const [corner,     setCorner]     = useState<CardCorner>(initial);
  const [isExpanded, setIsExpanded] = useState(false);

  const cardRef    = useRef<HTMLDivElement | null>(null);
  const dragging   = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const moved      = useRef(false);
  /** Current translate values — used to find nearest corner on mouseup. */
  const pos        = useRef({ x: 0, y: 0 });

  // ── Position helpers ────────────────────────────────────────────────────

  /** Apply corner via transform — never touches top/left/right/bottom. */
  const snapToCorner = useCallback((c: CardCorner, animate: boolean) => {
    const card = cardRef.current;
    const con  = card?.parentElement;
    if (!card || !con) return;

    const [x, y] = cornerXY(
      c,
      card.offsetWidth, card.offsetHeight,
      con.offsetWidth,  con.offsetHeight,
    );
    pos.current = { x, y };
    card.style.transition = animate ? "transform 0.22s ease-out" : "none";
    card.style.transform  = `translate(${x}px, ${y}px)`;
  }, []);

  // ── Initialise on mount ─────────────────────────────────────────────────

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    /* Fix the base position so transform is the only positional axis. */
    card.style.position = "absolute";
    card.style.top      = "0";
    card.style.left     = "0";
    card.style.right    = "auto";
    card.style.bottom   = "auto";
    card.style.transition = "none";

    /* Wait one frame for the card to have layout dimensions. */
    const raf = requestAnimationFrame(() => {
      snapToCorner(initial, false);
      /* Enable transition after the initial placement so there is no
         "fly-in" on first render. */
      requestAnimationFrame(() => {
        if (cardRef.current)
          cardRef.current.style.transition = "transform 0.22s ease-out";
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []); // intentionally once

  // ── Persistent drag listeners (attached once, not per-drag) ─────────────

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;

      const card = cardRef.current;
      const con  = card?.parentElement;
      if (!card || !con) return;

      moved.current = true;
      const cr = con.getBoundingClientRect();
      const x  = e.clientX - cr.left - dragOffset.current.x;
      const y  = e.clientY - cr.top  - dragOffset.current.y;

      pos.current = { x, y };
      /* transition:none was already set in onMouseDown — no need to set again. */
      card.style.transform = `translate(${x}px, ${y}px)`;
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;

      const card = cardRef.current;
      const con  = card?.parentElement;
      if (!card) return;
      card.classList.remove("is-dragging");

      if (moved.current && con) {
        const { x, y } = pos.current;
        const cw = card.offsetWidth;
        const ch = card.offsetHeight;

        /** Nearest corner: compare card centre to container centre. */
        const isLeft = (x + cw / 2) < con.offsetWidth  / 2;
        const isTop  = (y + ch / 2) < con.offsetHeight / 2;

        const snapped: CardCorner =
          isTop  && isLeft  ? "top-left"    :
          isTop  && !isLeft ? "top-right"   :
          !isTop && isLeft  ? "bottom-left" : "bottom-right";

        snapToCorner(snapped, true);
        setCorner(snapped);
      } else {
        /* Simple click (no move) — restore transition. */
        card.style.transition = "transform 0.22s ease-out";
      }
    };

    /* passive: true — onMove never calls preventDefault, so mark it passive
       to let the browser skip the check and schedule the paint sooner. */
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [snapToCorner]); // snapToCorner is stable (useCallback with no deps)

  // ── Mouse down (drag start) ──────────────────────────────────────────────

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (isExpanded) return;
    e.preventDefault();

    const card = cardRef.current;
    if (!card) return;

    const cr = card.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - cr.left, y: e.clientY - cr.top };
    moved.current      = false;
    dragging.current   = true;

    /** Kill transition immediately so the card sticks to the cursor. */
    card.style.transition = "none";
    card.classList.add("is-dragging");
  }, [isExpanded]);

  // ── Expand / collapse ────────────────────────────────────────────────────

  const onCardClick = useCallback(() => {
    if (moved.current) return; // drag-ended click — ignore
    if (!isExpanded) setIsExpanded(true);
  }, [isExpanded]);

  const onCollapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  /** Re-apply corner when collapsing back to absolute layout. */
  useEffect(() => {
    if (!isExpanded) {
      /* One RAF ensures React has removed is-expanded before we write
         the transform so the fixed-position override is gone. */
      const raf = requestAnimationFrame(() => snapToCorner(corner, false));
      return () => cancelAnimationFrame(raf);
    }
  }, [isExpanded]); // eslint-disable-line react-hooks/exhaustive-deps

  return { corner, isExpanded, cardRef, onMouseDown, onCardClick, onCollapse };
}
