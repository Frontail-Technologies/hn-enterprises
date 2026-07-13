import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CompactStatGridProps {
  children: ReactNode;
  dashboard?: boolean;
  className?: string;
}

export function CompactStatGrid({ children, dashboard, className }: CompactStatGridProps) {
  return (
    <section
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        dashboard ? "xl:grid-cols-4" : "lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </section>
  );
}

interface CompactStatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  warn?: boolean;
  className?: string;
}

export function CompactStatCard({
  label,
  value,
  helper,
  icon,
  warn,
  className,
}: CompactStatCardProps) {
  return (
    <article
      className={cn(
        "flex h-24 w-full flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-xs font-medium leading-4 text-muted-foreground">{label}</p>
        {icon ? (
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary",
              warn && "bg-destructive/10 text-destructive",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div>
        <p className={cn("text-xl font-semibold leading-tight text-foreground", warn && "text-primary")}>
          {value}
        </p>
        {helper ? (
          <p className="mt-0.5 truncate text-xs font-medium leading-tight text-muted-foreground">
            {helper}
          </p>
        ) : null}
      </div>
    </article>
  );
}
