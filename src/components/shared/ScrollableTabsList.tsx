"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { TabsList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Wraps a `line`-variant TabsList that has too many tabs to fit on one row:
 * horizontal scroll with no visible scrollbar at all (native hidden, no
 * custom track/thumb - navigation is chevrons + wheel/trackpad/touch only),
 * chevrons that appear only when there's overflow (disabled rather than
 * removed at either end, so nothing shifts layout), the active tab
 * auto-scrolled into view, and a subtle edge fade hinting at more content.
 * Tabs/TabsTrigger/TabsContent and whatever drives the active value
 * (controlled or uncontrolled) are untouched - this only repositions where
 * TabsList's own overflow lives.
 */
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

  // Whichever tab gets `data-active` (base-ui's line-variant styling already
  // keys off this) scrolls into view - covers clicks, keyboard tab-list
  // navigation, and a controlled Tabs' `value` changing from elsewhere, all
  // without this wrapper needing to know how the active tab is driven.
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
    <div className={cn("relative flex min-w-0 items-center", className)}>
      {showChevrons ? (
        <TabChevron direction="left" disabled={!canScrollLeft} onClick={() => scrollByTabs("left")} />
      ) : null}

      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollRef}
          className="scrollbar-hidden flex overflow-x-auto overflow-y-hidden scroll-smooth"
        >
          {/* TabsList's own `line` variant bakes in `overflow-x-auto` (see
              tabs.tsx) - left alone it becomes a second, independently
              scrolling element nested inside this one, with no scrollbar
              hiding of its own. `overflow: visible` is set via inline style,
              not a class, so it can't lose to that variant class through
              Tailwind's merge/cascade-layer ordering - this scrollRef div
              must be the only element that actually scrolls. */}
          <TabsList variant="line" className="flex w-max min-w-full justify-start gap-6 p-0" style={{ overflow: "visible" }}>
            {children}
          </TabsList>
        </div>

        {/* Edge fades hint at clipped content without covering label text -
            they sit just inside the scroll track, matching the chevron gate,
            and never render when nothing's cut off. */}
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
        "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        direction === "left" ? "mr-1" : "ml-1",
        disabled && "pointer-events-none opacity-30",
      )}
    >
      <Icon size={15} weight="bold" />
    </button>
  );
}
