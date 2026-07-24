import type { ReactNode } from "react";
import { KeyValueGrid, type KeyValueItem } from "@/components/shared/KeyValueGrid";

export function DetailSummaryCard({
  title,
  status,
  leftItems,
  rightTitle,
  rightItems,
}: {
  title: string;
  status: ReactNode;
  leftItems: KeyValueItem[];
  rightTitle: string;
  rightItems: KeyValueItem[];
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-card p-3">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {status}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <KeyValueGrid items={leftItems} columns={1} />
        <div className="border-border/70 xl:border-l xl:pl-5">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            {rightTitle}
          </p>
          <KeyValueGrid items={rightItems} columns={1} compact />
        </div>
      </div>
    </section>
  );
}
