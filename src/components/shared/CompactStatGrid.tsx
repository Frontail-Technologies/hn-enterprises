import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CompactStatGridProps {
  children: ReactNode;
  dashboard?: boolean;
  /** Target column count at the widest breakpoint (default 4). Cards fill their cell - see MetricCard. */
  columns?: 3 | 4 | 5;
  className?: string;
}

const COLUMN_CLASSES: Record<3 | 4 | 5, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-3 xl:grid-cols-4",
  5: "lg:grid-cols-3 xl:grid-cols-5",
};

export function CompactStatGrid({ children, dashboard, columns, className }: CompactStatGridProps) {
  const columnClasses = columns
    ? COLUMN_CLASSES[columns]
    : dashboard
      ? "xl:grid-cols-4"
      : COLUMN_CLASSES[4];

  return <section className={cn("grid gap-3 sm:grid-cols-2", columnClasses, className)}>{children}</section>;
}
