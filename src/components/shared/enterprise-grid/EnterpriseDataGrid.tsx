"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  useTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  FunnelSimpleIcon,
  CaretDownIcon,
  CaretUpIcon,
} from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, type EmptyIllustrationName } from "@/components/shared/EmptyState";
import { tableDensity } from "@/components/shared/table/density";
import { useFullViewActive } from "@/components/shared/table/FullViewContext";
import { FullViewPortal } from "@/components/shared/table/FullViewPortal";
import { FullViewToggleButton } from "@/components/shared/table/FullViewToggleButton";
import { TableScrollNav } from "@/components/shared/table/TableScrollNav";
import { cn, pluralize } from "@/lib/utils";
import {
  enterpriseGridFeatures,
  type EnterpriseGridFeatures,
} from "./features";
import type { EnterpriseColumn } from "./types";

// Keep in sync with tableDensity.rowHeight (h-9.5 = 38px, DS-TABLE).
const ROW_HEIGHT = 38;
const SELECT_COLUMN_ID = "__select__";
const SELECT_COLUMN_WIDTH = 44;
const ACTIONS_COLUMN_ID = "__actions__";
const LEGACY_PIN_COUNT = 4;
const OVERSCAN = 10;
const EMPTY_VALUE = "—";

const INTERACTIVE_TARGET_SELECTOR =
  "button, a, input, [role='checkbox'], [role='button'], [data-slot='checkbox'], [data-row-ignore-click]";

function isInteractiveClickTarget(target: EventTarget | null): boolean {
  return target instanceof Element
    ? Boolean(target.closest(INTERACTIVE_TARGET_SELECTOR))
    : false;
}

function formatCellValue(value: string | number | boolean | null | undefined) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return EMPTY_VALUE;
  const text = String(value).trim();
  return text || EMPTY_VALUE;
}

interface EnterpriseDataGridProps<T extends { id: string }> {
  columns: EnterpriseColumn<T>[];
  data: T[];
  emptyTitle?: string;
  emptyIllustration?: EmptyIllustrationName;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  fillHeight?: boolean;
  maxHeightClassName?: string;
  enableFullView?: boolean;
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string | undefined;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;
  getRowLabel?: (row: T) => string;
  onVisibleRowsChange?: (context: {
    filteredIds: string[];
    filterSignature: string;
  }) => void;
  itemLabel?: string;
  /**
   * Optional externally-controlled sort (mirrors rowSelection/onRowSelectionChange
   * above) - pass both together to drive real server-side sorting instead of the
   * grid's own local in-memory sort. When provided, only columns listed in
   * `sortableColumnKeys` render as sortable; every other column's header sort
   * affordance is disabled rather than silently sorting just the current page.
   * Omit both to keep the default fully-local sort behavior.
   */
  sorting?: SortingState;
  onSortingChange?: (next: SortingState) => void;
  sortableColumnKeys?: string[];
  /**
   * Optional externally-controlled column filters (same mirrored pattern as
   * sorting above) - pass both together so a parent can read the currently
   * selected Excel-filter values (e.g. to send them to a server query) and/or
   * reset them. The grid's own filtering behavior on `data` is unchanged
   * either way; this only makes the selection observable/settable from
   * outside. Omit both to keep the state fully internal as before.
   */
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (next: ColumnFiltersState) => void;
  /** false = no own border/radius, for use inside a framed card (ListTable). */
  framed?: boolean;
  /** Replaces the default empty state when `data` is empty. */
  emptyState?: ReactNode;
  /** Renders a per-row actions cell, kept visible on the right edge. */
  renderRowActions?: (row: T) => ReactNode;
  rowActionsWidth?: number;
  /** Controlled Full View (pass both to drive it from outside, e.g. a toolbar toggle). */
  fullView?: boolean;
  onFullViewChange?: (next: boolean) => void;
  /** Show the count + Full View bar above the grid. Default true; it always shows inside Full View. */
  showSummaryBar?: boolean;
}

