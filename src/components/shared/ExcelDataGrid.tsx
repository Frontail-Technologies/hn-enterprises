"use client";

import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  FunnelSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
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
  getFilterGroups?: (row: T) => string[];
  render?: (row: T) => ReactNode;
};

// Opt-in row-selection support (bulk operations toolbar) - a caller passes
// `selection` to get a leading checkbox column; grids that don't pass it are
// completely unaffected (no column added, no behavior change). Kept as a
// bundled object rather than loose props so it reads as one clearly-optional
// feature rather than four easy-to-half-wire props.
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
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string | undefined;
  selection?: ExcelDataGridSelection<T>;
  /**
   * Fired whenever the filtered/paginated id sets change (filtering,
   * pagination, or the underlying rows themselves) so a caller driving bulk
   * selection can know "every id matching the current filters" (for a
   * "select all N matching" banner) and "ids on the current page" (for the
   * header checkbox's tri-state), plus a signature that changes only when
   * the active filters change (not on pagination) for the "clear selection
   * when filters change" rule.
   */
  onVisibleRowsChange?: (context: {
    filteredIds: string[];
    pageIds: string[];
    filterSignature: string;
  }) => void;
}

type ActiveFilters = Record<string, string[]>;

const SELECT_COLUMN_WIDTH = 44;

