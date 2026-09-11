"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tableDensity } from "@/components/shared/table/density";
import { useFullViewActive } from "@/components/shared/table/FullViewContext";
import { cn } from "@/lib/utils";
import { ImportErrorSummary } from "./ImportErrorBadge";
import { ImportRowActions } from "./ImportRowActions";
import type { ImportPreviewColumn, ImportRowDraft } from "./types";

const PAGE_SIZE = 50;

function formatCellValue(value: string | number | boolean | null | undefined) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return "—";
  const text = String(value).trim();
  return text || "—";
}

function RowStatusBadge<TData>({ row }: { row: ImportRowDraft<TData> }) {
  if (row.isImported)
    return (
      <Badge
        variant="default"
        className="bg-status-success-bg text-status-success-fg"
      >
        Imported
      </Badge>
    );
  if (row.isRemoved) return <Badge variant="outline">Removed</Badge>;
  if (row.status === "invalid")
    return <Badge variant="destructive">Rejected</Badge>;
  if (row.status === "warning")
    return (
      <Badge
        variant="outline"
        className="border-status-warning/30 bg-status-warning-bg text-status-warning-fg"
      >
        Warning
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="border-status-success/30 bg-status-success-bg text-status-success-fg"
    >
      Ready
    </Badge>
  );
}

function RowImportStatus<TData>({ row }: { row: ImportRowDraft<TData> }) {
  const hasMessage =
    Boolean(row.commitError) ||
    row.errors.length > 0 ||
    row.warnings.length > 0;

  return (
    <div className="flex flex-col items-start gap-1">
      <RowStatusBadge row={row} />
      {row.commitError ? (
        <span className="text-xs text-destructive">{row.commitError}</span>
      ) : hasMessage ? (
        <ImportErrorSummary errors={row.errors} warnings={row.warnings} />
      ) : null}
    </div>
  );
}

const stickyHeadClassName = cn(
  tableDensity.rowHeight,
  tableDensity.headerText,
  tableDensity.cellPaddingX,
  tableDensity.cellPaddingY,
  "sticky top-0 z-10 border-r border-b border-r-border/40 border-b-border bg-table-header text-left font-semibold text-muted-foreground",
);

const bodyCellClassName = cn(
  tableDensity.rowHeight,
  tableDensity.bodyText,
  tableDensity.cellPaddingX,
  tableDensity.cellPaddingY,
  "border-r border-b border-r-border/30 border-b-border/60 text-foreground",
);

export function ImportPreviewTable<TData>({
  columns,
  rows,
  onEdit,
  onToggleRemove,
  removingTempId,
  fillHeight = false,
}: {
  columns: ImportPreviewColumn<TData>[];
  rows: ImportRowDraft<TData>[];
  onEdit: (tempId: string) => void;
  onToggleRemove: (tempId: string, removed: boolean) => void;
  removingTempId: string | null;
  fillHeight?: boolean;
}) {
  const isFullViewActive = useFullViewActive();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const [lastRowCount, setLastRowCount] = useState(rows.length);
  if (rows.length !== lastRowCount) {
    setLastRowCount(rows.length);
    setPage(1);
  }

  const pagedRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

  return (
    <div
      className={cn(
        "flex flex-col bg-card",
        isFullViewActive ? "rounded-none" : "rounded-card border border-border",
        fillHeight && "min-h-0 flex-1",
      )}
    >
      <div
        className={cn(
          "min-h-0 flex-1 overflow-auto",
          !fillHeight && "max-h-[55vh]",
        )}
      >
        <Table className="min-w-full border-separate border-spacing-0 text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(stickyHeadClassName, "w-16")}>
                Row
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ minWidth: column.width ?? 140 }}
                  className={stickyHeadClassName}
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead className={cn(stickyHeadClassName, "min-w-[200px]")}>
                Import Status
              </TableHead>
              <TableHead
                className={cn(
                  tableDensity.rowHeight,
                  tableDensity.headerText,
                  tableDensity.cellPaddingX,
                  tableDensity.cellPaddingY,
                  "sticky top-0 z-10 w-28 border-b border-b-border bg-table-header text-right font-semibold text-muted-foreground last:border-r-0",
                )}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length ? (
              pagedRows.map((row) => (
                <TableRow
                  key={row.tempId}
                  className={cn(
                    "bg-white hover:bg-muted/30",
                    row.isRemoved && "bg-muted/40 opacity-60",
                    row.isImported && "bg-status-success-bg/30",
                  )}
                >
                  <TableCell
                    className={cn(
                      tableDensity.rowHeight,
                      tableDensity.cellPaddingX,
                      tableDensity.cellPaddingY,
                      "border-r border-b border-r-border/30 border-b-border/60 text-xs text-muted-foreground",
                    )}
                  >
                    {row.rowNumber}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={bodyCellClassName}>
                      {column.render
                        ? column.render(row)
                        : formatCellValue(column.getValue(row))}
                    </TableCell>
                  ))}
                  <TableCell
                    className={cn(
                      tableDensity.cellPaddingX,
                      tableDensity.cellPaddingY,
                      "border-r border-b border-r-border/30 border-b-border/60",
                    )}
                  >
                    <RowImportStatus row={row} />
                  </TableCell>
                  <TableCell
                    className={cn(
                      tableDensity.rowHeight,
                      tableDensity.cellPaddingX,
                      tableDensity.cellPaddingY,
                      "border-b border-b-border/60 last:border-r-0",
                    )}
                  >
                    <ImportRowActions
                      row={row}
                      onEdit={() => onEdit(row.tempId)}
                      onToggleRemove={(removed) =>
                        onToggleRemove(row.tempId, removed)
                      }
                      isRemoving={removingTempId === row.tempId}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length + 3}
                  className="px-3 py-10 text-center text-sm text-muted-foreground"
                >
                  No rows match this filter
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            Page {page} of {totalPages} · {rows.length} rows
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className={cn(tableDensity.pagerButtonHeight, "px-2 text-xs")}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(tableDensity.pagerButtonHeight, "px-2 text-xs")}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
