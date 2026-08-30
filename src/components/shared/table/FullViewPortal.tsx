"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { FullViewProvider } from "./FullViewContext";

const TRANSITION_MS = 180;

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

  if (active && !mounted) setMounted(true);
  if (!active && visible) setVisible(false);

  useEffect(() => {
    if (!mounted || !active) return undefined;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [active, mounted]);

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
