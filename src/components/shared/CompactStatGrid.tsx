import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CompactStatGridProps {
  children: ReactNode;
  dashboard?: boolean;
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

  return <section className={cn("grid grid-cols-2 gap-2.5 sm:gap-3", columnClasses, className)}>{children}</section>;
}
