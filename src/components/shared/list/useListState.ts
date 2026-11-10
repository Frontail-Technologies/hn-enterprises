"use client";

import { useCallback, useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { SortState } from "./types";

export type ListStateOptions = {
  pageSize?: number;
  initialSort?: SortState;
  initialFilters?: Record<string, string>;
  /** Persists column visibility per list in this browser. */
  storageKey?: string;
};

const readColumns = (key?: string): Record<string, boolean> => {
  if (!key) return {};
  try {
    return JSON.parse(window.localStorage.getItem(`list-columns:${key}`) ?? "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
};

/**
 * All interactive state for a ListTable: search, filters, sort, paging,
 * column visibility and row selection. Server-backed pages feed
 * `debouncedSearch`, `filters`, `sort`, `page` and `pageSize` into their query;
 * client-side pages pass it to `useClientRows`.
 */
export function useListState({ pageSize: initialPageSize = 50, initialSort = null, initialFilters = {}, storageKey }: ListStateOptions = {}) {
  const [search, setSearchValue] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  const [sort, setSortValue] = useState<SortState>(initialSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeValue] = useState(initialPageSize);
  // Dashboard pages only render in the browser (behind the auth gate), so saved
  // columns are read before the first paint instead of popping in afterwards.
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
    typeof window === "undefined" ? {} : readColumns(storageKey),
  );
  const [selection, setSelection] = useState<ReadonlySet<string>>(() => new Set());
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const setFilter = useCallback((id: string, value: string) => {
    setFilters((current) => {
      const next = { ...current };
      if (value) next[id] = value;
      else delete next[id];
      return next;
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchValue("");
    setPage(1);
  }, []);

  const setSort = useCallback((value: SortState) => {
    setSortValue(value);
    setPage(1);
  }, []);

  const setPageSize = useCallback((value: number) => {
    setPageSizeValue(value);
    setPage(1);
  }, []);

  const saveColumns = useCallback(
    (next: Record<string, boolean>) => {
      setColumnVisibility(next);
      if (!storageKey) return;
      try {
        window.localStorage.setItem(`list-columns:${storageKey}`, JSON.stringify(next));
      } catch {
        // Storage can be blocked; visibility still works for this session.
      }
    },
    [storageKey],
  );

  const isColumnVisible = useCallback(
    (id: string, defaultHidden?: boolean) => columnVisibility[id] ?? !defaultHidden,
    [columnVisibility],
  );

  const toggleRow = useCallback((id: string) => {
    setSelection((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setRowsSelected = useCallback((ids: string[], selected: boolean) => {
    setSelection((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (selected) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelection(new Set()), []);
  const replaceSelection = useCallback((ids: string[]) => setSelection(new Set(ids)), []);

  const activeFilterCount = Object.keys(filters).length;
  const hasQuery = Boolean(search.trim()) || activeFilterCount > 0;

  return useMemo(
    () => ({
      search,
      setSearch,
      debouncedSearch,
      filters,
      setFilter,
      clearFilters,
      activeFilterCount,
      hasQuery,
      sort,
      setSort,
      page,
      setPage,
      pageSize,
      setPageSize,
      isColumnVisible,
      setColumnVisible: (id: string, visible: boolean) => saveColumns({ ...columnVisibility, [id]: visible }),
      resetColumns: () => saveColumns({}),
      selection,
      toggleRow,
      setRowsSelected,
      clearSelection,
      replaceSelection,
    }),
    [search, setSearch, debouncedSearch, filters, setFilter, clearFilters, activeFilterCount, hasQuery, sort, setSort, page, pageSize, setPageSize, isColumnVisible, saveColumns, columnVisibility, selection, toggleRow, setRowsSelected, clearSelection, replaceSelection],
  );
}

export type ListState = ReturnType<typeof useListState>;
