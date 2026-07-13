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
        "flex h-24 w-full min-w-32 max-w-44 flex-col justify-between rounded-lg border border-border/70 bg-card p-3 sm:w-40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-xs font-medium leading-4 text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-1.5 text-primary",
            iconClassName,
          )}
        >
          <Icon size={17} weight="bold" />
        </div>
      </div>
      <div>
        <p className="text-xl font-semibold leading-tight text-foreground">{value}</p>
        {helperText ? (
          <p className="mt-0.5 truncate text-xs font-medium leading-tight text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    </article>
  );
}
