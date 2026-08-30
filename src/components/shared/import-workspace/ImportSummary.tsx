import type { ImportSummary as ImportSummaryData } from "./types";

export function ImportSummary({
  summary,
  importedCount,
  onUndoAllRemoved,
}: {
  summary: ImportSummaryData;
  importedCount: number;
  onUndoAllRemoved?: () => void;
}) {
  if (!summary.removed && !importedCount) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      {summary.removed > 0 ? (
        <span>
          {summary.removed} removed
          {onUndoAllRemoved ? (
            <>
              {" · "}
              <button
                type="button"
                onClick={onUndoAllRemoved}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Undo
              </button>
            </>
          ) : null}
        </span>
      ) : null}
      {importedCount > 0 ? <span>{importedCount} already imported</span> : null}
    </div>
  );
}
