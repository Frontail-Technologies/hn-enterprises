import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Save/Cancel bar for full-page create/edit forms (DS-FORM "stable action
 * footer"). Always pinned to the bottom of the screen — also on short forms —
 * and aligned with the content area: it starts after the sidebar (expanded or
 * collapsed to icons) on desktop and spans the full width on mobile. A spacer
 * keeps the last fields from hiding behind it. Place it as the last child of
 * the form page.
 */
export function StickyFormFooter({ children, start, className }: { children: ReactNode; start?: ReactNode; className?: string }) {
  return (
    <>
      <div aria-hidden="true" className="h-20 shrink-0" />
      <div
        className={cn(
          "fixed right-0 bottom-0 left-0 z-30 flex flex-wrap items-center gap-2 border-t border-border bg-card/95 px-3 py-3 shadow-[0_-4px_12px_-8px_color-mix(in_oklch,var(--foreground)_18%,transparent)] backdrop-blur transition-[left] duration-200 ease-linear sm:px-4 md:left-(--sidebar-width) md:group-has-data-[collapsible=icon]/sidebar-wrapper:left-(--sidebar-width-icon) lg:px-6",
          className,
        )}
      >
        {start ? <div className="min-w-0 flex-1 text-[13px] text-muted-foreground">{start}</div> : null}
        <div className="ms-auto flex flex-wrap items-center gap-2">{children}</div>
      </div>
    </>
  );
}
