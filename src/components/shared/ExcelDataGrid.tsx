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
import { CustomScrollbar } from "@/components/shared/CustomScrollbar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { tableDensity } from "@/components/shared/table/density";
import { useFullViewActive } from "@/components/shared/table/FullViewContext";
import { FullViewPortal } from "@/components/shared/table/FullViewPortal";
import { FullViewToggleButton } from "@/components/shared/table/FullViewToggleButton";
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
  /**
   * Lets this column absorb leftover table width instead of every column
   * rendering at exactly its configured `width` - for descriptive/free-text
   * columns (Item Name, Category, Address...) on tables with few columns,
   * where a fixed-width-only table would leave blank space on wide screens.
   * `width` still applies as this column's minimum (its floor once the
   * container is too narrow to show every column at its natural size, and
   * the value sticky-offset math uses for any column after it). Numeric/
   * status/unit/action columns should stay non-grow so they don't stretch
   * to fill space pointlessly - see `docs` note in ExcelTable for the sticky
   * interaction rule.
   */
  grow?: boolean;
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
  /**
   * Fills whatever height its flex ancestor gives it instead of capping at
   * `maxHeightClassName` - for pages that make the table the last flex-child
   * of a viewport-bounded column (see PageShell's own `fillHeight`), so the
   * table grows to use available space rather than a fixed vh guess. Takes
   * priority over `maxHeightClassName` when set.
   */
  fillHeight?: boolean;
  /**
   * Adds a compact expand/collapse toggle to the grid's own top bar. When
   * active, the grid (this same instance - no remount, no refetch) portals
   * into an application-level Full View surface covering most of the
   * viewport, escapable via the toggle or Escape. See FullViewPortal.
   */
  enableFullView?: boolean;
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
  // True whether this grid owns the active Full View itself OR merely
  // inherits one from an ancestor - either way, the grid should drop its own
  // card border/rounding rather than show a redundant nested shell inside
  // the outer full-view surface. Hook called
  // unconditionally first, then combined - `fullView || useFullViewActive()`
  // would skip the hook call whenever `fullView` is already true, which
  // breaks the rules of hooks.
  const inheritedFullView = useFullViewActive();
  const isFullViewActive = fullView || inheritedFullView;
  // Full View always behaves like fillHeight (it's meant to consume almost
  // the entire viewport) regardless of what the caller passed for normal
  // (non-full-view) sizing.
  const effectiveFillHeight = fillHeight || isFullViewActive;

  const [filters, setFilters] = useState<ActiveFilters>({});
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
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

  // Reset to page 1 whenever the active filters change - adjusted during
  // render (React's recommended alternative to a setState-in-effect
  // cascade) rather than in a useEffect. `filters` gets a new object
  // reference exactly when a column filter is applied/cleared, so reference
  // equality is the right check here.
  const [lastFilters, setLastFilters] = useState(filters);
  if (filters !== lastFilters) {
    setLastFilters(filters);
    setPage(1);
  }

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

  // filteredRows/paginatedRows are recomputed (new array reference) whenever
  // `columns` or `rows` change reference upstream, even when the actual set
  // of visible ids is unchanged - calling onVisibleRowsChange on every one of
  // those recomputes let a parent's setState-on-change turn into a render
  // loop (the parent re-renders -> passes a new `columns`/`rows` reference ->
  // this effect fires again). Comparing the actual id/signature VALUES before
  // notifying breaks that loop regardless of how stable the caller's props are.
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

  return (
    <FullViewPortal active={fullView} onExit={() => setFullView(false)}>
      <div
        className={cn(
          "flex flex-col bg-card",
          // Full View already provides its own outer surface (see
          // FullViewPortal) - a second nested rounded/bordered card inside
          // it just eats space and reads as "not really full-screen", so
          // this one goes edge-to-edge instead, whether it owns the active
          // Full View itself or is nested inside an ancestor's.
          isFullViewActive ? "rounded-none" : "rounded-card border border-border",
          effectiveFillHeight && "h-full min-h-0 flex-1",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border px-3 py-2 shrink-0">
          <div className="text-xs font-medium text-muted-foreground">
            Showing {Math.min(filteredRows.length, (page - 1) * pageSize + 1)} to {Math.min(filteredRows.length, page * pageSize)} of {filteredRows.length} filtered records {filteredRows.length !== rows.length ? `(from ${rows.length} total)` : ""}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Full View sits immediately left of pagination, in the one
                result-count/pagination row - not floating over the table. */}
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
            className="min-w-0 flex-1 overflow-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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

          {/* The native horizontal scrollbar is already discoverable and
              draggable on its own - no floating overlay arrows on top of
              cells, in either normal or Full View mode. */}
          <CustomScrollbar targetRef={scrollAreaRef} orientation="horizontal" />
          <CustomScrollbar targetRef={scrollAreaRef} orientation="vertical" />
        </div>
      </div>
    </FullViewPortal>
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

  // table-layout:auto (the browser default) sizes columns by content, using
  // `minWidth` as a floor only - a long value in any row silently blows a
  // column past its configured `width`, which also desyncs it from the
  // sticky-offset math below (that part already keys off `column.width`
  // alone). `table-layout:fixed` + an explicit <colgroup> makes the
  // configured width authoritative for both header and body cells in one
  // place, so columns can no longer auto-expand from content and stay
  // pixel-aligned with their own sticky offset.
  //
  // A plain fixed total table width (every column exactly its configured
  // px) leaves blank space on a wide screen once density dropped column
  // widths down - a 6-column table doesn't need to be as wide as a
  // 20-column one. So the table itself is `width:100%` (fills the
  // container) with `minWidth` pinned to the sum of every column's
  // configured width (the floor at which horizontal scroll must take over).
  // Non-grow columns keep an explicit <col width> - under table-layout:fixed
  // that's authoritative and they can't be stretched. `grow` columns get NO
  // <col width>, so the fixed-layout algorithm hands them 100% of whatever
  // width is left over once every explicit column is accounted for (equally
  // split, if more than one); their own `column.width` still applies via the
  // cell-level `minWidth` below, so they still won't shrink under their own
  // configured floor once the container gets tight enough to scroll.
  //
  // Sticky interaction: `stickyOffsets` (above) always keys off the
  // *configured* `column.width`, never a column's actual rendered width, so
  // a sticky column's own offset is unaffected by being `grow` too. But a
  // LATER sticky column's offset is computed assuming every earlier column
  // sits at its configured width - if an earlier sticky column is also
  // `grow` (and therefore may render wider than that), a sticky column after
  // it would visually drift from its computed offset. So `grow` is safe on
  // any non-sticky column, and on a sticky column only when it's the last
  // (or only) sticky column in the frozen block.
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
              style={{ minWidth: SELECT_COLUMN_WIDTH, width: SELECT_COLUMN_WIDTH, left: 0 }}
              className={cn(
                tableDensity.rowHeight,
                "sticky top-0 left-0 z-30 border-r border-b border-r-border/40 border-b-border bg-secondary pl-2.5 pr-0 text-center align-middle shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
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
                  "sticky top-0 z-20 border-r border-b border-r-border/40 border-b-border bg-secondary text-left align-middle font-semibold text-muted-foreground",
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
          rows.map((row) => (
            <ExcelTableRow
              key={row.id}
              row={row}
              columns={columns}
              stickyOffsets={stickyOffsets}
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

// Selecting one row previously re-rendered every row in the table (up to
// pageSize=100, each with as many <td> as visible columns) since selection
// toggles a new Set reference passed straight down through ExcelTable's
// inline `rows.map`. Splitting the row out into its own memoized component
// means only the row(s) whose own props actually changed - isSelected,
// rowClassName - re-render; everything else bails out on React.memo's
// shallow prop comparison. That comparison only holds if every prop here is
// referentially stable across a selection-only re-render: `row`/`columns`/
// `stickyOffsets` already are (memoized upstream), and `onToggleRow` is the
// bulk-selection hook's useCallback(..., []) - callers just need to keep
// `onRowClick` similarly stable (see CustomersList.tsx).
function ExcelTableRowImpl<T extends { id: string }>({
  row,
  columns,
  stickyOffsets,
  rowClassName,
  isSelected,
  ariaLabel,
  onRowClick,
  onToggleRow,
}: {
  row: T;
  columns: ExcelColumn<T>[];
  stickyOffsets: Array<number | undefined>;
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
          style={{ minWidth: SELECT_COLUMN_WIDTH, width: SELECT_COLUMN_WIDTH, left: 0 }}
          className={cn(
            tableDensity.rowHeight,
            "sticky left-0 z-10 border-r border-b border-r-border/30 border-b-border/60 bg-secondary pl-2.5 pr-0 text-center group-hover/excel-row:bg-secondary shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
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

const EMPTY_VALUE = "—"; // em-dash, rendered muted

function formatCellValue(value: string | number | boolean | null | undefined) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return EMPTY_VALUE;
  const text = String(value).trim();
  return text || EMPTY_VALUE;
}

