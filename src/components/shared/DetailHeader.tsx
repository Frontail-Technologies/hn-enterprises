import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DetailHeaderProps {
  title: ReactNode;
  badges?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function DetailHeader({
  title,
  badges,
  meta,
  actions,
  className,
}: DetailHeaderProps) {
  return (
    <header className={cn("rounded-lg border border-border/70 bg-card px-3 py-2.5", className)}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
            {badges}
          </div>
          {meta ? (
            <div className="mt-1 flex min-w-0 flex-wrap gap-x-4 gap-y-0.5 text-xs font-medium text-muted-foreground">
              {meta}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

