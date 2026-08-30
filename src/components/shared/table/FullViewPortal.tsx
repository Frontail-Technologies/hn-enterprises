"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { FullViewProvider } from "./FullViewContext";

const TRANSITION_MS = 180;

/**
 * Application-level "Full View" surface for large tables - NOT the browser
 * Fullscreen API (no permission prompt, no browser chrome behavior). When
 * `active` is false, `children` render exactly where they're called from.
 * When `active` is true, the *same* `children` are portaled to
 * `document.body` inside a fixed, viewport-covering surface instead.
 *
 * Because this only changes WHERE the children mount in the DOM tree (via
 * `createPortal`) and not their position in the React tree, toggling
 * `active` does not unmount/remount them - the calling table's own state
 * (rows, filters, selection, scroll position, query cache, etc.) survives
 * the switch untouched, and nothing is refetched.
 *
 * A short fade + scale transition plays on enter/exit (respects
 * prefers-reduced-motion via `motion-reduce:`). The portal stays mounted for
 * `TRANSITION_MS` after `active` goes false so the exit transition has
 * something to animate, then unmounts - the table itself is never
 * interaction-blocked while that plays, only visually fading.
 *
 * z-40: above the sidebar (`z-10`) and sticky sub-nav bars, below the app's
 * dialog/popover tier (`z-50` - Dialog/Sheet/Select/Popover/Tooltip), so a
 * row-editor dialog opened from inside Full View still layers on top of it.
 */
export function FullViewPortal({
  active,
  onExit,
  children,
  className,
}: {
  active: boolean;
  onExit: () => void;
  children: ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(active);
  const [visible, setVisible] = useState(active);

  // Adjusted during render (React's alternative to a setState-in-effect
  // cascade) rather than in an effect - both of these are plain reactions to
  // `active` changing, not something that needs to wait for a commit:
  // mount immediately when activated, and start the exit fade immediately
  // when deactivated (the "before" state - visible=true - was already
  // painted by an earlier commit when Full View opened, so this is a normal
  // two-commit transition, not a mount-then-transition case).
  if (active && !mounted) setMounted(true);
  if (!active && visible) setVisible(false);

  // The enter transition is the one part that genuinely needs an effect:
  // the browser has to paint the "before" state (visible=false, just
  // mounted) at least once before flipping to "after" for the transition to
  // animate instead of jumping straight there - that can only happen after
  // this render has committed.
  useEffect(() => {
    if (!mounted || !active) return undefined;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [active, mounted]);

  // Unmount (drop out of the portal) only after the exit transition has had
  // time to play.
  useEffect(() => {
    if (mounted && active) return undefined;
    if (!mounted) return undefined;
    const timeout = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [active, mounted]);

  useEffect(() => {
    if (!mounted) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onExit();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, onExit]);

  return (
    <FullViewProvider active={active}>
      {mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Full view"
              className={cn(
                "fixed inset-0 z-40 flex flex-col overflow-hidden bg-background p-2",
                "transition-[opacity,transform] duration-180 ease-out motion-reduce:transition-none motion-reduce:duration-0",
                visible ? "scale-100 opacity-100" : "scale-[0.985] opacity-0",
                className,
              )}
            >
              {children}
            </div>,
            document.body,
          )
        : children}
    </FullViewProvider>
  );
}
