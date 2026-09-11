import type { ElementType } from "react";
import { cn } from "@/lib/utils";

export type StatCardTone = "primary" | "info" | "success" | "warning" | "danger";

const TONE_CHIP_CLASSES: Record<StatCardTone, string> = {
  primary: "bg-primary-soft text-primary",
  info: "bg-info-soft text-info-foreground",
  success: "bg-success-soft text-success-foreground",
  warning: "bg-warning-soft text-warning-foreground",
  danger: "bg-danger-soft text-danger",
};

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  helperText?: string;
  tone?: StatCardTone;
  dense?: boolean;
  className?: string;
  /** Exact value for the hover tooltip when `value` has been compacted for display (e.g. "₹1.48Cr" vs "₹1,47,52,130"). Defaults to `value`. */
  fullValue?: string | number;
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  helperText,
  tone = "info",
  dense = false,
  className,
  fullValue,
}: DashboardStatCardProps) {
  return (
    <article
      className={cn(
        "flex w-full min-w-0 flex-col justify-between gap-2 rounded-card border border-border bg-card transition-colors sm:gap-2.5",
        dense ? "min-h-16 p-2.5 sm:min-h-20 sm:p-3" : "min-h-20 p-3 sm:min-h-24 sm:p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[11px] font-semibold text-muted-foreground sm:text-meta">{label}</p>
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md",
            dense ? "size-5 sm:size-6" : "size-6 sm:size-7",
            TONE_CHIP_CLASSES[tone],
          )}
        >
          <Icon weight="bold" className={dense ? "size-2.5 sm:size-3" : "size-3 sm:size-3.5"} />
        </span>
      </div>
      <div className="min-w-0">
        <p
          title={String(fullValue ?? value)}
          className={cn(
            "truncate leading-none font-bold text-foreground tabular-nums",
            dense
              ? "text-sm sm:text-[clamp(1rem,1.6vw,1.125rem)]"
              : "text-base sm:text-[clamp(1.25rem,2.2vw,1.5rem)]",
          )}
        >
          {value}
        </p>
        {helperText ? (
          <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground/70 sm:text-meta">{helperText}</p>
        ) : null}
      </div>
    </article>
  );
}
