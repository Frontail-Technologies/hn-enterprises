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
  /** Custom colours for the icon tile; overrides `tone`. */
  iconClassName?: string;
  /** Exact value for the hover tooltip when `value` has been compacted for display (e.g. "₹1.48Cr" vs "₹1,47,52,130"). Defaults to `value`. */
  fullValue?: string | number;
}

/**
 * The one stat-card look for the admin panel: icon tile, muted label, large
 * tabular value, optional helper line. MetricCard renders through this too.
 */
export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  tone = "info",
  dense = false,
  className,
  iconClassName,
  fullValue,
}: DashboardStatCardProps) {
  return (
    <article
      className={cn(
        "flex w-full min-w-0 items-start gap-3.5 rounded-card border border-border bg-card shadow-card transition-colors",
        dense ? "p-3.5" : "p-4 sm:p-5",
        className,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg",
          dense ? "size-9" : "size-10 sm:size-11",
          iconClassName ?? TONE_CHIP_CLASSES[tone],
        )}
      >
        <Icon weight="duotone" className={dense ? "size-[18px]" : "size-5 sm:size-[22px]"} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-[13px] text-muted-foreground">{label}</p>
        <p
          title={String(fullValue ?? value)}
          className={cn(
            "truncate leading-none font-bold tracking-tight text-foreground tabular-nums",
            dense ? "text-lg" : "text-xl sm:text-[1.625rem]",
          )}
        >
          {value}
        </p>
        {/* Sub-labels are not shown anywhere (design decision): helperText stays in the props so callers keep compiling. */}
      </div>
    </article>
  );
}
