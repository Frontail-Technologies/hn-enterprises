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
        "bg-card rounded-lg ring-1 ring-foreground/5 shadow-sm px-4 py-3.5 min-h-28 flex flex-col justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-7 w-7 shrink-0 rounded-md bg-primary/10 text-primary flex items-center justify-center",
            iconClassName,
          )}
        >
          <Icon size={16} weight="bold" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground leading-tight">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground leading-none">
            {value}
          </p>
        </div>
      </div>
      {helperText ? (
        <p className="pl-10 text-xs font-medium text-muted-foreground leading-none">
          {helperText}
        </p>
      ) : null}
    </article>
  );
}
