"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { ColumnFiltersState, RowSelectionState, SortingState } from "@tanstack/react-table";
import { CaretLeftIcon, CaretRightIcon, CornersOutIcon, DotsThreeIcon, XIcon } from "@phosphor-icons/react";
import { EmptyState } from "@/components/shared/EmptyState";
import { EnterpriseDataGrid } from "@/components/shared/enterprise-grid/EnterpriseDataGrid";
import type { EnterpriseColumn } from "@/components/shared/enterprise-grid/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, pluralize } from "@/lib/utils";
import { FilterChips, ListToolbar } from "./ListToolbar";
import type { ListState } from "./useListState";
import type { ListColumn, ListEmpty, ListFilter, RowAction } from "./types";

const MAX_INLINE_ACTIONS = 3;
const PAGE_SIZES = [25, 50, 100];
const SERIAL_COLUMN_ID = "__serial__";

export type ListTableProps<T extends { id: string }> = {
  /** Used for item counts ("record" → "records") and accessible labels. */
  itemLabel?: string;
  /** Rows for the current page (server page, or `useClientRows().pageRows`). */
  rows: T[];
  /** Total matching rows across all pages. */
  total: number;
  columns: ListColumn<T>[];
  state: ListState;
  filters?: ListFilter[];
  searchPlaceholder?: string;
  /** Hide the search box (small, fixed lists). Default true. */
  searchable?: boolean;
  /** Extra toolbar buttons (export, import...). */
  actions?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => RowAction<T>[];
  /**
   * Custom actions cell, for rows whose actions are self-contained dialogs
   * (edit/delete triggers). Use instead of `rowActions`; set `rowActionsWidth`.
   */
  renderRowActions?: (row: T) => ReactNode;
  rowActionsWidth?: number;
  /** Enables row checkboxes and the bulk bar. */
  selectable?: boolean;
  getRowLabel?: (row: T) => string;
  bulkActions?: (selectedIds: string[], clear: () => void) => ReactNode;
  /** "Sr. No." column (1, 2, 3... in the order shown, continuing across pages). Default true. */
  showSerial?: boolean;
  empty: ListEmpty;
  pageSizes?: number[];
  enableFullView?: boolean;
  /**
   * Stretch to fill a full-height page (use with PageShell `fillHeight`); the
   * grid then scrolls inside the remaining viewport height.
   */
  fillHeight?: boolean;
  /** Scroll-area height of the grid (default max-h-[68vh]). */
  maxHeightClassName?: string;
  getRowClassName?: (row: T) => string | undefined;
  /** Replaces the built-in empty state (e.g. when "filtered" depends on state ListState doesn't know). */
  emptyState?: ReactNode;
  /** Controlled Excel column filters (e.g. sent to the server). Pass both or neither. */
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (next: ColumnFiltersState) => void;
  /** Rows visible after column filters, with a signature of the active filters. */
  onVisibleRowsChange?: (context: { filteredIds: string[]; filterSignature: string }) => void;
  /**
   * Externally owned row selection (checkboxes only, no built-in bulk bar) for
   * pages with their own selection model/toolbar. Pass both or neither; use
   * instead of `selectable`.
   */
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;
  className?: string;
};

