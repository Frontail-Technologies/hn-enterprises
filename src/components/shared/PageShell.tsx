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
}: PageShellProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <header className="space-y-3">
        <PageHeader title={title} subtitle={subtitle} eyebrow={eyebrow} actions={actions} />
        {tabs ? <div className="border-b border-border">{tabs}</div> : null}
        {toolbar ? <div>{toolbar}</div> : null}
      </header>

      <div className={cn("min-w-0", contentClassName)}>{children}</div>
    </div>
  );
}
