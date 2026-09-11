"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, subMonths } from "date-fns";
import { CoinsIcon, DownloadSimpleIcon, HourglassIcon, ReceiptIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
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
import { WageDialog } from "./billing/WageDialog";
import { WageRegister } from "./billing/WageRegister";

const PAGE_SIZE = 50;
const BILL_STATUSES: BillStatus[] = ["Draft", "Submitted", "Completed", "Overdue"];

function monthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = subMonths(now, index);
    return { value: format(date, "yyyy-MM"), label: format(date, "MMMM yyyy") };
  });
}

export function BillingPage() {
  const [activeView, setActiveView] = useState<BillingView>("wages");
  const wageMonthOptions = useMemo(() => monthOptions(), []);
  const [wageMonth, setWageMonth] = useState(wageMonthOptions[0].value);
  const downloadWageRegister = useDownloadWageRegister();

  const [filters, setFilters] = useState({ search: "", status: "all", project: "all" });
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const listParams = {
    search: filters.search || undefined,
    status: filters.status !== "all" ? (filters.status as BillStatus) : undefined,
    projectId: filters.project !== "all" ? filters.project : undefined,
  };

  const { data: pageResult, isLoading } = useBillsPageQuery({ ...listParams, page, limit: PAGE_SIZE });
  const bills = useMemo(() => pageResult?.data ?? [], [pageResult]);
  const pagination = pageResult?.pagination;

  const { data: totals } = useBillsSummaryQuery(listParams);

  // Projects list is a bounded filter selector here (not a label map - the
  // bill row's project name is server-joined).
  const { data: projects = [] } = useProjectsQuery();
  const projectOptions = useMemo(
    () => projects.map((project) => ({ value: project.id, label: project.name })),
    [projects],
  );

  function updateFilter(key: string, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  const columns: ColumnDef<Bill>[] = [
    {
      key: "billNumber",
      header: "Bill Number",
      render: (row) => (
        <Link href={getBillHref(row)} className="font-semibold text-foreground hover:text-primary">
          {row.billNumber}
        </Link>
      ),
    },
    { key: "project", header: "Project", render: (row) => <p className="font-medium text-foreground">{row.projectName || "-"}</p> },
    { key: "billDate", header: "Bill Date", render: (row) => formatDate(row.billDate) },
    { key: "totalAmount", header: "Total Amount", render: (row) => money(row.totalAmount) },
    { key: "paidAmount", header: "Paid Amount", render: (row) => money(row.paidAmount) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "actions", header: "Actions", className: "w-32", render: (row) => <BillingActions bill={row} /> },
  ];

  const exportColumns: ExportColumn<Bill>[] = [
    { label: "Bill Number", getValue: (row) => row.billNumber },
    { label: "Project", getValue: (row) => row.projectName || "-" },
    { label: "Bill Date", getValue: (row) => formatDate(row.billDate) },
    { label: "Total Amount", getValue: (row) => row.totalAmount },
    { label: "Paid Amount", getValue: (row) => row.paidAmount },
    { label: "Status", getValue: (row) => row.status },
  ];

  async function handleExportBills() {
    if (isExporting) return;
    setIsExporting(true);
    try {
      // Exports ALL bills matching the current filters, not just the loaded page.
      const total = pagination?.total ?? bills.length;
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
    <div className="space-y-5">
      <PageHeader
        title="Billing"
        icon={ReceiptIcon}
        actions={
          activeView === "bills" ? (
            <>
              <FilterSheetButton
                searchKey="search"
                searchPlaceholder="Search bill number..."
                title="Billing Filters"
                values={filters}
                filters={[
                  { key: "project", placeholder: "All Projects", searchable: true, options: projectOptions },
                  { key: "status", placeholder: "All Statuses", options: BILL_STATUSES.map((s) => ({ value: s, label: s })) },
                ]}
                onChange={updateFilter}
                onReset={() => {
                  setFilters({ search: "", status: "all", project: "all" });
                  setPage(1);
                }}
              />
              <div className="grid grid-cols-2 gap-2 sm:contents">
                <Button type="button" variant="outline" size="compact" disabled={isExporting} onClick={handleExportBills}>
                  <DownloadSimpleIcon size={12} />
                  {isExporting ? "Exporting..." : "Export Excel"}
                </Button>
                <BillDialog triggerLabel="Create Bill" />
              </div>
            </>
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
      />
      <UnderlineTabs items={billingTabs} active={activeView} onChange={(id) => setActiveView(id as BillingView)} />
      {activeView === "bills" ? (
        <>
          <CompactStatGrid columns={4}>
            <DashboardStatCard label="Total Billed" value={money(totals?.billed ?? 0)} icon={ReceiptIcon} tone="info" dense />
            <DashboardStatCard label="Received" value={money(totals?.received ?? 0)} icon={CoinsIcon} tone="success" dense />
            <DashboardStatCard label="Pending" value={money(totals?.pending ?? 0)} icon={HourglassIcon} tone="warning" dense />
            <DashboardStatCard label="Overdue" value={money(totals?.overdue ?? 0)} icon={WarningCircleIcon} tone="danger" dense />
          </CompactStatGrid>
          <DataTable columns={columns} data={bills} isLoading={isLoading} emptyTitle="No bills found" />
          {pagination && pagination.total > 0 ? (
            <Pagination
              compact
              page={pagination.page}
              pageCount={Math.max(1, pagination.totalPages)}
              totalItems={pagination.total}
              startItem={(pagination.page - 1) * pagination.limit + 1}
              endItem={Math.min(pagination.page * pagination.limit, pagination.total)}
              onPageChange={setPage}
            />
          ) : null}
        </>
      ) : (
        <WageRegister month={wageMonth} />
      )}
    </div>
  );
}
