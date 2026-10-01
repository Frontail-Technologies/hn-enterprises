"use client";

import {
  memo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { tableDensity } from "@/components/shared/table/density";
import { useFullViewActive } from "@/components/shared/table/FullViewContext";
import { FullViewPortal } from "@/components/shared/table/FullViewPortal";
import { FullViewToggleButton } from "@/components/shared/table/FullViewToggleButton";
import { TableScrollNav } from "@/components/shared/table/TableScrollNav";
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
  grow?: boolean;
  getValue: (row: T) => string | number | boolean | null | undefined;
  getFilterGroups?: (row: T) => string[];
  render?: (row: T) => ReactNode;
};

export interface ExcelDataGridSelection<T extends { id: string }> {
  selectedIds: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  onTogglePage: (pageIds: string[]) => void;
  getRowLabel?: (row: T) => string;
}

interface ExcelDataGridProps<T extends { id: string }> {
  columns: ExcelColumn<T>[];
  rows: T[];
  emptyTitle?: string;
  isLoading?: boolean;
  maxHeightClassName?: string;
  fillHeight?: boolean;
  enableFullView?: boolean;
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string | undefined;
  selection?: ExcelDataGridSelection<T>;
  onVisibleRowsChange?: (context: {
    filteredIds: string[];
    pageIds: string[];
    filterSignature: string;
  }) => void;
}

type ActiveFilters = Record<string, string[]>;

const SELECT_COLUMN_WIDTH = 52;

export function ExcelDataGrid<T extends { id: string }>({
  columns,
  rows,
  emptyTitle = "No records found",
  isLoading,
  maxHeightClassName = "max-h-[68vh]",
  fillHeight = false,
  enableFullView = false,
  onRowClick,
  getRowClassName,
  selection,
  onVisibleRowsChange,
}: ExcelDataGridProps<T>) {
  const [fullView, setFullView] = useState(false);
  const inheritedFullView = useFullViewActive();
  const isFullViewActive = fullView || inheritedFullView;
  const effectiveFillHeight = fillHeight || isFullViewActive;

  const [filters, setFilters] = useState<ActiveFilters>({});
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const stickyOffsets = useMemo(() => {
    if (isMobile) return columns.map(() => undefined);

    return columns.reduce<{
      offsets: Array<number | undefined>;
      offset: number;
    }>(
      (state, column) => {
        if (!column.sticky) {
          return {
            ...state,
            offsets: [...state.offsets, undefined],
          };
        }

        return {
          offsets: [...state.offsets, state.offset],
          offset: state.offset + (column.width ?? 140),
        };
      },
      { offsets: [], offset: selection ? SELECT_COLUMN_WIDTH : 0 },
    ).offsets;
  }, [columns, isMobile, selection]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      columns.every((column) => {
        const filterValues = filters[column.key];
        if (!filterValues?.length) return true;
        
        if (column.getFilterGroups) {
          const groups = column.getFilterGroups(row);
          return groups.some(g => filterValues.includes(g));
        }

        const cellValue = formatCellValue(column.getValue(row));
        return filterValues.includes(cellValue);
      })
    );
  }, [columns, filters, rows]);

  const [lastFilters, setLastFilters] = useState(filters);
  if (filters !== lastFilters) {
    setLastFilters(filters);
    setPage(1);
  }

  const paginatedRows = useMemo(() => {
    return filteredRows.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredRows, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const filterSignature = useMemo(() => {
    const entries = Object.entries(filters)
      .filter(([, values]) => values.length > 0)
      .map(([key, values]) => [key, [...values].sort()] as const)
      .sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(entries);
  }, [filters]);

  const lastVisibleSignatureRef = useRef<string | null>(null);
  useEffect(() => {
    if (!onVisibleRowsChange) return;
    const filteredIds = filteredRows.map((row) => row.id);
    const pageIds = paginatedRows.map((row) => row.id);
    const signature = `${filterSignature}|${filteredIds.join(",")}|${pageIds.join(",")}`;
    if (lastVisibleSignatureRef.current === signature) return;
    lastVisibleSignatureRef.current = signature;
    onVisibleRowsChange({ filteredIds, pageIds, filterSignature });
  }, [filteredRows, paginatedRows, filterSignature, onVisibleRowsChange]);

  if (!isLoading && filteredRows.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col bg-card",
          isFullViewActive ? "rounded-none" : "rounded-card border border-border",
        )}
      >
        <EmptyState title={emptyTitle} />
      </div>
    );
  }

  return (
    <FullViewPortal active={fullView} onExit={() => setFullView(false)}>
      <div
        className={cn(
          "flex flex-col bg-card",
          isFullViewActive ? "rounded-none" : "rounded-card border border-border",
          effectiveFillHeight && "h-full min-h-0 flex-1",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border px-3 py-2 shrink-0">
          <div className="text-xs font-medium text-muted-foreground">
            Showing {Math.min(filteredRows.length, (page - 1) * pageSize + 1)} to {Math.min(filteredRows.length, page * pageSize)} of {filteredRows.length} filtered records {filteredRows.length !== rows.length ? `(from ${rows.length} total)` : ""}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {enableFullView ? (
              <FullViewToggleButton active={fullView} onToggle={() => setFullView((current) => !current)} />
            ) : null}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(tableDensity.pagerButtonHeight, "px-2 text-xs")}
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(tableDensity.pagerButtonHeight, "px-2 text-xs")}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <span className="px-2 text-xs font-medium text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(tableDensity.pagerButtonHeight, "px-2 text-xs")}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(tableDensity.pagerButtonHeight, "px-2 text-xs")}
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  Last
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className={cn("group/excel-grid relative flex min-h-0 flex-col", effectiveFillHeight ? "flex-1" : maxHeightClassName)}>
          <div
            ref={scrollAreaRef}
            className="min-w-0 flex-1 overflow-auto will-change-scroll"
          >
            <ExcelTable
              columns={columns}
              stickyOffsets={stickyOffsets}
              isMobile={isMobile}
              rows={paginatedRows}
              allRows={rows}
              filters={filters}
              setFilters={setFilters}
              emptyTitle={emptyTitle}
              isLoading={isLoading}
              emptyColSpan={columns.length + (selection ? 1 : 0)}
              onRowClick={onRowClick}
              getRowClassName={getRowClassName}
              selection={selection}
            />
          </div>
          <TableScrollNav scrollRef={scrollAreaRef} group="excel-grid" />
        </div>
      </div>
    </FullViewPortal>
  );
}

