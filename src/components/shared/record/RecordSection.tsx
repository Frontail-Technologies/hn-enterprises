import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RecordSectionProps {
  /** Anchor id; the section is reachable as #id from the jump-nav. */
  id: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * One block of a scrolling detail page: heading + content. `scroll-mt` keeps
 * the heading clear of the sticky top bar and jump-nav when jumped to.
 */
export function RecordSection({ id, title, description, actions, children, className }: RecordSectionProps) {
  return (
    <section id={id} data-record-section className={cn("flex scroll-mt-32 flex-col gap-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-2">
        <div className="min-w-0">
          <h2 className="text-section-title">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
