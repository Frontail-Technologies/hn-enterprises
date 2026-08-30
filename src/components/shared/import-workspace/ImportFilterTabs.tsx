import { cn } from "@/lib/utils";
import type { ImportPreviewFilter } from "./useImportWorkspace";
import type { ImportSummary } from "./types";

const FILTERS: { key: ImportPreviewFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready" },
  { key: "rejected", label: "Rejected" },
];

export function ImportFilterTabs({
  active,
  onChange,
  summary,
}: {
  active: ImportPreviewFilter;
  onChange: (filter: ImportPreviewFilter) => void;
  summary: ImportSummary;
}) {
  const counts: Record<ImportPreviewFilter, number> = {
    all: summary.total,
    ready: summary.ready,
    rejected: summary.rejected,
  };

  return (
    <div className="inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-[3px]">
      {FILTERS.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-all",
            active === item.key ? "bg-background text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground",
          )}
        >
          {item.label}
          <span className="text-xs text-muted-foreground">{counts[item.key]}</span>
        </button>
      ))}
    </div>
  );
}