function RowActions<T>({ row, actions, inline }: { row: T; actions: RowAction<T>[]; inline: boolean }) {
  if (!actions.length) return null;
  if (inline) {
    return (
      <div className="flex items-center gap-0.5">
        {actions.map((action) => {
          const Icon = action.icon!;
          return (
            <Button
              key={action.id}
              variant="ghost"
              size="icon-sm"
              title={action.label}
              aria-label={action.label}
              disabled={action.disabled}
              className={cn("text-muted-foreground hover:text-foreground", action.danger && "hover:bg-danger-soft hover:text-danger")}
              onClick={() => action.onSelect(row)}
            >
              <Icon size={16} />
            </Button>
          );
        })}
      </div>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Row actions" className="text-muted-foreground" />}>
        <DotsThreeIcon size={18} weight="bold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.id}
              disabled={action.disabled}
              className={cn(action.danger && "text-destructive focus:text-destructive")}
              onClick={() => action.onSelect(row)}
            >
              {Icon ? <Icon size={15} /> : null}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ListPagination({ state, total, pageSizes }: { state: ListState; total: number; pageSizes: number[] }) {
  const pageCount = Math.max(1, Math.ceil(total / state.pageSize));
  const page = Math.min(state.page, pageCount);
  const from = total ? (page - 1) * state.pageSize + 1 : 0;
  const to = Math.min(page * state.pageSize, total);
  const format = (value: number) => value.toLocaleString("en-IN");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground">
      <span className="tabular-nums">
        Showing <b className="font-semibold text-foreground">{format(from)}–{format(to)}</b> of <b className="font-semibold text-foreground">{format(total)}</b>
      </span>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="compact" className="text-muted-foreground" />}>
            {state.pageSize} per page
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuRadioGroup value={String(state.pageSize)} onValueChange={(value) => state.setPageSize(Number(value))}>
              {pageSizes.map((size) => (
                <DropdownMenuRadioItem key={size} value={String(size)}>
                  {size} per page
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon-sm" aria-label="Previous page" disabled={page <= 1} onClick={() => state.setPage(page - 1)}>
            <CaretLeftIcon size={14} />
          </Button>
          <span className="min-w-20 text-center tabular-nums">
            Page {format(page)} of {format(pageCount)}
          </span>
          <Button variant="outline" size="icon-sm" aria-label="Next page" disabled={page >= pageCount} onClick={() => state.setPage(page + 1)}>
            <CaretRightIcon size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function BulkBar({ count, onClear, children }: { count: number; onClear: () => void; children?: ReactNode }) {
  if (!count) return null;
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="sticky bottom-4 z-30 mx-auto flex w-fit max-w-full items-center gap-2 rounded-xl bg-secondary-action py-2 ps-4 pe-2 text-secondary-action-foreground shadow-floating"
    >
      <span className="text-[13px] font-semibold tabular-nums">{count.toLocaleString("en-IN")} selected</span>
      <span className="mx-1 h-5 w-px bg-white/20" />
      {/* Buttons passed in are usually `ghost`, whose own hover turns text dark navy —
          invisible on this navy bar — so text is forced white in every state. */}
      <div className="flex items-center gap-1.5 overflow-x-auto [&_button]:border-white/20 [&_button]:bg-white/8 [&_button]:text-secondary-action-foreground! [&_button:focus-visible]:ring-white/40 [&_button:hover]:bg-white/18! [&_button:hover]:text-secondary-action-foreground! [&_button:disabled]:opacity-50">{children}</div>
      <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={onClear} className="text-secondary-action-foreground hover:bg-white/15 hover:text-secondary-action-foreground">
        <XIcon size={14} />
      </Button>
    </div>
  );
}

/**
 * The standard admin list: one framed card holding the toolbar (search,
 * quick filters, Filters panel, column picker, actions), filter chips, the
 * EnterpriseDataGrid (D-014), pagination and a floating bulk bar. All state
 * lives in `useListState`; sorting/selection drive the grid externally.
 */
export function ListTable<T extends { id: string }>({
  itemLabel = "record",
  rows,
  total,
  columns,
  state,
  filters = [],
  searchPlaceholder,
  searchable = true,
  actions,
  isLoading,
  isError,
  onRetry,
  onRowClick,
  rowActions,
  renderRowActions,
  rowActionsWidth,
  selectable,
  getRowLabel,
  bulkActions,
  showSerial = true,
  empty,
  pageSizes = PAGE_SIZES,
  enableFullView,
  fillHeight,
  maxHeightClassName,
  getRowClassName,
  emptyState: emptyStateOverride,
  columnFilters,
  onColumnFiltersChange,
  onVisibleRowsChange,
  rowSelection: externalRowSelection,
  onRowSelectionChange: onExternalRowSelectionChange,
  className,
}: ListTableProps<T>) {
  const offset = (state.page - 1) * state.pageSize;
  // Rows left after the grid's own Excel-style column filters, in display order,
  // so Sr. No. stays 1, 2, 3... without gaps when a column filter hides rows.
  const [visibleIds, setVisibleIds] = useState<string[] | null>(null);
  const handleVisibleRows = useCallback(
    (context: { filteredIds: string[]; filterSignature: string }) => {
      setVisibleIds(context.filterSignature ? context.filteredIds : null);
      onVisibleRowsChange?.(context);
    },
    [onVisibleRowsChange],
  );
  const [fullView, setFullView] = useState(false);
  const hideableCount = columns.filter((column) => column.hideable !== false).length;
  const showToolbar = searchable || filters.length > 0 || hideableCount > 1 || Boolean(actions) || Boolean(enableFullView);

  const gridColumns = useMemo<EnterpriseColumn<T>[]>(() => {
    const visible = columns.filter((column) => state.isColumnVisible(column.id, column.defaultHidden));
    const mapped = visible.map<EnterpriseColumn<T>>((column) => {
      const content = (row: T) => (column.cell ? column.cell(row) : (column.value?.(row) ?? "—"));
      return {
        key: column.id,
        label: column.header,
        width: column.width ?? (column.isTitle ? 200 : column.minWidth ?? 140),
        minWidth: column.minWidth,
        grow: column.grow,
        pin: column.pin ?? column.isTitle,
        enableSorting: Boolean(column.sortable),
        filterable: Boolean(column.columnFilter),
        getFilterGroups: column.getFilterGroups,
        getRemoteFilterOptions: column.getRemoteFilterOptions,
        getValue: (row) => column.value?.(row),
        render:
          column.cell || column.isTitle || column.align === "end"
            ? (row) => (
                <span className={cn(column.isTitle && "font-semibold text-foreground", column.align === "end" && "block w-full text-right tabular-nums")}>
                  {content(row)}
                </span>
              )
            : undefined,
      };
    });
    // Fixed widths leave a blank band when columns are hidden or the screen is
    // wide; if no visible column grows, let the last one absorb the spare width.
    if (mapped.length && !mapped.some((column) => column.grow)) {
      mapped[mapped.length - 1] = { ...mapped[mapped.length - 1], grow: true };
    }
    if (!showSerial) return mapped;
    const order = visibleIds ?? rows.map((row) => row.id);
    const position = new Map(order.map((id, index) => [id, offset + index + 1]));
    return [
      {
        key: SERIAL_COLUMN_ID,
        label: "Sr. No.",
        width: 72,
        minWidth: 72,
        enableResizing: false,
        enableSorting: false,
        filterable: false,
        leadingPin: true,
        getValue: (row) => position.get(row.id),
        render: (row) => <span className="text-muted-foreground tabular-nums">{position.get(row.id)}</span>,
      },
      ...mapped,
    ];
  }, [columns, state, showSerial, rows, offset, visibleIds]);

  const sorting = useMemo<SortingState>(() => (state.sort ? [state.sort] : []), [state.sort]);
  const sortableKeys = useMemo(() => columns.filter((column) => column.sortable).map((column) => column.id), [columns]);
  const rowSelection = useMemo<RowSelectionState>(() => Object.fromEntries([...state.selection].map((id) => [id, true])), [state.selection]);

  const actionLists = useMemo(() => (rowActions ? new Map(rows.map((row) => [row.id, rowActions(row).filter((action) => !action.hidden)])) : null), [rowActions, rows]);
  const inline = actionLists ? [...actionLists.values()].every((list) => list.length <= MAX_INLINE_ACTIONS && list.every((action) => action.icon)) : false;
  const widestInline = actionLists ? Math.max(1, ...[...actionLists.values()].map((list) => list.length)) : 1;

  const emptyState = isError ? undefined : emptyStateOverride ? emptyStateOverride : state.hasQuery ? (
    <EmptyState
      illustration="search"
      title={`No matching ${pluralize(itemLabel)}`}
      description="Try a different search or clear some filters."
      action={{ label: "Clear filters", onClick: state.clearFilters }}
    />
  ) : (
    <EmptyState {...empty} />
  );

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", fillHeight && "md:min-h-0 md:flex-1", className)}>
      <div className={cn("flex min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card shadow-card", fillHeight && "md:min-h-0 md:flex-1")}>
        {showToolbar ? (
          <div className="flex flex-col gap-3 border-b border-border p-4">
            <ListToolbar columns={columns} filters={filters} state={state} searchPlaceholder={searchPlaceholder} searchable={searchable} resultCount={isLoading ? undefined : total}
              actions={
                <>
                  {actions}
                  {enableFullView ? (
                    <Button variant="outline" size="icon-compact" title="Full view" aria-label="Full view" onClick={() => setFullView(true)}>
                      <CornersOutIcon size={14} />
                    </Button>
                  ) : null}
                </>
              }
            />
            <FilterChips filters={filters} state={state} />
          </div>
        ) : null}

        <EnterpriseDataGrid
          framed={false}
          columns={gridColumns}
          data={rows}
          itemLabel={itemLabel}
          isLoading={isLoading}
          isError={isError}
          onRetry={onRetry}
          emptyState={emptyState}
          onRowClick={onRowClick}
          getRowClassName={getRowClassName}
          getRowLabel={getRowLabel}
          enableFullView={enableFullView}
          fullView={fullView}
          onFullViewChange={setFullView}
          showSummaryBar={false}
          fillHeight={fillHeight}
          maxHeightClassName={maxHeightClassName}
          sorting={sorting}
          onSortingChange={(next) => state.setSort(next[0] ? { id: next[0].id, desc: next[0].desc } : null)}
          sortableColumnKeys={sortableKeys}
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
          onVisibleRowsChange={showSerial || onVisibleRowsChange ? handleVisibleRows : undefined}
          rowSelection={externalRowSelection ?? (selectable ? rowSelection : undefined)}
          onRowSelectionChange={
            onExternalRowSelectionChange ?? (selectable ? (next) => state.replaceSelection(Object.keys(next).filter((id) => next[id])) : undefined)
          }
          renderRowActions={
            renderRowActions ??
            (actionLists ? (row) => <RowActions row={row} actions={actionLists.get(row.id) ?? []} inline={inline} /> : undefined)
          }
          rowActionsWidth={rowActionsWidth ?? (inline ? 16 + widestInline * 32 : 52)}
        />

        {!isLoading && !isError && total > Math.min(...pageSizes) ? <ListPagination state={state} total={total} pageSizes={pageSizes} /> : null}
      </div>

      {selectable ? (
        <BulkBar count={state.selection.size} onClear={state.clearSelection}>
          {bulkActions?.([...state.selection], state.clearSelection)}
        </BulkBar>
      ) : null}
    </div>
  );
}
