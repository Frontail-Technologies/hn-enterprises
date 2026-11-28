import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageBackButton } from "./PageBackButton";
import { PageHeader } from "./PageHeader";

interface PageShellProps {
  title: string;
  description?: ReactNode;
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
  /** Where the back arrow left of the title goes (default: previous page, nested pages only). */
  backHref?: string;
}

export function PageShell({
  title,
  description,
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
  backHref,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "space-y-5",
        fillHeight && "md:flex md:min-h-0 md:flex-1 md:flex-col md:space-y-4",
        className,
      )}
    >
      <header className={cn("space-y-4", fillHeight && "md:shrink-0 md:space-y-3")}>
        {hideTitle ? (
          <div className="flex items-center justify-between gap-2">
            <PageBackButton href={backHref} />
            {actions ? <div className="ml-auto flex">{actions}</div> : null}
          </div>
        ) : (
          <PageHeader title={title} description={description} icon={icon} eyebrow={eyebrow} actions={actions} backHref={backHref} />
        )}
        {tabs ?? null}
        {toolbar ? <div>{toolbar}</div> : null}
      </header>

      <div
        className={cn(
          "min-w-0 space-y-4",
          fillHeight && "md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-hidden",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
