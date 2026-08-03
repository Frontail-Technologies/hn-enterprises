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
  render?: (row: T) => ReactNode;
};

interface ExcelDataGridProps<T extends { id: string }> {
  columns: ExcelColumn<T>[];
  rows: T[];
  emptyTitle?: string;
  isLoading?: boolean;
  maxHeightClassName?: string;
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string | undefined;
}

type ActiveFilters = Record<string, string[]>;

export function ExcelDataGrid<T extends { id: string }>({
  columns,
  rows,
  emptyTitle = "No records found",
  isLoading,
  maxHeightClassName = "max-h-[68vh]",
  onRowClick,
  getRowClassName,
}: ExcelDataGridProps<T>) {
  const [filters, setFilters] = useState<ActiveFilters>({});
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomScrollRef = useRef<HTMLDivElement | null>(null);
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
      { offsets: [], offset: 0 },
    ).offsets;
  }, [columns, isMobile]);
  const fixedWidth = useMemo(
    () =>
      isMobile
        ? 0
        : columns.reduce(
            (sum, column) => (column.sticky ? sum + (column.width ?? 140) : sum),
            0,
          ),
    [columns, isMobile],
  );
  const canScrollHorizontally = scrollMetrics.scrollWidth > scrollMetrics.clientWidth + 4;

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      columns.every((column) => {
        const selected = filters[column.key] ?? [];
        if (!selected.length) return true;
        return selected.includes(formatCellValue(column.getValue(row)));
      }),
    );
  }, [columns, filters, rows]);

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

  function syncBottomScrollbar(scrollLeft: number) {
    const bottom = bottomScrollRef.current;
    if (!bottom || syncingRef.current) return;

    syncingRef.current = true;
    bottom.scrollLeft = scrollLeft;
    requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  }

  function syncMainScrollbar(scrollLeft: number) {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea || syncingRef.current) return;

    syncingRef.current = true;
    scrollArea.scrollLeft = scrollLeft;
    requestAnimationFrame(() => {
      syncingRef.current = false;
    });
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
      syncBottomScrollbar(scrollArea.scrollLeft);
      holdFrameRef.current = requestAnimationFrame(step);
    };

    holdFrameRef.current = requestAnimationFrame(step);
  }

  return (
    <div className="rounded-lg border border-border/70 bg-white">
      <div className="border-b border-border/70 px-3 py-2 text-xs text-muted-foreground">
        Showing {filteredRows.length} of {rows.length} records
      </div>
      <div className={cn("group/excel-grid relative overflow-y-auto", maxHeightClassName)}>
        <div
          ref={scrollAreaRef}
          className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => syncBottomScrollbar(event.currentTarget.scrollLeft)}
        >
          <ExcelTable
            columns={columns}
            stickyOffsets={stickyOffsets}
            rows={filteredRows}
            allRows={rows}
            filters={filters}
            setFilters={setFilters}
            emptyTitle={emptyTitle}
            isLoading={isLoading}
            emptyColSpan={columns.length}
            onRowClick={onRowClick}
            getRowClassName={getRowClassName}
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
      {canScrollHorizontally ? (
        <div className="border-t border-border/70 bg-white py-1">
          <div
            ref={bottomScrollRef}
            className="h-4 overflow-x-auto overflow-y-hidden"
            style={{ marginLeft: fixedWidth || undefined }}
            onScroll={(event) => syncMainScrollbar(event.currentTarget.scrollLeft)}
          >
            <div
              aria-hidden="true"
              style={{ width: scrollMetrics.scrollWidth, height: 1 }}
            />
          </div>
        </div>
      ) : null}
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
}) {
  return (
    <table className="min-w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr>
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
                  "sticky top-0 z-20 h-12 border-b border-r border-border/70 bg-secondary px-2 py-2 text-left align-top text-xs font-semibold text-muted-foreground",
                  isSticky && "z-30 border-r-primary/30 bg-secondary text-foreground shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
                )}
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
        {isLoading ? (
          <tr>
            <td colSpan={emptyColSpan} className="px-3 py-10 text-center">
              <LoadingSpinner size="sm" />
            </td>
          </tr>
        ) : rows.length ? (
          rows.map((row) => (
            <tr key={row.id} className={cn("group/excel-row bg-white hover:bg-muted/30", onRowClick && "cursor-pointer", getRowClassName?.(row))} onClick={() => onRowClick?.(row)}>
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
                      "h-10 border-b border-r border-border/55 bg-white px-2 py-2 text-sm font-normal text-foreground group-hover/excel-row:bg-muted/30",
                      isSticky && "sticky z-10 border-r-primary/25 bg-secondary font-semibold group-hover/excel-row:bg-secondary shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
                    )}
                    title={value}
                  >
                    {rendered !== undefined && rendered !== null ? (
                      rendered
                    ) : (
                      <span className="block max-w-full truncate">{value}</span>
                    )}
                  </td>
                );
              })}
            </tr>
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

function formatCellValue(value: string | number | boolean | null | undefined) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return "-";
  const text = String(value).trim();
  return text || "-";
}

