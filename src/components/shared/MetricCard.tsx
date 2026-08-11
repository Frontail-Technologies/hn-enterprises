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
        // Fills whatever grid cell it's placed in (CompactStatGrid etc.) -
        // no fixed/max width here, so a 4- or 5-up KPI row packs tightly
        // instead of leaving large gaps between narrow, left-aligned cards.
        "flex min-h-24 w-full flex-col justify-between rounded-card border border-border bg-card p-4",
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
          <Icon size={16} weight="bold" />
        </div>
      </div>
      <div>
        <p className="text-[22px] font-semibold leading-tight text-foreground">{value}</p>
        {helperText ? (
          <p className="mt-0.5 truncate text-xs font-medium leading-tight text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    </article>
  );
}
