import type { ElementType } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  helperText?: string;
  className?: string;
  iconClassName?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  helperText,
  className,
  iconClassName,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-20 w-full min-w-0 flex-col justify-between rounded-card border border-border bg-card p-3 sm:min-h-24 sm:p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[11px] font-medium leading-4 text-muted-foreground sm:text-xs">
          {label}
        </p>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-1 text-primary sm:p-1.5",
            iconClassName,
          )}
        >
          <Icon weight="bold" className="size-3.5 sm:size-4" />
        </div>
      </div>
      <div className="min-w-0">
        <p
          title={String(value)}
          className="truncate text-sm font-semibold leading-tight text-foreground tabular-nums sm:text-[clamp(1.1rem,2vw,1.375rem)]"
        >
          {value}
        </p>
        {helperText ? (
          <p className="mt-0.5 truncate text-[10px] font-medium leading-tight text-muted-foreground sm:text-xs">
            {helperText}
          </p>
        ) : null}
      </div>
    </article>
  );
}
