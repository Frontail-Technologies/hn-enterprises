import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageBackButton } from "../PageBackButton";

export type RecordMeta = { icon?: ElementType; label: ReactNode };

interface RecordHeaderProps {
  title: ReactNode;
  /** Optional photo/avatar before the title. */
  leading?: ReactNode;
  /** Status badges next to the title. */
  badges?: ReactNode;
  /** Short facts under the title (code, city, client...), each with an optional icon. */
  meta?: RecordMeta[];
  /** One headline figure on the right, e.g. contract value. */
  figure?: { label: string; value: ReactNode };
  actions?: ReactNode;
  /** Where the back arrow goes (default: previous page). */
  backHref?: string;
  className?: string;
}

/** Top of every detail screen: who/what this is, its status, key facts and actions. */
export function RecordHeader({ title, leading, badges, meta, figure, actions, backHref, className }: RecordHeaderProps) {
  const facts = meta?.filter((item) => item.label !== null && item.label !== undefined && item.label !== "") ?? [];
  const hasFactsRow = Boolean(badges) || facts.length > 0;
  return (
    <header className={cn("flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <PageBackButton href={backHref} className="self-start mt-1" />
        {leading}
        <div className="flex min-w-0 flex-col gap-2">
          {/* Long names wrap to two lines (full name on hover) instead of being cut to one. */}
          <h1 className="line-clamp-2 text-page-title break-words" title={typeof title === "string" ? title : undefined}>
            {title}
          </h1>
          {hasFactsRow ? (
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5">
              {badges ? <div className="flex shrink-0 items-center gap-1.5">{badges}</div> : null}
              {facts.map((item, index) => {
                const Icon = item.icon;
                return (
                  <span key={index} className="inline-flex min-w-0 items-center gap-1.5 text-sm text-foreground/80">
                    {Icon ? <Icon size={15} className="shrink-0 text-muted-foreground" /> : null}
                    <span className="truncate">{item.label}</span>
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
      {figure || actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
          {figure ? (
            <div className="flex flex-col pr-2 lg:items-end">
              <span className="text-xs font-medium text-muted-foreground">{figure.label}</span>
              <span className="text-2xl leading-tight font-bold tracking-tight text-foreground tabular-nums">{figure.value}</span>
            </div>
          ) : null}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
