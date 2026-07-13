import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DetailSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function DetailSection({
  title,
  children,
  className,
  bodyClassName,
}: DetailSectionProps) {
  return (
    <section className={cn("rounded-lg border border-border/70 bg-card", className)}>
      <div className="border-b border-border/60 px-3 py-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
