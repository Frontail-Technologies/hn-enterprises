import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CustomerInfoLine({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("min-w-0 text-sm leading-6", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}: </span>
      <span className={cn("font-semibold text-foreground", valueClassName)}>
        {value || "-"}
      </span>
    </div>
  );
}
