"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format, subMonths } from "date-fns";
import { CoinsIcon, DownloadSimpleIcon, HourglassIcon, ReceiptIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { ListTable, useListState, type ListColumn, type ListFilter } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useDownloadWageRegister } from "@/features/exports/hooks/useExports";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { billingTabs } from "../data/bills.data";
import type { BillingView } from "../types/commercial.types";
import type { Bill, BillStatus } from "../types/bill.types";
import { useBillsPageQuery, useBillsSummaryQuery } from "../hooks/useBills";
import { billsApi } from "../services/bills.service";
import { formatDate, money } from "../utils/format";
import { getBillHref } from "../utils/billing.utils";
import { BillDialog } from "./billing/BillDialog";
import { BillingActions } from "./billing/BillingActions";
import { BillingTrends } from "./billing/BillingTrends";
import { WageDialog } from "./billing/WageDialog";
import { WageRegister } from "./billing/WageRegister";
import { projectOption } from "@/features/projects/utils/project-option";
import { useUrlTab } from "@/hooks/useUrlTab";

const BILL_STATUSES: BillStatus[] = ["Draft", "Submitted", "Completed", "Overdue"];

const billColumns: ListColumn<Bill>[] = [
  {
    id: "billNumber",
    header: "Bill number",
    value: (row) => row.billNumber,
    isTitle: true,
    hideable: false,
    width: 170,
    cell: (row) => (
      <Link href={getBillHref(row)} className="hover:text-primary hover:underline">
        {row.billNumber}
      </Link>
    ),
  },
  { id: "project", header: "Project", value: (row) => row.projectName, width: 240, grow: true, cell: (row) => <span className="font-medium text-foreground">{row.projectName || "—"}</span> },
  { id: "billDate", header: "Bill date", value: (row) => row.billDate, width: 130, cell: (row) => formatDate(row.billDate) },
  { id: "totalAmount", header: "Bill amount", value: (row) => row.totalAmount, align: "end", width: 130, cell: (row) => money(row.totalAmount) },
  { id: "tax", header: "Tax", value: (row) => row.tax, align: "end", width: 110, cell: (row) => money(row.tax) },
  { id: "tds", header: "TDS", value: (row) => row.tdsIncome + row.tdsGst, align: "end", width: 110, cell: (row) => money(row.tdsIncome + row.tdsGst) },
  { id: "prs", header: "PRS", value: (row) => row.prs, align: "end", width: 100, cell: (row) => money(row.prs) },
  { id: "bgHeld", header: "Bank guarantee", value: (row) => row.bgHeld, align: "end", width: 130, cell: (row) => money(row.bgHeld) },
  { id: "holdHeld", header: "Hold", value: (row) => row.holdHeld, align: "end", width: 110, cell: (row) => money(row.holdHeld) },
  { id: "netPayable", header: "Net", value: (row) => row.netPayable, align: "end", width: 130, cell: (row) => money(row.netPayable) },
  { id: "paidAmount", header: "Received", value: (row) => row.paidAmount, align: "end", width: 130, cell: (row) => money(row.paidAmount) },
  {
    id: "pendingAmount",
    header: "Pending",
    value: (row) => row.pendingAmount,
    align: "end",
    width: 130,
    cell: (row) => <span className={row.pendingAmount > 0 ? "font-medium text-destructive" : undefined}>{money(row.pendingAmount)}</span>,
  },
  { id: "status", header: "Status", value: (row) => row.status, width: 120, cell: (row) => <StatusBadge status={row.status} /> },
];

const exportColumns: ExportColumn<Bill>[] = [
  { label: "Bill Number", getValue: (row) => row.billNumber },
  { label: "Project", getValue: (row) => row.projectName || "-" },
  { label: "Bill Date", getValue: (row) => formatDate(row.billDate) },
  { label: "Bill Amount", getValue: (row) => row.totalAmount },
  { label: "Tax", getValue: (row) => row.tax },
  { label: "TDS (Income tax)", getValue: (row) => row.tdsIncome },
  { label: "TDS (GST)", getValue: (row) => row.tdsGst },
  { label: "PRS", getValue: (row) => row.prs },
  { label: "Bank Guarantee", getValue: (row) => row.bankGuarantee },
  { label: "BG Released", getValue: (row) => row.bgReleased },
  { label: "Hold Amount", getValue: (row) => row.holdAmount },
  { label: "Hold Released", getValue: (row) => row.holdReleased },
  { label: "Net", getValue: (row) => row.netPayable },
  { label: "Received", getValue: (row) => row.paidAmount },
  { label: "Pending", getValue: (row) => row.pendingAmount },
  { label: "Status", getValue: (row) => row.status },
];

function monthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = subMonths(now, index);
    return { value: format(date, "yyyy-MM"), label: format(date, "MMMM yyyy") };
  });
}

