"use client";

import type { RefObject } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useHorizontalScrollNav } from "@/hooks/use-horizontal-scroll-nav";
import { cn } from "@/lib/utils";

/**
 * Complete, literal reveal-on-hover classes per host group name - kept as
 * full strings (not built from a template) so Tailwind's static scanner can
 * find them. Each host wrapper must declare the matching `group/<name>`
 * class and be `relative` for these absolutely-positioned buttons to anchor
 * to it. Add an entry here (and the matching `group/<name>` on the host)
 * before using a new group value.
 */
const REVEAL_ON_GROUP_HOVER = {
  "enterprise-grid":
    "opacity-0 group-hover/enterprise-grid:opacity-100 group-hover/enterprise-grid:pointer-events-auto",
  "excel-grid": "opacity-0 group-hover/excel-grid:opacity-100 group-hover/excel-grid:pointer-events-auto",
  "data-table": "opacity-0 group-hover/data-table:opacity-100 group-hover/data-table:pointer-events-auto",
} as const;

const BUTTON_BASE =
  "pointer-events-none absolute top-1/2 z-20 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-opacity hover:bg-surface-hover hover:text-foreground";

/**
 * Hover-reveal left/right chevrons overlaid on a wide table's own scroll
 * container - purely absolute-positioned (no layout space reserved, nothing
 * pushed or clipped) and invisible/non-interactive until the surrounding
 * `group/<name>` host is hovered, so it never gets in the way of reading or
 * clicking the table underneath.
 */
export function TableScrollNav({
  scrollRef,
  group,
}: {
  scrollRef: RefObject<HTMLElement | null>;
  group: keyof typeof REVEAL_ON_GROUP_HOVER;
}) {
  const { canScrollLeft, canScrollRight, scrollBy } = useHorizontalScrollNav(scrollRef);
  const reveal = REVEAL_ON_GROUP_HOVER[group];

  if (!canScrollLeft && !canScrollRight) return null;

  return (
    <>
      {canScrollLeft ? (
        <button
          type="button"
          aria-label="Scroll table left"
          onClick={() => scrollBy("left")}
          className={cn(BUTTON_BASE, "left-1.5", reveal)}
        >
          <CaretLeftIcon size={14} weight="bold" />
        </button>
      ) : null}
      {canScrollRight ? (
        <button
          type="button"
          aria-label="Scroll table right"
          onClick={() => scrollBy("right")}
          className={cn(BUTTON_BASE, "right-1.5", reveal)}
        >
          <CaretRightIcon size={14} weight="bold" />
        </button>
      ) : null}
    </>
  );
}
