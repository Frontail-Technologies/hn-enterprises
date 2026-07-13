import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TablePanelProps {
  title?: string;
  subtitle?: string;
  toolbar?: ReactNode;
  pagination?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function TablePanel({
  toolbar,
  pagination,
  actions,
  children,
  className,
  bodyClassName,
}: TablePanelProps) {
  const hasHeader = toolbar || pagination || actions;

  return (
    <section className={cn("overflow-hidden rounded-lg border border-border/70 bg-card", className)}>
      {hasHeader ? (
        <div className="space-y-2.5 border-b border-border/70 bg-card px-3 py-2.5">
          {actions ? (
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0" />
              <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
            </div>
          ) : null}
          {(toolbar || pagination) ? (
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">{toolbar}</div>
              {pagination ? <div className="shrink-0">{pagination}</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </section>
  );
}
