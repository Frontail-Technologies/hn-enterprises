import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "./PageHeader";

interface PageShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  fillHeight?: boolean;
}

export function PageShell({
  title,
  subtitle,
  eyebrow,
  actions,
  toolbar,
  tabs,
  children,
  className,
  contentClassName,
  fillHeight = false,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        fillHeight && "md:flex md:h-[calc(100dvh-4.5rem)] md:flex-col md:space-y-3",
        className,
      )}
    >
      <header className={cn("space-y-3", fillHeight && "md:shrink-0 md:space-y-2")}>
        <PageHeader title={title} subtitle={subtitle} eyebrow={eyebrow} actions={actions} />
        {tabs ? <div className="border-b border-border">{tabs}</div> : null}
        {toolbar ? <div>{toolbar}</div> : null}
      </header>

      <div
        className={cn(
          "min-w-0",
          fillHeight && "md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-hidden",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
