"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  DownloadSimpleIcon,
  HandCoinsIcon,
  HourglassMediumIcon,
  LockSimpleIcon,
  MinusCircleIcon,
  ReceiptIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { axisProps, ChartCard, ChartTable, ChartTooltipCard, gridProps, inrCompact, LegendItem, SERIES } from "@/features/dashboard/components/charts/chart-kit";
import { money } from "@/features/commercial/utils/format";
import { exportRowsToExcel } from "@/lib/export-excel";
import { billingReportApi, type BillingReportData, type BillingReportProjectRow } from "../services/billing.service";
import type { ReportFilters } from "../types";

type ProjectRow = BillingReportProjectRow & { id: string };
type TooltipProps<T> = { active?: boolean; payload?: readonly { payload?: T }[] };
const hovered = <T,>(props: TooltipProps<T>) => (props.active ? props.payload?.[0]?.payload : undefined);

const moneyCell = (value: number, tone?: "danger" | "muted") => (
  <span className={tone === "danger" && value > 0 ? "font-medium text-destructive" : tone === "muted" ? "text-muted-foreground" : undefined}>
    {money(value)}
  </span>
);

const projectColumns: ListColumn<ProjectRow>[] = [
  { id: "projectName", header: "Project", value: (row) => row.projectName, isTitle: true, hideable: false, sortable: true, width: 240, grow: true },
  { id: "bills", header: "Bills", value: (row) => row.bills, align: "end", sortable: true, width: 80 },
  { id: "billed", header: "Billed", value: (row) => row.billed, cell: (row) => moneyCell(row.billed), align: "end", sortable: true, width: 140 },
  { id: "deductions", header: "TDS + PRS", value: (row) => row.deductions, cell: (row) => moneyCell(row.deductions, "muted"), align: "end", sortable: true, width: 130 },
  { id: "held", header: "BG + Hold kept", value: (row) => row.held, cell: (row) => moneyCell(row.held, "muted"), align: "end", sortable: true, width: 140 },
  { id: "netPayable", header: "Net payable", value: (row) => row.netPayable, cell: (row) => moneyCell(row.netPayable), align: "end", sortable: true, width: 140 },
  { id: "paid", header: "Received", value: (row) => row.paid, cell: (row) => moneyCell(row.paid), align: "end", sortable: true, width: 130 },
  { id: "pending", header: "Pending", value: (row) => row.pending, cell: (row) => moneyCell(row.pending), align: "end", sortable: true, width: 130 },
  { id: "overdue", header: "Overdue", value: (row) => row.overdue, cell: (row) => moneyCell(row.overdue, "danger"), align: "end", sortable: true, width: 130 },
];

const monthLabel = (month: string) => format(parseISO(`${month}-01`), "MMM yy");

/**
 * Billing for the period: what was billed (by bill date), what came in (by
 * payment date), what is still pending / overdue, and how old the pending
 * amounts are, with a per-project table.
 */
