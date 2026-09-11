"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CaretDownIcon, CheckCircleIcon, CurrencyInrIcon, DownloadSimpleIcon, PaperPlaneTiltIcon, UploadSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { ExcelDataGrid } from "@/components/shared/ExcelDataGrid";
import { FilterDialog } from "@/components/shared/FilterDialog";
import type { FilterConfig } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsTrigger } from "@/components/ui/tabs";
import { ScrollableTabsList } from "@/components/shared/ScrollableTabsList";
import { cn } from "@/lib/utils";
import { exportRowsToExcel } from "@/lib/export-excel";
import { formatCompactCount } from "@/lib/format";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { paymentTabs } from "../data/payments.data";
import { usePaymentsPageQuery, usePaymentsSummaryQuery } from "../hooks/usePayments";
import { usePaymentsColumns } from "../hooks/usePaymentsColumns";
import { paymentsApi } from "../services/payments.service";
import type { PaymentCategory, PaymentStatus } from "../types/payment.types";
import { money } from "../utils/format";
import { PaymentDialog } from "./PaymentDialog";

const categories = paymentTabs as PaymentCategory[];
const PAGE_SIZE = 50;

const dateFilters: FilterConfig[] = [
  { key: "from", toKey: "to", type: "dateRange", placeholder: "Date", options: [] },
];

export function PaymentsExpensesPage() {
  const router = useRouter();
  const [active, setActive] = useState<PaymentCategory>(categories[0]);
  const [dateRange, setDateRange] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const from = dateRange.from && dateRange.from !== "all" ? dateRange.from : undefined;
  const to = dateRange.to && dateRange.to !== "all" ? dateRange.to : undefined;

  const { data: pageResult, isLoading: paymentsLoading } = usePaymentsPageQuery({
    category: active,
    from,
    to,
    page,
    limit: PAGE_SIZE,
  });
  const data = useMemo(() => pageResult?.data ?? [], [pageResult]);
  const pagination = pageResult?.pagination;

  // Dataset-wide (respects the date filter, ignores the category tab) - the
  // stat cards and tab badges are whole-dataset figures, not page figures.
  const { data: summary } = usePaymentsSummaryQuery({ from, to });

  const { data: plumbers = [] } = usePlumbersQuery();
  const plumberNameById = useMemo(() => new Map(plumbers.map((p) => [p.id, p.name])), [plumbers]);

  const statusTotal = (status: PaymentStatus) => summary?.statusBreakdown.find((row) => row.status === status);
  const monthlyTotal = statusTotal("Approved")?.total ?? 0;
  const submittedCount = statusTotal("Submitted")?.count ?? 0;
  const draftOrRejectedCount = (statusTotal("Draft")?.count ?? 0) + (statusTotal("Rejected")?.count ?? 0);
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<PaymentCategory, number>> = {};
    for (const row of summary?.categoryBreakdown ?? []) counts[row.category] = row.count;
    return counts;
  }, [summary]);

  const columns = usePaymentsColumns({ plumberNameById });

  function handleCategoryChange(next: PaymentCategory) {
    setActive(next);
    setPage(1);
  }

  function handleDateChange(key: string, value: string) {
    setDateRange((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  async function handleExport() {
    if (isExporting) return;
    setIsExporting(true);
    try {
      // Exports ALL rows matching the current category + date filter, not just
      // the loaded page - bounded by the filtered total.
      const total = pagination?.total ?? data.length;
      const { data: allRows } = await paymentsApi.listPage({ category: active, from, to, page: 1, limit: Math.max(total, 1) });
      await exportRowsToExcel(
        `${active.toLowerCase().replace(/\s+/g, "-")}.xlsx`,
        columns.filter((column) => column.key !== "actions"),
        allRows,
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments & Expenses"
        icon={CurrencyInrIcon}
        actions={
          <div className="grid grid-cols-2 gap-2 sm:contents">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button type="button" variant="outline" size="compact">
                    More
                    <CaretDownIcon size={12} />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled={isExporting} onClick={handleExport}>
                  <DownloadSimpleIcon size={14} />
                  {isExporting ? "Exporting..." : "Export Excel"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/payments/import")}>
                  <UploadSimpleIcon size={14} />
                  Import
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <PaymentDialog defaultCategory={active} />
          </div>
        }
      />
      <CompactStatGrid columns={3}>
        <DashboardStatCard label="Approved This Month" value={money(monthlyTotal)} icon={CheckCircleIcon} tone="success" dense />
        <DashboardStatCard label="Submitted" value={formatCompactCount(submittedCount)} icon={PaperPlaneTiltIcon} tone="info" dense />
        <DashboardStatCard label="Draft / Rejected" value={formatCompactCount(draftOrRejectedCount)} icon={WarningCircleIcon} tone="danger" dense />
      </CompactStatGrid>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={active} onValueChange={(value) => value && handleCategoryChange(value as PaymentCategory)} className="min-w-0 flex-1">
          <ScrollableTabsList>
            {categories.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="shrink-0">
                <span className="whitespace-nowrap">{tab}</span>
                <span
                  title={(categoryCounts[tab] ?? 0).toLocaleString("en-IN")}
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    tab === active ? "bg-white/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {formatCompactCount(categoryCounts[tab] ?? 0)}
                </span>
              </TabsTrigger>
            ))}
          </ScrollableTabsList>
        </Tabs>
        <FilterDialog
          filters={dateFilters}
          values={dateRange}
          onChange={handleDateChange}
          onReset={() => {
            setDateRange({});
            setPage(1);
          }}
          title="Filter by Date"
        />
      </div>
      <ExcelDataGrid columns={columns} rows={data} emptyTitle="No expenses found" isLoading={paymentsLoading} enableFullView />
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
    </div>
  );
}
