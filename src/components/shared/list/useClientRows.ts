"use client";

import { useMemo } from "react";
import type { ListState } from "./useListState";
import type { CellValue, ListColumn, ListFilter } from "./types";

type ClientOptions<T> = {
  columns: ListColumn<T>[];
  filters?: ListFilter[];
  /** Text searched by the search box. Defaults to every column's `value`. */
  searchText?: (row: T) => string;
  /** Value a filter compares against. Defaults to the column with the same id. */
  filterValue?: (row: T, filterId: string) => CellValue;
  /** Set false when the API already applied the search (rows are server-matched). */
  clientSearch?: boolean;
};

const compare = (a: CellValue, b: CellValue) => {
  if (a == null || a === "") return 1;
  if (b == null || b === "") return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
};

/**
 * Search, filter, sort and paginate rows that are already loaded in the
 * browser, driven by the same ListState a server-backed list uses.
 */
export function useClientRows<T>(rows: T[], state: ListState, { columns, filters = [], searchText, filterValue, clientSearch = true }: ClientOptions<T>) {
  const { debouncedSearch, filters: values, sort, page, pageSize } = state;
  const query = clientSearch ? debouncedSearch.toLowerCase() : "";

  const filtered = useMemo(() => {
    const valueOf = (row: T, id: string) => filterValue?.(row, id) ?? columns.find((column) => column.id === id)?.value?.(row);
    const textOf = searchText ?? ((row: T) => columns.map((column) => String(column.value?.(row) ?? "")).join(" "));

    let result = rows.filter((row) => {
      if (query && !textOf(row).toLowerCase().includes(query)) return false;
      return filters.every((filter) => {
        if (filter.type === "dateRange") {
          const from = values[filter.id];
          const to = values[filter.toId];
          if (!from && !to) return true;
          const day = String(valueOf(row, filter.id) ?? "").slice(0, 10);
          if (!day) return false;
          return (!from || day >= from) && (!to || day <= to);
        }
        const selected = values[filter.id];
        return !selected || String(valueOf(row, filter.id) ?? "") === selected;
      });
    });

    if (sort) {
      const column = columns.find((item) => item.id === sort.id);
      if (column?.value) {
        const get = column.value;
        result = [...result].sort((a, b) => (sort.desc ? -1 : 1) * compare(get(a), get(b)));
      }
    }
    return result;
  }, [rows, columns, filters, searchText, filterValue, query, values, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage, pageSize]);

  return { rows: filtered, pageRows, total: filtered.length };
}
