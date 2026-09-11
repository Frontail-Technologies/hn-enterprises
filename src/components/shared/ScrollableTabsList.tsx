"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function ScrollableTabsList({ children, className }: { children: ReactNode; className?: string }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
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
  }, [updateScrollState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollActiveIntoView = () => {
      const active = el.querySelector<HTMLElement>("[data-active]");
      active?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
    };

    scrollActiveIntoView();
    const observer = new MutationObserver(scrollActiveIntoView);
    observer.observe(el, { attributes: true, attributeFilter: ["data-active"], subtree: true });
    return () => observer.disconnect();
  }, []);

  const scrollByTabs = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: "smooth" });
  };

  const showChevrons = canScrollLeft || canScrollRight;

  return (
    <div className={cn("relative flex min-w-0 items-center gap-1 border-b border-border", className)}>
      {showChevrons ? (
        <TabChevron direction="left" disabled={!canScrollLeft} onClick={() => scrollByTabs("left")} />
      ) : null}

      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollRef}
          className="scrollbar-hidden flex overflow-x-auto overflow-y-hidden scroll-smooth"
        >
          <TabsList
            variant="line"
            className="flex w-max min-w-full flex-nowrap justify-start border-b-0"
            style={{ overflow: "visible" }}
          >
            {children}
          </TabsList>
        </div>

        {canScrollLeft ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent"
          />
        ) : null}
        {canScrollRight ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent"
          />
        ) : null}
      </div>

      {showChevrons ? (
        <TabChevron direction="right" disabled={!canScrollRight} onClick={() => scrollByTabs("right")} />
      ) : null}
    </div>
  );
}

function TabChevron({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "left" ? CaretLeftIcon : CaretRightIcon;

  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Scroll tabs left" : "Scroll tabs right"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground",
        direction === "left" ? "mr-1" : "ml-1",
        disabled && "pointer-events-none opacity-30",
      )}
    >
      <Icon size={15} weight="bold" />
    </button>
  );
}
