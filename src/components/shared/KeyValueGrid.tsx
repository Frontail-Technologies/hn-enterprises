import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KeyValueItem = {
  label: string;
  value: ReactNode;
};

interface KeyValueGridProps {
  items: KeyValueItem[];
  columns?: 1 | 2 | 3;
  className?: string;
  itemClassName?: string;
}

export function KeyValueGrid({
  items,
  columns = 2,
  className,
  itemClassName,
}: KeyValueGridProps) {
  return (
    <dl
      className={cn(
        "grid gap-x-10 gap-y-2.5",
        columns >= 2 && "md:grid-cols-2",
        columns >= 3 && "xl:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn("grid min-w-0 grid-cols-[minmax(125px,0.42fr)_1fr] gap-4", itemClassName)}
        >
          <dt className="truncate text-xs font-medium text-muted-foreground">
            {item.label}:
          </dt>
          <dd className="min-w-0 text-sm font-medium text-foreground">
            {item.value || "-"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
