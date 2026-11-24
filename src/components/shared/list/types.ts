import type { ElementType, ReactNode } from "react";
import type { EmptyIllustrationName } from "@/components/shared/EmptyState";

export type CellValue = string | number | boolean | null | undefined;

export type ListColumn<T> = {
  id: string;
  header: string;
  /** Plain value: used for default rendering, client-side sorting/search and filters. */
  value?: (row: T) => CellValue;
  /** Custom cell; falls back to `value`. */
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "start" | "end";
  /** Column width in px (default 140). */
  width?: number;
  minWidth?: number;
  /** Takes remaining horizontal space. */
  grow?: boolean;
  /** Renders as the row's primary text (stronger weight) and is pinned to the left. */
  isTitle?: boolean;
  /** Pin to the left while scrolling sideways. Title columns pin by default. */
  pin?: boolean;
  /**
   * Excel-style value filter in the header. Only for lists whose rows are all
   * loaded client-side; on server-paged lists it would filter one page only.
   */
  columnFilter?: boolean;
  /** Excel filter: groups a row belongs to, instead of its single display value. */
  getFilterGroups?: (row: T) => string[];
  /**
   * Excel filter: fetch the value list from the server when the dropdown opens
   * (for server-paged lists whose filter applies to the whole dataset).
   */
  getRemoteFilterOptions?: () => Promise<string[]>;
  /** Set false for columns that must always show. Default true. */
  hideable?: boolean;
  defaultHidden?: boolean;
};

export type FilterOption = { value: string; label: string; /** e.g. a project's code · city · contractor */ secondary?: string };

export type ListFilter =
  | {
      type?: "select";
      id: string;
      label: string;
      options: FilterOption[];
      /** Also show as a dropdown in the toolbar (not only in the Filters panel). */
      quick?: boolean;
    }
  | {
      type: "dateRange";
      /** Key holding the "from" date (yyyy-MM-dd). */
      id: string;
      /** Key holding the "to" date (yyyy-MM-dd). */
      toId: string;
      label: string;
    };

export type SortState = { id: string; desc: boolean } | null;

export type RowAction<T> = {
  id: string;
  label: string;
  icon?: ElementType;
  onSelect: (row: T) => void;
  danger?: boolean;
  hidden?: boolean;
  disabled?: boolean;
};

export type ListEmpty = {
  title: string;
  description?: string;
  illustration?: EmptyIllustrationName;
  action?: { label: string; onClick: () => void };
};