export function BillingReport({ filters }: { filters: ReportFilters }) {
  const query = useQuery({
    queryKey: ["reports", "billing", filters],
    queryFn: () => billingReportApi.get(filters),
  });
  const list = useListState({ pageSize: 25, storageKey: "report-billing-projects" });
  const rows = (query.data?.projects ?? []).map((row) => ({ ...row, id: row.projectId }));
  const tableRows = useClientRows(rows, list, { columns: projectColumns });
  const [exporting, setExporting] = useState(false);

  if (query.isLoading) return <BillingSkeleton />;
  if (query.isError || !query.data) {
    return (
      <div className="rounded-card border border-border bg-card shadow-card">
        <EmptyState illustration="error" title="Couldn't load the billing report" action={{ label: "Retry", onClick: () => void query.refetch() }} />
      </div>
    );
  }

  const { totals, months, ageing } = query.data;
  const deductions = totals.tdsIncome + totals.tdsGst + totals.prs;
  const kept = totals.bgKept - totals.bgReleased + (totals.holdKept - totals.holdReleased);

  async function exportExcel() {
    setExporting(true);
    try {
      await exportRowsToExcel(
        `billing-report-${filters.from}-to-${filters.to}`,
        [
          { label: "Project", getValue: (row: ProjectRow) => row.projectName },
          { label: "Bills", getValue: (row) => row.bills },
          { label: "Billed (total + tax)", getValue: (row) => row.billed },
          { label: "TDS + PRS", getValue: (row) => row.deductions },
          { label: "BG + Hold kept", getValue: (row) => row.held },
          { label: "Net payable", getValue: (row) => row.netPayable },
          { label: "Received", getValue: (row) => row.paid },
          { label: "Pending", getValue: (row) => row.pending },
          { label: "Overdue", getValue: (row) => row.overdue },
        ],
        rows,
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <CompactStatGrid columns={3}>
        <DashboardStatCard label={`Billed · ${totals.bills} bills`} value={inrCompact(totals.billed)} fullValue={money(totals.billed)} icon={ReceiptIcon} tone="primary" dense />
        <DashboardStatCard label="Received in period" value={inrCompact(totals.receivedInPeriod)} fullValue={money(totals.receivedInPeriod)} icon={HandCoinsIcon} tone="success" dense />
        <DashboardStatCard label="Pending" value={inrCompact(totals.pending)} fullValue={money(totals.pending)} icon={HourglassMediumIcon} tone="warning" dense />
        <DashboardStatCard label="Overdue" value={inrCompact(totals.overdue)} fullValue={money(totals.overdue)} icon={WarningCircleIcon} tone="danger" dense />
        <DashboardStatCard label="TDS + PRS deducted" value={inrCompact(deductions)} fullValue={money(deductions)} icon={MinusCircleIcon} tone="info" dense />
        <DashboardStatCard label="BG + Hold still kept" value={inrCompact(kept)} fullValue={money(kept)} icon={LockSimpleIcon} tone="info" dense />
      </CompactStatGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        <MonthsChart months={months} />
        <AgeingChart ageing={ageing} />
      </div>

      <ListTable
        itemLabel="project"
        rows={tableRows.pageRows}
        total={tableRows.total}
        columns={projectColumns}
        state={list}
        searchPlaceholder="Search projects..."
        actions={
          <Button type="button" variant="outline" size="compact" disabled={exporting || rows.length === 0} onClick={() => void exportExcel()}>
            <DownloadSimpleIcon size={14} />
            {exporting ? "Exporting..." : "Export"}
          </Button>
        }
        empty={{ illustration: "billing", title: "No bills in this period.", description: "Pick a longer period or another project." }}
      />
    </div>
  );
}

function MonthsChart({ months }: { months: BillingReportData["months"] }) {
  const rows = months.map((row) => ({ ...row, label: monthLabel(row.month) }));
  const isEmpty = rows.every((row) => !row.billed && !row.received);
  return (
    <ChartCard
      title="Billed vs received"
      description="By month · billed on bill date, received on payment date"
      isLoading={false}
      isEmpty={isEmpty}
      emptyText="Nothing billed or received in this period."
      aside={
        <div className="hidden items-center gap-3 sm:flex">
          <LegendItem color={SERIES.primary} label="Billed" />
          <LegendItem color={SERIES.secondary} label="Received" />
        </div>
      }
      table={<ChartTable headers={["Month", "Billed", "Received"]} rows={rows.map((row) => [row.label, money(row.billed), money(row.received)])} />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="24%">
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} width={64} tickFormatter={(value: number) => inrCompact(value)} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={(props: TooltipProps<(typeof rows)[number]>) => {
              const row = hovered(props);
              return row ? (
                <ChartTooltipCard
                  title={row.label}
                  rows={[
                    { label: "Billed", value: money(row.billed), color: SERIES.primary },
                    { label: "Received", value: money(row.received), color: SERIES.secondary },
                  ]}
                />
              ) : null;
            }}
          />
          <Bar dataKey="billed" fill={SERIES.primary} maxBarSize={28} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="received" fill={SERIES.secondary} maxBarSize={28} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function AgeingChart({ ageing }: { ageing: BillingReportData["ageing"] }) {
  const total = ageing.reduce((sum, row) => sum + row.amount, 0);
  return (
    <ChartCard
      title="Pending by age"
      description="Days past the due date (bill date when there is no due date), as of today"
      isLoading={false}
      isEmpty={total <= 0}
      emptyText="Nothing pending on these bills."
      table={<ChartTable headers={["Age", "Bills", "Pending"]} rows={ageing.map((row) => [row.label, row.bills, money(row.amount)])} />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={ageing} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} width={64} tickFormatter={(value: number) => inrCompact(value)} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={(props: TooltipProps<(typeof ageing)[number]>) => {
              const row = hovered(props);
              return row ? (
                <ChartTooltipCard
                  title={row.label}
                  rows={[
                    { label: "Pending", value: money(row.amount), color: SERIES.secondary },
                    { label: "Bills", value: String(row.bills), muted: true },
                  ]}
                />
              ) : null;
            }}
          />
          <Bar dataKey="amount" fill={SERIES.secondary} maxBarSize={40} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function BillingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <CompactStatGrid columns={3}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-[74px] rounded-card" />
        ))}
      </CompactStatGrid>
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-card" />
        <Skeleton className="h-72 rounded-card" />
      </div>
      <Skeleton className="h-64 rounded-card" />
    </div>
  );
}
