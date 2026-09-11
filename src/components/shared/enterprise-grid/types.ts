import type { ReactNode } from "react";

export type EnterpriseColumn<T extends { id: string }> = {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  grow?: boolean;
  pin?: boolean;
  enableResizing?: boolean;
  enableSorting?: boolean;
  getValue: (row: T) => string | number | boolean | null | undefined;
  /**
   * Whether this column shows the Excel-style filter affordance at all.
   * Defaults to true (unchanged behavior for every existing grid consumer) -
   * set to false when a column's filter would otherwise be misleadingly
   * page-local on a server-paginated dataset with no real dataset-wide
   * filter behind it (see CustomersList's server-filter whitelist).
   */
  filterable?: boolean;
  getFilterGroups?: (row: T) => string[];
  /**
   * Opts this column's Excel-style filter dropdown into remote distinct
   * values instead of deriving them from the currently-loaded `data` page -
   * called (and cached) once when the dropdown opens. Use when `data` is a
   * server-paginated page and the dropdown needs to represent the full
   * scoped dataset, not just the current page's rows. Omit to keep the
   * default local-dataset behavior.
   */
  getRemoteFilterOptions?: () => Promise<string[]>;
  render?: (row: T) => ReactNode;
};

export interface EnterpriseDataGridSelection<T extends { id: string }> {
  selectedIds: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  onTogglePage: (ids: string[]) => void;
  getRowLabel?: (row: T) => string;
}

export type EnterpriseFilterValues = Record<string, string[]>;
