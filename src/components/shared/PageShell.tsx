import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "./PageHeader";

interface PageShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /**
   * Opt-in dense/viewport-filling mode for data-table pages (desktop only -
   * `md:` and up; smaller screens keep the normal document-flow layout,
   * where a tall internally-scrolling table is the wrong tradeoff). The
   * header/toolbar keep their natural height; `children` becomes the one
   * flex child that stretches to fill the rest of the viewport, so a table
   * inside it (e.g. `<ExcelDataGrid fillHeight>`) can scroll internally
   * instead of stretching the whole document.
   *
   * The `md:h-[calc(100dvh-4.5rem)]` offset is `<main>`'s own chrome
   * (DashboardLayout.tsx): `md:py-4` top+bottom (2rem) + the breadcrumb
   * block's `mb-3` plus its own line height (~2rem, worst case - it's
   * absent on single-segment routes) + a small rounding buffer. `<main>`
   * itself has no bounded height (the app scrolls at the document level, by
   * design - see DashboardLayout.tsx), so this is the one deliberate
   * viewport anchor the flex chain below hangs off; everything under it
   * sizes itself via flexbox, not further guessed numbers.
   */
  fillHeight?: boolean;
}

export function PageShell({
  title,
  subtitle,
  eyebrow,
  actions,
  toolbar,
  tabs,
  children,
  className,
  contentClassName,
  fillHeight = false,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        fillHeight && "md:flex md:h-[calc(100dvh-4.5rem)] md:flex-col md:space-y-3",
        className,
      )}
    >
      <header className={cn("space-y-3", fillHeight && "md:shrink-0 md:space-y-2")}>
        <PageHeader title={title} subtitle={subtitle} eyebrow={eyebrow} actions={actions} />
        {tabs ? <div className="border-b border-border">{tabs}</div> : null}
        {toolbar ? <div>{toolbar}</div> : null}
      </header>

      <div
        className={cn(
          "min-w-0",
          fillHeight && "md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-hidden",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
