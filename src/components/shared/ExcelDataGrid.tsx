"use client";

import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ExcelColumn<T extends { id: string }> = {
  key: string;
  label: string;
  width?: number;
  sticky?: boolean;
  getValue: (row: T) => string | number | boolean | null | undefined;
};

interface ExcelDataGridProps<T extends { id: string }> {
  columns: ExcelColumn<T>[];
  rows: T[];
  emptyTitle?: string;
  maxHeightClassName?: string;
}

type ActiveFilters = Record<string, string[]>;

export function ExcelDataGrid<T extends { id: string }>({
  columns,
  rows,
  emptyTitle = "No records found",
  maxHeightClassName = "max-h-[68vh]",
}: ExcelDataGridProps<T>) {
  const [filters, setFilters] = useState<ActiveFilters>({});
  const fixedColumns = useMemo(() => columns.filter((column) => column.sticky), [columns]);
  const scrollColumns = useMemo(() => columns.filter((column) => !column.sticky), [columns]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      columns.every((column) => {
        const selected = filters[column.key] ?? [];
        if (!selected.length) return true;
        return selected.includes(formatCellValue(column.getValue(row)));
      }),
    );
  }, [columns, filters, rows]);

  return (
    <div className="rounded-lg border border-border/70 bg-card">
      <div className="border-b border-border/70 px-3 py-2 text-xs text-muted-foreground">
        Showing {filteredRows.length} of {rows.length} records
      </div>
      <div className={cn("overflow-y-auto", maxHeightClassName)}>
        <div className="flex min-w-0">
          {fixedColumns.length ? (
            <div className="shrink-0 border-r border-border/70">
              <ExcelTable
                columns={fixedColumns}
                rows={filteredRows}
                allRows={rows}
                filters={filters}
                setFilters={setFilters}
                emptyTitle={emptyTitle}
                emptyColSpan={columns.length}
                fixed
                hideEmptyState
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1 overflow-x-auto">
            <ExcelTable
              columns={scrollColumns}
              rows={filteredRows}
              allRows={rows}
              filters={filters}
              setFilters={setFilters}
              emptyTitle={emptyTitle}
              emptyColSpan={Math.max(scrollColumns.length, 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExcelTable<T extends { id: string }>({
  columns,
  rows,
  allRows,
  filters,
  setFilters,
  emptyTitle,
  emptyColSpan,
  fixed,
  hideEmptyState,
}: {
  columns: ExcelColumn<T>[];
  rows: T[];
  allRows: T[];
  filters: ActiveFilters;
  setFilters: Dispatch<SetStateAction<ActiveFilters>>;
  emptyTitle: string;
  emptyColSpan: number;
  fixed?: boolean;
  hideEmptyState?: boolean;
}) {
  return (
    <table className={cn("border-separate border-spacing-0 text-sm", fixed ? "w-max" : "min-w-max")}>
      <thead>
        <tr>
          {columns.map((column) => {
            const width = column.width ?? 140;
            const isFiltered = Boolean(filters[column.key]?.length);

            return (
              <th
                key={column.key}
                style={{ width, minWidth: width }}
                className="sticky top-0 z-20 h-12 border-b border-r border-border/70 bg-secondary/90 px-2 py-2 text-left align-top text-xs font-semibold text-muted-foreground"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="leading-snug">{column.label}</span>
                  <ColumnFilter
                    column={column}
                    rows={allRows}
                    selected={filters[column.key] ?? []}
                    active={isFiltered}
                    onApply={(values) =>
                      setFilters((current) => ({
                        ...current,
                        [column.key]: values,
                      }))
                    }
                  />
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((row) => (
            <tr key={row.id} className="bg-card hover:bg-muted/30">
              {columns.map((column) => {
                const width = column.width ?? 140;
                const value = formatCellValue(column.getValue(row));

                return (
                  <td
                    key={column.key}
                    style={{ width, minWidth: width }}
                    className={cn(
                      "h-10 border-b border-r border-border/55 px-2 py-2 text-sm font-normal text-foreground",
                      fixed && "font-medium",
                    )}
                    title={value}
                  >
                    <span className="block max-w-full truncate">{value}</span>
                  </td>
                );
              })}
            </tr>
          ))
        ) : hideEmptyState ? null : (
          <tr>
            <td
              colSpan={emptyColSpan}
              className="px-3 py-10 text-center text-sm text-muted-foreground"
            >
              {emptyTitle}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function ColumnFilter<T extends { id: string }>({
  column,
  rows,
  selected,
  active,
  onApply,
}: {
  column: ExcelColumn<T>;
  rows: T[];
  selected: string[];
  active: boolean;
  onApply: (values: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);

  const values = useMemo(() => {
    const unique = Array.from(
      new Set(rows.map((row) => formatCellValue(column.getValue(row)))),
    );
    return unique
      .filter((value) => value.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  }, [column, rows, search]);

  const toggleValue = (value: string) => {
    setDraft((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Filter ${column.label}`}
            className={cn(
              "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
              active && "border-primary/30 bg-primary/10 text-primary",
            )}
          >
            <FunnelSimpleIcon size={13} />
          </button>
        }
      />
      <PopoverContent align="end" className="w-72">
        <div className="space-y-2">
          <div>
            <p className="text-xs font-semibold text-foreground">{column.label}</p>
            <p className="text-[11px] text-muted-foreground">Select values to show</p>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search values..."
            className="h-8"
          />
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-1">
            {values.map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={draft.includes(value)}
                  onChange={() => toggleValue(value)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span className="truncate" title={value}>{value}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setDraft([]);
                onApply([]);
              }}
            >
              Clear
            </Button>
            <Button type="button" size="sm" onClick={() => onApply(draft)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function formatCellValue(value: string | number | boolean | null | undefined) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return "-";
  const text = String(value).trim();
  return text || "-";
}