export function ExcelDataGrid<T extends { id: string }>({
  columns,
  rows,
  emptyTitle = "No records found",
  isLoading,
  maxHeightClassName = "max-h-[68vh]",
  onRowClick,
  getRowClassName,
  selection,
  onVisibleRowsChange,
}: ExcelDataGridProps<T>) {
  const [filters, setFilters] = useState<ActiveFilters>({});
  const [page, setPage] = useState(1);
  const pageSize = 100;
  
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const holdFrameRef = useRef<number | null>(null);
  const syncingRef = useRef(false);
  const [scrollMetrics, setScrollMetrics] = useState({
    scrollWidth: 0,
    clientWidth: 0,
  });
  // Pinned/sticky columns eat a large share of the viewport on small screens, leaving little
  // room for the rest of the table, so columns aren't fixed there - the whole table just scrolls.
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
  const fixedWidth = useMemo(
    () =>
      isMobile
        ? 0
        : columns.reduce(
            (sum, column) => (column.sticky ? sum + (column.width ?? 140) : sum),
            selection ? SELECT_COLUMN_WIDTH : 0,
          ),
    [columns, isMobile, selection],
  );
  const canScrollHorizontally = scrollMetrics.scrollWidth > scrollMetrics.clientWidth + 4;

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

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredRows, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  // Sorted so the signature only changes when the *set* of active filter
  // values changes, not key insertion order.
  const filterSignature = useMemo(() => {
    const entries = Object.entries(filters)
      .filter(([, values]) => values.length > 0)
      .map(([key, values]) => [key, [...values].sort()] as const)
      .sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(entries);
  }, [filters]);

  useEffect(() => {
    if (!onVisibleRowsChange) return;
    onVisibleRowsChange({
      filteredIds: filteredRows.map((row) => row.id),
      pageIds: paginatedRows.map((row) => row.id),
      filterSignature,
    });
  }, [filteredRows, paginatedRows, filterSignature, onVisibleRowsChange]);

  const updateScrollMetrics = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    setScrollMetrics({
      scrollWidth: scrollArea.scrollWidth,
      clientWidth: scrollArea.clientWidth,
    });
  }, []);

  useEffect(() => {
    updateScrollMetrics();
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const observer = new ResizeObserver(updateScrollMetrics);
    observer.observe(scrollArea);
    return () => observer.disconnect();
  }, [columns.length, filteredRows.length, updateScrollMetrics]);

  function syncMainScrollbar(scrollLeft: number) {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    scrollArea.scrollLeft = scrollLeft;
  }

  function stopHoldScroll() {
    if (holdFrameRef.current == null) return;
    cancelAnimationFrame(holdFrameRef.current);
    holdFrameRef.current = null;
  }

  function startHoldScroll(direction: "left" | "right") {
    stopHoldScroll();

    const step = () => {
      const scrollArea = scrollAreaRef.current;
      if (!scrollArea) return;

      scrollArea.scrollBy({
        left: direction === "left" ? -18 : 18,
        behavior: "auto",
      });
      holdFrameRef.current = requestAnimationFrame(step);
    };

    holdFrameRef.current = requestAnimationFrame(step);
  }

  return (
    <div className="rounded-card border border-border bg-card flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border px-4 py-3 shrink-0">
        <div className="text-xs font-medium text-muted-foreground">
          Showing {Math.min(filteredRows.length, (page - 1) * pageSize + 1)} to {Math.min(filteredRows.length, page * pageSize)} of {filteredRows.length} filtered records {filteredRows.length !== rows.length ? `(from ${rows.length} total)` : ""}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
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
              className="h-8 px-2.5 text-xs"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </Button>
          </div>
        )}
      </div>
      <div className={cn("group/excel-grid relative flex flex-col", maxHeightClassName)}>
        <div
          ref={scrollAreaRef}
          className="min-w-0 flex-1 overflow-auto"
        >
          <ExcelTable
            columns={columns}
            stickyOffsets={stickyOffsets}
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

        {canScrollHorizontally ? (
          <>
            <HoldScrollButton
              direction="left"
              onStart={() => startHoldScroll("left")}
              onStop={stopHoldScroll}
            />
            <HoldScrollButton
              direction="right"
              onStart={() => startHoldScroll("right")}
              onStop={stopHoldScroll}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

function HoldScrollButton({
  direction,
  onStart,
  onStop,
}: {
  direction: "left" | "right";
  onStart: () => void;
  onStop: () => void;
}) {
  const Icon = direction === "left" ? CaretLeftIcon : CaretRightIcon;

  return (
    <button
      type="button"
      title={`Hold to scroll ${direction}`}
      aria-label={`Hold to scroll ${direction}`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onStart();
      }}
      onPointerUp={onStop}
      onPointerCancel={onStop}
      onPointerLeave={onStop}
      className={cn(
        "absolute top-1/2 z-30 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-sm border border-border/70 bg-white text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-primary focus-visible:opacity-100 group-hover/excel-grid:opacity-100",
        direction === "left" ? "left-2" : "right-2",
      )}
    >
      <Icon size={18} weight="bold" />
    </button>
  );
}

function ExcelTable<T extends { id: string }>({
  columns,
  stickyOffsets,
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

  return (
    <table className="min-w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr>
          {selection && (
            <th
              style={{ minWidth: SELECT_COLUMN_WIDTH, width: SELECT_COLUMN_WIDTH, left: 0 }}
              className="sticky top-0 left-0 z-30 h-10.5 border-b border-border bg-secondary px-0 py-2 text-center align-middle shadow-[6px_0_12px_-12px_hsl(var(--foreground))]"
            >
              <Checkbox
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
                  "sticky top-0 z-20 h-10.5 border-b border-border bg-secondary px-3 py-2 text-left align-middle text-xs font-semibold text-muted-foreground",
                  isSticky && "z-30 bg-secondary text-foreground shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
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
            <td colSpan={emptyColSpan} className="px-3 py-10 text-center">
              <LoadingSpinner size="sm" />
            </td>
          </tr>
        ) : rows.length ? (
          rows.map((row) => {
            const isRowSelected = Boolean(selection?.selectedIds.has(row.id));
            return (
            <tr key={row.id} className={cn("group/excel-row bg-white hover:bg-muted/30", onRowClick && "cursor-pointer", getRowClassName?.(row))} onClick={() => onRowClick?.(row)}>
              {selection && (
                <td
                  style={{ minWidth: SELECT_COLUMN_WIDTH, width: SELECT_COLUMN_WIDTH, left: 0 }}
                  className="sticky left-0 z-10 h-11 border-b border-border/60 bg-secondary px-0 py-2 text-center group-hover/excel-row:bg-secondary shadow-[6px_0_12px_-12px_hsl(var(--foreground))]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={isRowSelected}
                    onCheckedChange={() => selection.onToggleRow(row.id)}
                    aria-label={selection.getRowLabel?.(row) ?? (isRowSelected ? "Deselect row" : "Select row")}
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
                      "h-11 border-b border-border/60 px-3 py-2 text-sm font-normal text-foreground",
                      isSticky && "sticky z-10 bg-secondary font-semibold group-hover/excel-row:bg-secondary shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
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
          })
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

const EMPTY_VALUE = "—"; // em-dash, rendered muted

function formatCellValue(value: string | number | boolean | null | undefined) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return EMPTY_VALUE;
  const text = String(value).trim();
  return text || EMPTY_VALUE;
}

