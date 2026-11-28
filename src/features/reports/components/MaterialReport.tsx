"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowsLeftRightIcon,
  DownloadSimpleIcon,
  PackageIcon,
  UsersThreeIcon,
  WarningCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { exportRowsToExcel } from "@/lib/export-excel";
import { materialReportApi, type MaterialHoldingRow, type MaterialReportRow } from "../services/material.service";
import type { ReportFilters } from "../types";

type StockRow = MaterialReportRow & { id: string };
type HoldingRow = MaterialHoldingRow & { id: string };

const qty = (value: number) => Number(value.toFixed(3)).toLocaleString("en-IN");
const qtyCell = (value: number, options: { muted?: boolean; strong?: boolean } = {}) => (
  <span
    className={cn(
      "tabular-nums",
      value < -0.0005 && "font-medium text-destructive",
      options.muted && Math.abs(value) < 0.0005 && "text-muted-foreground",
      options.strong && "font-semibold text-foreground",
    )}
  >
    {qty(value)}
  </span>
);

const FlagCell = ({ flag }: { flag: string | null }) =>
  flag ? (
    <span className="inline-flex items-center gap-1 text-[13px] text-destructive" title={flag}>
      <WarningIcon size={14} weight="fill" />
      Check
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

const stockColumns: ListColumn<StockRow>[] = [
  { id: "name", header: "Material", value: (row) => row.name, isTitle: true, hideable: false, sortable: true, width: 220, grow: true },
  { id: "unit", header: "Unit", value: (row) => row.unit, width: 80 },
  { id: "storeOpening", header: "Store opening", value: (row) => row.storeOpening, cell: (row) => qtyCell(row.storeOpening, { muted: true }), align: "end", sortable: true, width: 120 },
  { id: "purchased", header: "Purchased", value: (row) => row.purchased, cell: (row) => qtyCell(row.purchased, { muted: true }), align: "end", sortable: true, width: 110 },
  { id: "pbgReceived", header: "PBG received", value: (row) => row.pbgReceived, cell: (row) => qtyCell(row.pbgReceived, { muted: true }), align: "end", sortable: true, width: 120 },
  { id: "issued", header: "Issued", value: (row) => row.issued, cell: (row) => qtyCell(row.issued, { muted: true }), align: "end", sortable: true, width: 100 },
  { id: "consumed", header: "Used", value: (row) => row.consumed, cell: (row) => qtyCell(row.consumed, { muted: true }), align: "end", sortable: true, width: 100 },
  { id: "returned", header: "Returned", value: (row) => row.returned, cell: (row) => qtyCell(row.returned, { muted: true }), align: "end", sortable: true, width: 100 },
  { id: "adjusted", header: "Adjusted", value: (row) => row.adjusted, cell: (row) => qtyCell(row.adjusted, { muted: true }), align: "end", sortable: true, width: 100 },
  { id: "storeClosing", header: "Store closing", value: (row) => row.storeClosing, cell: (row) => qtyCell(row.storeClosing, { strong: true }), align: "end", sortable: true, width: 120 },
  { id: "withPlumbersClosing", header: "With plumbers", value: (row) => row.withPlumbersClosing, cell: (row) => qtyCell(row.withPlumbersClosing, { strong: true }), align: "end", sortable: true, width: 120 },
  { id: "flag", header: "Flag", value: (row) => (row.flag ? "Check" : ""), cell: (row) => <FlagCell flag={row.flag} />, width: 90 },
];

const holdingColumns: ListColumn<HoldingRow>[] = [
  {
    id: "plumberName",
    header: "Plumber / Labour",
    value: (row) => row.plumberName,
    cell: (row) => (
      <span>
        {row.plumberName}
        {row.category === "labour" ? <span className="text-muted-foreground"> (Labour)</span> : null}
      </span>
    ),
    isTitle: true,
    hideable: false,
    sortable: true,
    width: 220,
    grow: true,
  },
  { id: "materialName", header: "Material", value: (row) => row.materialName, sortable: true, width: 220 },
  { id: "unit", header: "Unit", value: (row) => row.unit, width: 80 },
  { id: "balance", header: "Holding", value: (row) => row.balance, cell: (row) => qtyCell(row.balance, { strong: true }), align: "end", sortable: true, width: 120 },
  { id: "flag", header: "Flag", value: (row) => (row.flag ? "Check" : ""), cell: (row) => <FlagCell flag={row.flag} />, width: 90 },
];

const VIEWS = [
  { id: "stock", label: "Stock movement" },
  { id: "holdings", label: "With plumbers & labour" },
] as const;
type View = (typeof VIEWS)[number]["id"];

/**
 * Material for the period, from the transaction history: per material the
 * store opening and closing, what came in, was issued, used and returned,
 * and what plumbers / labour still hold at the end of the period.
 */
export function MaterialReport({ filters }: { filters: ReportFilters }) {
  const query = useQuery({
    queryKey: ["reports", "material", filters],
    queryFn: () => materialReportApi.get(filters),
  });
  const [view, setView] = useState<View>("stock");
  const [exporting, setExporting] = useState(false);
  const stockList = useListState({ pageSize: 25, storageKey: "report-material-stock" });
  const holdingList = useListState({ pageSize: 25, storageKey: "report-material-holdings" });
  const stock: StockRow[] = (query.data?.rows ?? []).map((row) => ({ ...row, id: row.materialId }));
  const holdings: HoldingRow[] = (query.data?.holdings ?? []).map((row) => ({ ...row, id: `${row.plumberId}:${row.materialId}` }));
  const stockRows = useClientRows(stock, stockList, { columns: stockColumns });
  const holdingRows = useClientRows(holdings, holdingList, { columns: holdingColumns });

  if (query.isLoading) return <MaterialSkeleton />;
  if (query.isError || !query.data) {
    return (
      <div className="rounded-card border border-border bg-card shadow-card">
        <EmptyState illustration="error" title="Couldn't load the material report" action={{ label: "Retry", onClick: () => void query.refetch() }} />
      </div>
    );
  }

  const { totals } = query.data;

  async function exportExcel() {
    setExporting(true);
    try {
      if (view === "stock") {
        await exportRowsToExcel(
          `material-report-${filters.from}-to-${filters.to}`,
          [
            { label: "Material", getValue: (row: StockRow) => row.name },
            { label: "Unit", getValue: (row) => row.unit },
            { label: "Store opening", getValue: (row) => row.storeOpening },
            { label: "Purchased", getValue: (row) => row.purchased },
            { label: "PBG received", getValue: (row) => row.pbgReceived },
            { label: "Issued to plumbers", getValue: (row) => row.issued },
            { label: "Used", getValue: (row) => row.consumed },
            { label: "Returned", getValue: (row) => row.returned },
            { label: "Adjusted", getValue: (row) => row.adjusted },
            { label: "Store closing", getValue: (row) => row.storeClosing },
            { label: "With plumbers (closing)", getValue: (row) => row.withPlumbersClosing },
            { label: "Flag", getValue: (row) => row.flag ?? "" },
          ],
          stock,
        );
      } else {
        await exportRowsToExcel(
          `material-holdings-${filters.to}`,
          [
            { label: "Plumber / Labour", getValue: (row: HoldingRow) => row.plumberName },
            { label: "Type", getValue: (row) => (row.category === "labour" ? "Labour" : "Plumber") },
            { label: "Material", getValue: (row) => row.materialName },
            { label: "Unit", getValue: (row) => row.unit },
            { label: "Holding", getValue: (row) => row.balance },
            { label: "Flag", getValue: (row) => row.flag ?? "" },
          ],
          holdings,
        );
      }
    } finally {
      setExporting(false);
    }
  }

  const exportButton = (
    <Button
      type="button"
      variant="outline"
      size="compact"
      disabled={exporting || (view === "stock" ? stock.length === 0 : holdings.length === 0)}
      onClick={() => void exportExcel()}
    >
      <DownloadSimpleIcon size={14} />
      {exporting ? "Exporting..." : "Export"}
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <CompactStatGrid columns={4}>
        <DashboardStatCard label="Materials in use" value={totals.materials.toLocaleString("en-IN")} icon={PackageIcon} tone="primary" dense />
        <DashboardStatCard label="Entries in period" value={totals.movements.toLocaleString("en-IN")} icon={ArrowsLeftRightIcon} tone="info" dense />
        <DashboardStatCard label="People holding material" value={totals.holders.toLocaleString("en-IN")} icon={UsersThreeIcon} tone="success" dense />
        <DashboardStatCard
          label="Needs a check"
          value={totals.flagged.toLocaleString("en-IN")}
          icon={WarningCircleIcon}
          tone={totals.flagged ? "danger" : "info"}
          dense
        />
      </CompactStatGrid>

      {totals.flagged ? (
        <p className="rounded-lg bg-status-warning-bg px-3 py-2 text-[13px] text-status-warning-fg">
          {totals.flagged} {totals.flagged === 1 ? "line shows" : "lines show"} more used or returned than was issued. Usually an entry is missing or
          was recorded against the wrong plumber or material.
        </p>
      ) : null}

      <div className="flex rounded-lg border border-border bg-card p-0.5 self-start" role="tablist" aria-label="Material report view">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={view === item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              view === item.id ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {view === "stock" ? (
        <ListTable
          itemLabel="material"
          rows={stockRows.pageRows}
          total={stockRows.total}
          columns={stockColumns}
          state={stockList}
          searchPlaceholder="Search materials..."
          actions={exportButton}
          empty={{ illustration: "materials", title: "No material entries for this period.", description: "Pick a longer period or another project." }}
        />
      ) : (
        <ListTable
          itemLabel="holding"
          rows={holdingRows.pageRows}
          total={holdingRows.total}
          columns={holdingColumns}
          state={holdingList}
          searchPlaceholder="Search plumber or material..."
          actions={exportButton}
          empty={{ illustration: "materials", title: "Nobody holds material at the end of this period." }}
        />
      )}
    </div>
  );
}

function MaterialSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <CompactStatGrid columns={4}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[74px] rounded-card" />
        ))}
      </CompactStatGrid>
      <Skeleton className="h-80 rounded-card" />
    </div>
  );
}
