import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  className?: string;
}

/** Top of every detail screen: who/what this is, its status, key facts and actions. */
export function RecordHeader({ title, leading, badges, meta, figure, actions, className }: RecordHeaderProps) {
  const facts = meta?.filter((item) => item.label !== null && item.label !== undefined && item.label !== "") ?? [];
  return (
    <header className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="flex min-w-0 items-center gap-4">
      {leading}
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className="truncate text-page-title">{title}</h1>
          {badges}
        </div>
        {facts.length ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {facts.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index} className="inline-flex min-w-0 items-center gap-1.5">
                  {Icon ? <Icon size={15} className="shrink-0" /> : null}
                  <span className="truncate">{item.label}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      </div>
      {figure || actions ? (
        <div className="flex shrink-0 flex-wrap items-end gap-4 lg:justify-end">
          {figure ? (
            <div className="flex flex-col lg:items-end">
              <span className="text-xs text-muted-foreground">{figure.label}</span>
              <span className="text-2xl leading-tight font-bold tracking-tight text-foreground tabular-nums">{figure.value}</span>
            </div>
          ) : null}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
