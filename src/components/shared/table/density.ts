// Shared table sizing (DS-TABLE: rows ~34–38px). `rowHeight` must stay in sync
// with ROW_HEIGHT in enterprise-grid/EnterpriseDataGrid.tsx (h-9.5 = 38px),
// which the row virtualizer uses to position rows.
export const tableDensity = {
  rowHeight: "h-9.5",
  headerText: "text-xs",
  bodyText: "text-[13px]",
  cellPaddingX: "px-3",
  cellPaddingY: "py-2",
  checkboxSize: "size-4",
  pagerButtonHeight: "h-8",
  headerBg: "bg-surface-muted",
  headerText2: "text-muted-foreground",
  pinnedBodyBg: "bg-surface",
  cellDividerColor: "border-border",
  rowBottomBorder: "border-b-border",
  pinnedRegionDivider: "border-border",
  hoverBg: "hover:bg-surface-hover",
} as const;
