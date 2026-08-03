import type { ReactNode } from "react";
import { WarningIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function StatCardRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
  );
}

export function SummaryValue({
  label,
  value,
  icon,
  warn,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  warn?: boolean;
}) {
  return (
    <div className="flex h-24 w-full flex-col justify-between rounded-lg border border-border/70 bg-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium leading-4 text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            "rounded-lg bg-primary/10 p-1.5 text-primary",
            warn && "bg-destructive/10 text-destructive",
          )}
        >
          {icon ?? <WarningIcon size={17} />}
        </span>
      </div>
      <p
        className={cn(
          "text-xl font-semibold leading-tight text-foreground",
          warn && "text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}
