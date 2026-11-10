import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DetailRow = { label: string; value: ReactNode };

const isBlank = (value: ReactNode) => value === null || value === undefined || value === "" || value === "-";

/** Label/value pairs as tidy rows with dashed separators (record facts, side rails). */
export function DetailRows({ rows, className }: { rows: DetailRow[]; className?: string }) {
  return (
    <dl className={cn("flex flex-col divide-y divide-dashed divide-border", className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className="shrink-0 text-[13px] text-muted-foreground">{row.label}</dt>
          <dd className="min-w-0 text-right text-[13px] font-semibold break-words text-foreground">
            {isBlank(row.value) ? <span className="font-normal text-muted-foreground">—</span> : row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
