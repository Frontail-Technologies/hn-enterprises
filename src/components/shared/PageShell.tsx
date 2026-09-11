import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "./PageHeader";

interface PageShellProps {
  title: string;
  icon?: ElementType;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  tabs?: ReactNode;
  hideTitle?: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  fillHeight?: boolean;
}

export function PageShell({
  title,
  icon,
  eyebrow,
  actions,
  toolbar,
  tabs,
  hideTitle = false,
  children,
  className,
  contentClassName,
  fillHeight = false,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        fillHeight && "md:flex md:min-h-0 md:flex-1 md:flex-col md:space-y-3",
        className,
      )}
    >
      <header className={cn("space-y-3", fillHeight && "md:shrink-0 md:space-y-2")}>
        {hideTitle ? (
          actions ? <div className="flex justify-end">{actions}</div> : null
        ) : (
          <PageHeader title={title} icon={icon} eyebrow={eyebrow} actions={actions} />
        )}
        {tabs ?? null}
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
