/**
 * Compact-density tokens for Excel/register-style data tables
 * (ExcelDataGrid, DataTable/PaginatedDataTable, ImportPreviewTable). One
 * shared source of truth so every table system renders the same row
 * height/font/padding instead of each page re-hardcoding its own numbers.
 *
 * Not used for cards, forms, or any non-table UI - those keep their normal
 * (non-compact) sizing.
 */
export const tableDensity = {
  /** ~36px - within the 34-38px target row height, for both header and body cells. */
  rowHeight: "h-9",
  /** 11px - deliberately a notch under the body font for header/body hierarchy. */
  headerText: "text-[11px]",
  /** 12px - lower end of the 12-13px body-font target. */
  bodyText: "text-xs",
  /** 10px */
  cellPaddingX: "px-2.5",
  /** 6px */
  cellPaddingY: "py-1.5",
  /** 14px, down from the default 16px checkbox - table-scoped only (the shared
   * Checkbox component's own default size is untouched for forms/cards). */
  checkboxSize: "size-3.5",
  /** 28px, down from the default 32px - table-local Prev/Next/First/Last buttons. */
  pagerButtonHeight: "h-7",
} as const;