export function EnterpriseDataGrid<T extends { id: string }>({
  columns,
  data,
  emptyTitle = "No records found",
  emptyIllustration,
  isLoading,
  isError,
  onRetry,
  fillHeight = false,
  maxHeightClassName,
  enableFullView = false,
  onRowClick,
  getRowClassName,
  rowSelection,
  onRowSelectionChange,
  getRowLabel,
  onVisibleRowsChange,
  itemLabel = "record",
  sorting: externalSorting,
  onSortingChange: onExternalSortingChange,
  sortableColumnKeys,
  columnFilters: externalColumnFilters,
  onColumnFiltersChange: onExternalColumnFiltersChange,
  framed = true,
  emptyState,
  renderRowActions,
  rowActionsWidth = 96,
  fullView: externalFullView,
  onFullViewChange,
  showSummaryBar = true,
}: EnterpriseDataGridProps<T>) {
  const [internalFullView, setInternalFullView] = useState(false);
  const isExternalFullView = externalFullView !== undefined && onFullViewChange !== undefined;
  const fullView = isExternalFullView ? externalFullView : internalFullView;
  const setFullView = (next: boolean | ((current: boolean) => boolean)) => {
    const value = typeof next === "function" ? next(fullView) : next;
    if (isExternalFullView) onFullViewChange!(value);
    else setInternalFullView(value);
  };
  const inheritedFullView = useFullViewActive();
  const isFullViewActive = fullView || inheritedFullView;
  const effectiveFillHeight = fillHeight || isFullViewActive;

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([]);
  const isExternalColumnFilters = externalColumnFilters !== undefined && onExternalColumnFiltersChange !== undefined;
  const columnFilters = isExternalColumnFilters ? externalColumnFilters : internalColumnFilters;
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const isExternalSort = externalSorting !== undefined && onExternalSortingChange !== undefined;
  const sorting = isExternalSort ? externalSorting : internalSorting;
  const enableSelection = rowSelection !== undefined;

  const pinnedStart = useMemo(() => {
    // Columns marked `pin` are pinned; grids that mark none keep the original
    // first-four pinning.
    const explicit = columns.filter((column) => column.pin);
    const businessPins = (explicit.length ? explicit : columns.slice(0, LEGACY_PIN_COUNT)).map((column) => column.key);
    return enableSelection ? [SELECT_COLUMN_ID, ...businessPins] : businessPins;
  }, [columns, enableSelection]);

  // Pinning is visually/functionally disabled on mobile (narrow tables are
  // unusable with a frozen column boundary) without touching the desktop
  // pin configuration above - `pinnedStart` stays computed exactly as
  // before, so resizing back to desktop restores it immediately.
  const isMobile = useIsMobile();

  const tableColumns = useMemo<ColumnDef<EnterpriseGridFeatures, T>[]>(() => {
    const defs: ColumnDef<EnterpriseGridFeatures, T>[] = [];

    if (enableSelection) {
      defs.push({
        id: SELECT_COLUMN_ID,
        header: () => null,
        cell: () => null,
        size: SELECT_COLUMN_WIDTH,
        minSize: SELECT_COLUMN_WIDTH,
        maxSize: SELECT_COLUMN_WIDTH,
        enableResizing: false,
        enableSorting: false,
      });
    }

    for (const column of columns) {
      defs.push({
        id: column.key,
        accessorFn: (row: T) => column.getValue(row),
        header: column.label,
        size: column.width ?? 140,
        minSize: column.minWidth ?? 60,
        maxSize: column.maxWidth,
        enableResizing: column.enableResizing ?? true,
        enableSorting: isExternalSort
          ? (sortableColumnKeys?.includes(column.key) ?? false)
          : (column.enableSorting ?? true),
        enableColumnFilter: column.filterable ?? true,
        sortFn: "alphanumeric",
        filterFn: (row, _columnId, filterValue: string[]) => {
          if (!filterValue?.length) return true;
          if (column.getFilterGroups) {
            const groups = column.getFilterGroups(row.original);
            return groups.some((group) => filterValue.includes(group));
          }
          return filterValue.includes(
            formatCellValue(column.getValue(row.original)),
          );
        },
        cell: ({ row }) =>
          column.render
            ? column.render(row.original)
            : formatCellValue(column.getValue(row.original)),
        meta: { grow: column.grow },
      });
    }

    if (renderRowActions) {
      defs.push({
        id: ACTIONS_COLUMN_ID,
        header: () => null,
        cell: () => null,
        size: rowActionsWidth,
        minSize: rowActionsWidth,
        maxSize: rowActionsWidth,
        enableResizing: false,
        enableSorting: false,
        enableColumnFilter: false,
      });
    }

    return defs;
  }, [columns, enableSelection, isExternalSort, sortableColumnKeys, renderRowActions, rowActionsWidth]);

  const table = useTable({
    features: enterpriseGridFeatures,
    columns: tableColumns,
    data,
    getRowId: (row: T) => row.id,
    state: {
      columnFilters,
      sorting,
      rowSelection: rowSelection ?? {},
      columnPinning: isMobile ? { start: [], end: [] } : { start: pinnedStart, end: [] },
    },
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === "function" ? updater(columnFilters) : updater;
      if (isExternalColumnFilters) onExternalColumnFiltersChange!(next);
      else setInternalColumnFilters(next);
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (isExternalSort) onExternalSortingChange!(next);
      else setInternalSorting(next);
    },
    onRowSelectionChange: (updater) => {
      if (!onRowSelectionChange) return;
      const current = rowSelection ?? {};
      onRowSelectionChange(
        typeof updater === "function" ? updater(current) : updater,
      );
    },
    columnResizeMode: "onChange",
    enableRowSelection: enableSelection,
  });

  const rows = table.getRowModel().rows;
  const startPinnedCount = table.getStartVisibleLeafColumns().length;

  const totalCount = data.length;
  const visibleCount = rows.length;
  const resultSummaryText =
    visibleCount === totalCount
      ? `${totalCount} ${pluralize(itemLabel, totalCount)}`
      : `${visibleCount} of ${totalCount} ${pluralize(itemLabel)}`;

  const filterSignature = useMemo(
    () => JSON.stringify(columnFilters),
    [columnFilters],
  );
  const lastSignatureRef = useRef<string | null>(null);
  useEffect(() => {
    if (!onVisibleRowsChange) return;
    const filteredIds = rows.map((row) => row.original.id);
    const signature = `${filterSignature}|${filteredIds.join(",")}`;
    if (lastSignatureRef.current === signature) return;
    lastSignatureRef.current = signature;
    onVisibleRowsChange({ filteredIds, filterSignature });
  }, [filterSignature, rows, onVisibleRowsChange]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan: OVERSCAN,
  });

  const allOnPageSelected =
    enableSelection &&
    rows.length > 0 &&
    rows.every((row) => rowSelection?.[row.id]);
  const someOnPageSelected =
    enableSelection &&
    !allOnPageSelected &&
    rows.some((row) => rowSelection?.[row.id]);

  function toggleAllVisible() {
    if (!onRowSelectionChange) return;
    const next = { ...(rowSelection ?? {}) };
    for (const row of rows) {
      if (allOnPageSelected) delete next[row.id];
      else next[row.id] = true;
    }
    onRowSelectionChange(next);
  }

  function toggleRow(id: string) {
    if (!onRowSelectionChange) return;
    const next = { ...(rowSelection ?? {}) };
    if (next[id]) delete next[id];
    else next[id] = true;
    onRowSelectionChange(next);
  }

  const showLoading = Boolean(isLoading);
  const showError = !showLoading && isError && data.length === 0;
  // Only an empty dataset replaces the grid. When column filters hide every
  // row the header stays (with a message below it) so filters can be cleared.
  const showEmpty = !showLoading && !showError && data.length === 0;
  const filteredToNothing = !showLoading && !showError && data.length > 0 && rows.length === 0;
  // An empty/error grid shrinks to its message instead of stretching a blank
  // card down the page (Full View still fills the screen).
  const stretch = effectiveFillHeight && (isFullViewActive || !(showEmpty || showError));

  const gridBody = (
    <div
      className={cn(
        "flex flex-col bg-card",
        isFullViewActive || !framed ? "rounded-none" : "rounded-card border border-border",
        stretch && "h-full min-h-0 flex-1",
      )}
    >
      {enableFullView && (showSummaryBar || isFullViewActive) ? (
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-1.5">
          <span className="text-[13px] text-muted-foreground">
            {resultSummaryText}
          </span>
          <FullViewToggleButton
            active={fullView}
            onToggle={() => setFullView((current) => !current)}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "group/enterprise-grid relative flex min-h-0 flex-col",
          stretch
            ? "flex-1"
            : (maxHeightClassName ?? "max-h-[68vh]"),
        )}
      >
        {showLoading ? (
          <div aria-busy="true" aria-label="Loading records">
            <div className={cn(tableDensity.headerBg, tableDensity.rowHeight, "border-b border-border")} />
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className={cn("flex items-center gap-6 border-b border-border px-3", tableDensity.rowHeight)}>
                <Skeleton className="h-3 w-40 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-3 w-32 rounded-full" />
                <Skeleton className="hidden h-3 w-20 rounded-full md:block" />
              </div>
            ))}
          </div>
        ) : showError ? (
          <EmptyState
            illustration="error"
            title="Couldn't load records"
            description="Check your connection and try again."
            action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
          />
        ) : showEmpty ? (
          (emptyState ?? <EmptyState title={emptyTitle} illustration={emptyIllustration} />)
        ) : (
          <>
            <div
              ref={scrollAreaRef}
              className="min-w-0 flex-1 overflow-auto will-change-scroll"
            >
              <div style={{ width: table.getTotalSize(), minWidth: "100%" }}>
                <div className="sticky top-0 z-20">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <div key={headerGroup.id} className="flex">
                      {headerGroup.headers.map((header) => {
                        const column = header.column;
                        const pinned = column.getIsPinned();
                        const canSort = column.getCanSort();
                        const sorted = column.getIsSorted();
                        const isSelectColumn = header.id === SELECT_COLUMN_ID;
                        const isPinnedRegionEnd = isLastPinnedStartColumn(
                          column,
                          startPinnedCount,
                        );

                        if (header.id === ACTIONS_COLUMN_ID) {
                          return (
                            <div
                              key={header.id}
                              style={actionsStyle(rowActionsWidth)}
                              className={cn(tableDensity.rowHeight, tableDensity.headerBg, "z-30 border-b border-l border-border")}
                            >
                              <span className="sr-only">Actions</span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={header.id}
                            style={{ ...pinnedStyle(column, pinned), flexGrow: growOf(column) }}
                            className={cn(
                              tableDensity.rowHeight,
                              tableDensity.headerText,
                              tableDensity.cellPaddingX,
                              tableDensity.headerBg,
                              "flex shrink-0 items-center gap-1 border-r border-b font-semibold",
                              tableDensity.cellDividerColor,
                              tableDensity.headerText2,
                              "border-b-border",
                              pinned && "z-30 text-foreground",
                              isPinnedRegionEnd &&
                                tableDensity.pinnedRegionDivider,
                            )}
                          >
                            {isSelectColumn ? (
                              <Checkbox
                                className={tableDensity.checkboxSize}
                                checked={allOnPageSelected}
                                indeterminate={someOnPageSelected}
                                onCheckedChange={toggleAllVisible}
                                onClick={(event) => event.stopPropagation()}
                                aria-label={
                                  allOnPageSelected
                                    ? "Deselect all rows"
                                    : "Select all rows"
                                }
                                disabled={rows.length === 0}
                              />
                            ) : (
                              <>
                                <button
                                  type="button"
                                  disabled={!canSort}
                                  onClick={header.column.getToggleSortingHandler()}
                                  className={cn(
                                    "flex min-w-0 flex-1 items-center gap-1 truncate text-left",
                                    canSort && "cursor-pointer",
                                  )}
                                >
                                  <span className="truncate leading-snug">
                                    {String(column.columnDef.header ?? "")}
                                  </span>
                                  {sorted === "asc" ? (
                                    <CaretUpIcon size={11} />
                                  ) : sorted === "desc" ? (
                                    <CaretDownIcon size={11} />
                                  ) : null}
                                </button>
                                <EnterpriseColumnFilter
                                  column={column}
                                  data={data}
                                  columnDef={columns.find(
                                    (c) => c.key === header.id,
                                  )}
                                />
                              </>
                            )}
                            {header.column.getCanResize() ? (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                onClick={(event) => event.stopPropagation()}
                                data-row-ignore-click="true"
                                className="absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none hover:bg-primary/40"
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    height: rowVirtualizer.getTotalSize(),
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    if (!row) return null;
                    const isSelected = Boolean(rowSelection?.[row.id]);

                    return (
                      <div
                        key={row.id}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: ROW_HEIGHT,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        onClick={(event) => {
                          if (isInteractiveClickTarget(event.target)) return;
                          onRowClick?.(row.original);
                        }}
                        className={cn(
                          "group flex bg-card transition-colors",
                          tableDensity.hoverBg,
                          onRowClick && "cursor-pointer",
                          isSelected && "bg-primary/5 hover:bg-primary/10",
                          getRowClassName?.(row.original),
                        )}
                      >
                        {row.getAllCells().map((cell) => {
                          const pinned = cell.column.getIsPinned();
                          const isSelectColumn =
                            cell.column.id === SELECT_COLUMN_ID;
                          const isPinnedRegionEnd = isLastPinnedStartColumn(
                            cell.column,
                            startPinnedCount,
                          );

                          if (cell.column.id === ACTIONS_COLUMN_ID) {
                            return (
                              <div
                                key={cell.id}
                                data-row-ignore-click="true"
                                style={actionsStyle(rowActionsWidth)}
                                className={cn(
                                  tableDensity.rowHeight,
                                  tableDensity.pinnedBodyBg,
                                  "z-10 flex items-center justify-end border-b border-l border-border px-1.5 group-hover:bg-surface-hover",
                                  isSelected && "bg-primary-soft group-hover:bg-primary-soft",
                                )}
                              >
                                {renderRowActions?.(row.original)}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={cell.id}
                              style={{ ...pinnedStyle(cell.column, pinned), flexGrow: growOf(cell.column) }}
                              className={cn(
                                tableDensity.rowHeight,
                                tableDensity.bodyText,
                                tableDensity.cellPaddingX,
                                "flex shrink-0 items-center truncate border-r border-b font-normal text-foreground",
                                tableDensity.cellDividerColor,
                                tableDensity.rowBottomBorder,
                                pinned && cn("z-10", tableDensity.pinnedBodyBg, "group-hover:bg-surface-hover"),
                                isPinnedRegionEnd &&
                                  tableDensity.pinnedRegionDivider,
                                isSelected && pinned && "bg-primary/5 group-hover:bg-primary/10",
                              )}
                            >
                              {isSelectColumn ? (
                                <Checkbox
                                  className={tableDensity.checkboxSize}
                                  checked={isSelected}
                                  onCheckedChange={() => toggleRow(row.id)}
                                  onClick={(event) => event.stopPropagation()}
                                  aria-label={
                                    getRowLabel?.(row.original) ??
                                    (isSelected ? "Deselect row" : "Select row")
                                  }
                                />
                              ) : (
                                <span
                                  className="block max-w-full truncate"
                                  title={String(cell.getValue() ?? "")}
                                >
                                  {table.FlexRender({ cell })}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                {filteredToNothing ? (
                  <div className="sticky left-0 w-full max-w-3xl">
                    <EmptyState
                      illustration="search"
                      title="No matching records"
                      description="No rows match the column filters."
                      action={{ label: "Clear column filters", onClick: () => table.setColumnFilters([]) }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
        <TableScrollNav scrollRef={scrollAreaRef} group="enterprise-grid" />
      </div>
    </div>
  );

  if (!enableFullView) return gridBody;

  return (
    <FullViewPortal active={fullView} onExit={() => setFullView(false)}>
      {gridBody}
    </FullViewPortal>
  );
}

type SizedPinnableColumn = {
  getSize: () => number;
  getStart: (region: "start") => number;
};

function pinnedStyle(
  column: SizedPinnableColumn,
  pinned: false | "start" | "end",
): CSSProperties {
  return {
    width: column.getSize(),
    position: pinned ? "sticky" : "relative",
    left: pinned === "start" ? column.getStart("start") : undefined,
  };
}

/** Columns marked `grow` absorb spare width so the grid fills its container. */
function growOf(column: { columnDef: { meta?: unknown } }): number | undefined {
  return (column.columnDef.meta as { grow?: boolean } | undefined)?.grow ? 1 : undefined;
}

/** The actions column is always last, so it sticks to the right edge. */
function actionsStyle(width: number): CSSProperties {
  return { width, position: "sticky", right: 0, marginLeft: "auto" };
}

type PinnableColumn = {
  id: string;
  getIsPinned: () => false | "start" | "end";
  getPinnedIndex: () => number;
};

function isLastPinnedStartColumn(
  column: PinnableColumn,
  startPinnedCount: number,
): boolean {
  if (column.id === SELECT_COLUMN_ID) return false;
  return (
    column.getIsPinned() === "start" &&
    column.getPinnedIndex() === startPinnedCount - 1
  );
}

function EnterpriseColumnFilter<T extends { id: string }>({
  column,
  data,
  columnDef,
}: {
  column: Column<EnterpriseGridFeatures, T, unknown>;
  data: T[];
  columnDef: EnterpriseColumn<T> | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const active = Boolean(
    (column.getFilterValue() as string[] | undefined)?.length,
  );
  const selected = (column.getFilterValue() as string[] | undefined) ?? [];
  const [draft, setDraft] = useState<string[]>(selected);

  const isRemote = Boolean(columnDef?.getRemoteFilterOptions);
  const [remoteValues, setRemoteValues] = useState<string[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(selected);
      setSearch("");
      // Always fetch fresh on open rather than caching across opens - the
      // scope this depends on (search/project/other column filters) can
      // change between opens and there's no cheap signal here to know when
      // a re-fetch is actually needed.
      if (columnDef?.getRemoteFilterOptions) {
        setRemoteLoading(true);
        columnDef
          .getRemoteFilterOptions()
          .then(setRemoteValues)
          .catch(() => setRemoteValues([]))
          .finally(() => setRemoteLoading(false));
      }
    }
    setOpen(nextOpen);
  }

  const values = useMemo(() => {
    if (!columnDef) return [];
    const unique = isRemote
      ? remoteValues
      : Array.from(
          new Set(
            data.flatMap((row) =>
              columnDef.getFilterGroups
                ? columnDef.getFilterGroups(row)
                : [formatCellValue(columnDef.getValue(row))],
            ),
          ),
        );
    return unique
      .filter((value) => value.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  }, [columnDef, data, search, isRemote, remoteValues]);

  function toggleValue(value: string) {
    setDraft((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  if (!columnDef || columnDef.filterable === false) return null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Filter ${columnDef.label}`}
            onClick={(event) => event.stopPropagation()}
            className={cn(
              "inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
              active && "border-primary/30 bg-primary/10 text-primary",
            )}
          >
            <FunnelSimpleIcon size={12} />
          </button>
        }
      />
      <PopoverContent
        align="end"
        className="w-72"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-2">
          <div>
            <p className="text-xs font-semibold text-foreground">
              {columnDef.label}
            </p>
            <p className="text-xs text-muted-foreground">
              Select values to show
            </p>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search values..."
            className="h-8"
          />
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-1">
            {isRemote && remoteLoading ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">Loading values...</p>
            ) : null}
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
                <span className="truncate" title={value}>
                  {value}
                </span>
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
                column.setFilterValue([]);
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                column.setFilterValue(draft);
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