export function BillingPage() {
  const [activeView, setActiveView] = useUrlTab<BillingView>(["wages", "bills"], "wages");
  const wageMonthOptions = useMemo(() => monthOptions(), []);
  const [wageMonth, setWageMonth] = useState(wageMonthOptions[0].value);
  const downloadWageRegister = useDownloadWageRegister();

  const urlProjectId = useSearchParams().get("projectId");
  const list = useListState({ pageSize: 50, storageKey: "bills", initialFilters: urlProjectId ? { project: urlProjectId } : {} });
  const [isExporting, setIsExporting] = useState(false);

  const listParams = {
    search: list.debouncedSearch || undefined,
    status: (list.filters.status as BillStatus | undefined) || undefined,
    projectId: list.filters.project || undefined,
  };

  const { data: pageResult, isLoading, isError, refetch } = useBillsPageQuery({ ...listParams, page: list.page, limit: list.pageSize });
  const bills = useMemo(() => pageResult?.data ?? [], [pageResult]);
  const total = pageResult?.pagination?.total ?? bills.length;

  const { data: totals } = useBillsSummaryQuery(listParams);

  // Projects list is a bounded filter selector here (not a label map - the
  // bill row's project name is server-joined).
  const { data: projects = [] } = useProjectsQuery();
  const filters = useMemo<ListFilter[]>(
    () => [
      { id: "project", label: "Project", quick: true, options: projects.map(projectOption) },
      { id: "status", label: "Status", quick: true, options: BILL_STATUSES.map((s) => ({ value: s, label: s })) },
    ],
    [projects],
  );

  async function handleExportBills() {
    if (isExporting) return;
    setIsExporting(true);
    try {
      // Exports ALL bills matching the current filters, not just the loaded page.
      const { data: allRows } = await billsApi.listPage({ ...listParams, page: 1, limit: Math.max(total, 1) });
      await exportRowsToExcel("bills.xlsx", exportColumns, allRows);
    } finally {
      setIsExporting(false);
    }
  }

  function handleExportWageRegister() {
    const [yearStr, monthStr] = wageMonth.split("-");
    downloadWageRegister.mutate({ month: Number(monthStr), year: Number(yearStr) });
  }

  return (
    <PageShell
      title="Billing"
      description="Monthly wages and project bills."
      tabs={<UnderlineTabs items={billingTabs} active={activeView} onChange={(id) => setActiveView(id as BillingView)} />}
      actions={
        activeView === "bills" ? (
          <BillDialog triggerLabel="Create Bill" defaultProjectId={list.filters.project || undefined} />
        ) : (
          <>
            <Select value={wageMonth} onValueChange={(value) => value && setWageMonth(value)}>
              <SelectTrigger className="w-full bg-card sm:w-37.5" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wageMonthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2 sm:contents">
              <WageDialog month={wageMonth} triggerLabel="Add Wage Entry" />
              <Button
                type="button"
                variant="outline"
                size="compact"
                disabled={downloadWageRegister.isPending}
                onClick={handleExportWageRegister}
              >
                <DownloadSimpleIcon size={12} />
                {downloadWageRegister.isPending ? "Exporting..." : "Export Wage Register"}
              </Button>
            </div>
          </>
        )
      }
    >
      {activeView === "bills" ? (
        <div className="space-y-4">
          <CompactStatGrid columns={4}>
            <DashboardStatCard label="Total Billed" value={money(totals?.billed ?? 0)} icon={ReceiptIcon} tone="info" dense />
            <DashboardStatCard label="Received" value={money(totals?.received ?? 0)} icon={CoinsIcon} tone="success" dense />
            <DashboardStatCard label="Pending" value={money(totals?.pending ?? 0)} icon={HourglassIcon} tone="warning" dense />
            <DashboardStatCard label="Overdue" value={money(totals?.overdue ?? 0)} icon={WarningCircleIcon} tone="danger" dense />
            <DashboardStatCard label="TDS deducted" value={money(totals?.tds ?? 0)} icon={ReceiptIcon} tone="primary" dense />
            <DashboardStatCard label="PRS" value={money(totals?.prs ?? 0)} icon={ReceiptIcon} tone="primary" dense />
            <DashboardStatCard label="Bank guarantee held" value={money(totals?.bgHeld ?? 0)} icon={HourglassIcon} tone="warning" dense />
            <DashboardStatCard label="Hold amount held" value={money(totals?.holdHeld ?? 0)} icon={HourglassIcon} tone="warning" dense />
          </CompactStatGrid>
          <ListTable
            itemLabel="bill"
            rows={bills}
            total={total}
            columns={billColumns}
            state={list}
            filters={filters}
            searchPlaceholder="Search bill number..."
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            empty={{ illustration: "billing", title: "No bills yet", description: "Bills you create for projects will appear here." }}
            actions={
              <Button type="button" variant="outline" size="compact" disabled={isExporting || total === 0} onClick={handleExportBills}>
                <DownloadSimpleIcon size={14} />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            }
            rowActionsWidth={176}
            renderRowActions={(row) => <BillingActions bill={row} />}
          />
          {/* Charts under the table, so the bills stay at the top. */}
          <BillingTrends projectId={list.filters.project || undefined} />
        </div>
      ) : (
        <WageRegister month={wageMonth} />
      )}
    </PageShell>
  );
}
