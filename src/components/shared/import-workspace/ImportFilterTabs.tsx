import { CheckCircleIcon, ListBulletsIcon, TrashIcon, XCircleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ImportPreviewFilter } from "./useImportWorkspace";
import type { ImportSummary } from "./types";

const TILES: {
  key: ImportPreviewFilter | "removed";
  label: string;
  icon: typeof CheckCircleIcon;
  tone: string;
  count: (summary: ImportSummary) => number;
}[] = [
  { key: "all", label: "All rows", icon: ListBulletsIcon, tone: "bg-info-soft text-info-foreground", count: (s) => s.total },
  { key: "ready", label: "Ready", icon: CheckCircleIcon, tone: "bg-success-soft text-success-foreground", count: (s) => s.ready },
  { key: "rejected", label: "Rejected", icon: XCircleIcon, tone: "bg-danger-soft text-danger", count: (s) => s.rejected },
  { key: "removed", label: "Removed", icon: TrashIcon, tone: "bg-muted text-muted-foreground", count: (s) => s.removed },
];

/**
 * Count tiles for the import preview that double as filters (All / Ready /
 * Rejected). "Removed" is informational (removed rows are restored per row
 * or with Undo).
 */
export function ImportFilterTabs({
  active,
  onChange,
  summary,
}: {
  active: ImportPreviewFilter;
  onChange: (filter: ImportPreviewFilter) => void;
  summary: ImportSummary;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="group" aria-label="Filter rows">
      {TILES.map((tile, index) => {
        const Icon = tile.icon;
        const count = tile.count(summary);
        const filter = tile.key === "removed" ? null : tile.key;
        const selected = filter !== null && active === filter;
        const content = (
          <>
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", tile.tone)}>
              <Icon size={18} weight="bold" />
            </span>
            <span className="flex min-w-0 flex-col items-start">
              <span className="text-[13px] text-muted-foreground">{tile.label}</span>
              <span className="text-xl leading-tight font-bold text-foreground tabular-nums">{count.toLocaleString("en-IN")}</span>
            </span>
            {tile.key === "ready" && summary.warnings > 0 ? (
              <span className="ms-auto self-start rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning-foreground">
                {summary.warnings} with warnings
              </span>
            ) : null}
          </>
        );
        const base =
          "flex items-center gap-3 rounded-card border bg-card p-3.5 text-left shadow-card animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-300";
        return filter ? (
          <button
            key={tile.key}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(filter)}
            style={{ animationDelay: `${index * 50}ms` }}
            className={cn(
              base,
              "transition-[border-color,box-shadow] hover:border-primary/40",
              selected ? "border-primary/60 ring-3 ring-primary/15" : "border-border",
            )}
          >
            {content}
          </button>
        ) : (
          <div key={tile.key} style={{ animationDelay: `${index * 50}ms` }} className={cn(base, "border-border")}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
