"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { cn } from "@/lib/utils";

type Orientation = "horizontal" | "vertical";

const DEFAULT_THICKNESS = 7;
const DEFAULT_MIN_THUMB_SIZE = 28;

export function CustomScrollbar({
  targetRef,
  orientation,
  className,
  variant = "overlay",
  thickness = DEFAULT_THICKNESS,
  minThumbSize = DEFAULT_MIN_THUMB_SIZE,
}: {
  targetRef: RefObject<HTMLElement | null>;
  orientation: Orientation;
  className?: string;
  variant?: "overlay" | "viewport";
  thickness?: number;
  minThumbSize?: number;
}) {
  const [metrics, setMetrics] = useState({ scrollSize: 0, clientSize: 0, scrollPos: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStateRef = useRef<{ startPointer: number; startScroll: number } | null>(null);

  const readMetrics = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;
    setMetrics(
      orientation === "horizontal"
        ? { scrollSize: el.scrollWidth, clientSize: el.clientWidth, scrollPos: el.scrollLeft }
        : { scrollSize: el.scrollHeight, clientSize: el.clientHeight, scrollPos: el.scrollTop },
    );
  }, [targetRef, orientation]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    readMetrics();

    const onScroll = () => readMetrics();
    el.addEventListener("scroll", onScroll, { passive: true });

    const observer = new ResizeObserver(readMetrics);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [targetRef, readMetrics]);

  const canScroll = metrics.scrollSize > metrics.clientSize + 1;
  const trackSize = metrics.clientSize;
  const thumbSize = canScroll
    ? Math.max(minThumbSize, (metrics.clientSize / metrics.scrollSize) * trackSize)
    : 0;
  const scrollableRange = metrics.scrollSize - metrics.clientSize;
  const trackFreeSpace = trackSize - thumbSize;
  const thumbOffset =
    canScroll && scrollableRange > 0 ? (metrics.scrollPos / scrollableRange) * trackFreeSpace : 0;

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const el = targetRef.current;
      if (!el) return;
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStateRef.current = {
        startPointer: orientation === "horizontal" ? event.clientX : event.clientY,
        startScroll: orientation === "horizontal" ? el.scrollLeft : el.scrollTop,
      };
      setDragging(true);
    },
    [orientation, targetRef],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current;
      const el = targetRef.current;
      if (!dragState || !el || trackFreeSpace <= 0) return;

      const pointerPos = orientation === "horizontal" ? event.clientX : event.clientY;
      const delta = pointerPos - dragState.startPointer;
      const scrollDelta = (delta / trackFreeSpace) * scrollableRange;
      const nextScroll = Math.min(Math.max(dragState.startScroll + scrollDelta, 0), scrollableRange);

      if (orientation === "horizontal") el.scrollLeft = nextScroll;
      else el.scrollTop = nextScroll;
    },
    [orientation, targetRef, trackFreeSpace, scrollableRange],
  );

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  if (!canScroll) return null;

  const isHorizontal = orientation === "horizontal";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none z-20",
        variant === "viewport" ? "fixed" : "absolute",
        isHorizontal ? "inset-x-0 bottom-0" : "inset-y-0 right-0",
        className,
      )}
      style={isHorizontal ? { height: thickness } : { width: thickness }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "pointer-events-auto absolute touch-none select-none rounded-full transition-colors",
          dragging ? "cursor-grabbing bg-foreground/45" : "cursor-pointer bg-foreground/25 hover:bg-foreground/40",
        )}
        style={
          isHorizontal
            ? { left: thumbOffset, width: thumbSize, top: 0, bottom: 0 }
            : { top: thumbOffset, height: thumbSize, left: 0, right: 0 }
        }
      />
    </div>
  );
}