function ExcelTable<T extends { id: string }>({
  columns,
  stickyOffsets,
  isMobile,
  rows,
  allRows,
  filters,
  setFilters,
  emptyTitle,
  isLoading,
  emptyColSpan,
  onRowClick,
  getRowClassName,
  selection,
}: {
  columns: ExcelColumn<T>[];
  stickyOffsets: Array<number | undefined>;
  isMobile: boolean;
  rows: T[];
  allRows: T[];
  filters: ActiveFilters;
  setFilters: Dispatch<SetStateAction<ActiveFilters>>;
  emptyTitle: string;
  isLoading?: boolean;
  emptyColSpan: number;
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string | undefined;
  selection?: ExcelDataGridSelection<T>;
}) {
  const pageIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const allOnPageSelected =
    Boolean(selection) && pageIds.length > 0 && pageIds.every((id) => selection!.selectedIds.has(id));
  const someOnPageSelected =
    Boolean(selection) && !allOnPageSelected && pageIds.some((id) => selection!.selectedIds.has(id));

  const selectColumnWidth = selection ? SELECT_COLUMN_WIDTH : 0;
  const totalTableWidth = selectColumnWidth + columns.reduce((sum, column) => sum + (column.width ?? 140), 0);

  return (
    <table
      style={{ width: "100%", minWidth: totalTableWidth, tableLayout: "fixed" }}
      className="border-separate border-spacing-0 text-sm"
    >
      <colgroup>
        {selection ? <col style={{ width: selectColumnWidth }} /> : null}
        {columns.map((column) => (
          <col key={column.key} style={column.grow ? undefined : { width: column.width ?? 140 }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {selection && (
            <th
              style={{ minWidth: SELECT_COLUMN_WIDTH, width: SELECT_COLUMN_WIDTH, left: isMobile ? undefined : 0 }}
              className={cn(
                tableDensity.rowHeight,
                "top-0 z-30 border-r border-b border-r-border/40 border-b-border bg-table-header pl-2.5 pr-0 text-center align-middle",
                isMobile ? "sticky" : "sticky left-0 shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
              )}
            >
              <Checkbox
                className={tableDensity.checkboxSize}
                checked={allOnPageSelected}
                indeterminate={someOnPageSelected}
                onCheckedChange={() => selection.onTogglePage(pageIds)}
                aria-label={allOnPageSelected ? "Deselect all rows on this page" : "Select all rows on this page"}
                disabled={pageIds.length === 0}
              />
            </th>
          )}
          {columns.map((column, columnIndex) => {
            const width = column.width ?? 140;
            const isFiltered = Boolean(filters[column.key]?.length);
            const stickyOffset = stickyOffsets[columnIndex];
            const isSticky = stickyOffset !== undefined;

            return (
              <th
                key={column.key}
                style={{ minWidth: width, left: stickyOffset }}
                className={cn(
                  tableDensity.rowHeight,
                  tableDensity.headerText,
                  tableDensity.cellPaddingX,
                  tableDensity.cellPaddingY,
                  "sticky top-0 z-20 border-r border-b border-r-border/40 border-b-border bg-table-header text-left align-middle font-semibold text-muted-foreground",
                  isSticky && "z-30 bg-table-header text-foreground shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
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
        {isLoading ? (
          <tr>
            <td colSpan={emptyColSpan} className="px-3 py-16 text-center">
              <LoadingSpinner size="lg" />
            </td>
          </tr>
        ) : rows.length ? (
          rows.map((row) => (
            <ExcelTableRow
              key={row.id}
              row={row}
              columns={columns}
              stickyOffsets={stickyOffsets}
              isMobile={isMobile}
              rowClassName={getRowClassName?.(row)}
              isSelected={Boolean(selection?.selectedIds.has(row.id))}
              ariaLabel={selection?.getRowLabel?.(row)}
              onRowClick={onRowClick}
              onToggleRow={selection?.onToggleRow}
            />
          ))
        ) : (
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

function ExcelTableRowImpl<T extends { id: string }>({
  row,
  columns,
  stickyOffsets,
  isMobile,
  rowClassName,
  isSelected,
  ariaLabel,
  onRowClick,
  onToggleRow,
}: {
  row: T;
  columns: ExcelColumn<T>[];
  stickyOffsets: Array<number | undefined>;
  isMobile: boolean;
  rowClassName?: string;
  isSelected: boolean;
  ariaLabel?: string;
  onRowClick?: (row: T) => void;
  onToggleRow?: (id: string) => void;
}) {
  const hasSelection = Boolean(onToggleRow);

  return (
    <tr
      className={cn("group/excel-row bg-white hover:bg-muted/30", onRowClick && "cursor-pointer", rowClassName)}
      onClick={() => onRowClick?.(row)}
    >
      {hasSelection && (
        <td
          style={{ minWidth: SELECT_COLUMN_WIDTH, width: SELECT_COLUMN_WIDTH, left: isMobile ? undefined : 0 }}
          className={cn(
            tableDensity.rowHeight,
            "border-r border-b border-r-border/30 border-b-border/60 bg-card pl-2.5 pr-0 text-center group-hover/excel-row:bg-table-hover",
            isMobile ? undefined : "sticky left-0 z-10 shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            className={tableDensity.checkboxSize}
            checked={isSelected}
            onCheckedChange={() => onToggleRow?.(row.id)}
            aria-label={ariaLabel ?? (isSelected ? "Deselect row" : "Select row")}
          />
        </td>
      )}
      {columns.map((column, columnIndex) => {
        const width = column.width ?? 140;
        const value = formatCellValue(column.getValue(row));
        const rendered = column.render?.(row);
        const stickyOffset = stickyOffsets[columnIndex];
        const isSticky = stickyOffset !== undefined;

        return (
          <td
            key={column.key}
            style={{ minWidth: width, left: stickyOffset }}
            className={cn(
              tableDensity.rowHeight,
              tableDensity.bodyText,
              tableDensity.cellPaddingX,
              tableDensity.cellPaddingY,
              "border-r border-b border-r-border/30 border-b-border/60 font-normal text-foreground",
              isSticky && "sticky z-10 bg-card font-semibold group-hover/excel-row:bg-table-hover shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
            )}
            title={value === EMPTY_VALUE ? undefined : value}
          >
            {rendered !== undefined && rendered !== null ? (
              rendered
            ) : (
              <span
                className={cn(
                  "block max-w-full truncate",
                  value === EMPTY_VALUE && "text-muted-foreground",
                )}
              >
                {value}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

const ExcelTableRow = memo(ExcelTableRowImpl) as typeof ExcelTableRowImpl;

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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(selected);
      setSearch("");
    }
    setOpen(nextOpen);
  }

  const values = useMemo(() => {
    const unique = Array.from(
      new Set(
        rows.flatMap((row) => {
          if (column.getFilterGroups) {
            return column.getFilterGroups(row);
          }
          return [formatCellValue(column.getValue(row))];
        }),
      ),
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
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Filter ${column.label}`}
            className={cn(
              "inline-flex h-4.5 w-4.5 items-center justify-center rounded border border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
              active && "border-primary/30 bg-primary/10 text-primary",
            )}
          >
            <FunnelSimpleIcon size={12} />
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
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const EMPTY_VALUE = "—";

function formatCellValue(value: string | number | boolean | null | undefined) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return EMPTY_VALUE;
  const text = String(value).trim();
  return text || EMPTY_VALUE;
}

