"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

/**
 * Tracks whether a scrollable element has more content off-screen to the
 * left/right, and exposes a smooth "page" scroll action - shared by anything
 * that needs hover-reveal horizontal-scroll nav buttons (wide tables,
 * ScrollableTabsList). Purely state/behavior - no JSX, so it has no bearing
 * on which Tailwind classes a consumer uses to reveal its own buttons.
 */
export function useHorizontalScrollNav(ref: RefObject<HTMLElement | null>) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [ref, updateScrollState]);

  const scrollBy = useCallback(
    (direction: "left" | "right") => {
      const el = ref.current;
      if (!el) return;
      el.scrollBy({ left: direction === "left" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: "smooth" });
    },
    [ref],
  );

  return { canScrollLeft, canScrollRight, scrollBy };
}
