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
