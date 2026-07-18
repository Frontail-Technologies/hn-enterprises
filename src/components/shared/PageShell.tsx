import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
    <div className={cn("space-y-3", className)}>
      <header className="space-y-2">
        {eyebrow ? <div className="text-xs text-muted-foreground">{eyebrow}</div> : null}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
        {tabs ? <div className="border-b border-border/70">{tabs}</div> : null}
        {toolbar ? <div>{toolbar}</div> : null}
      </header>

      <div className={cn("min-w-0", contentClassName)}>{children}</div>
    </div>
  );
}
