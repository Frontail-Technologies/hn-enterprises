"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircleIcon, DownloadSimpleIcon, PaperPlaneTiltIcon, UploadSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { ListTable, useListState, type ListFilter } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { ScrollableTabsList } from "@/components/shared/ScrollableTabsList";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { exportRowsToExcel } from "@/lib/export-excel";
import { formatCompactCount } from "@/lib/format";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { paymentTabs } from "../data/payments.data";
import { usePaymentsPageQuery, usePaymentsSummaryQuery } from "../hooks/usePayments";
import { usePaymentsColumns } from "../hooks/usePaymentsColumns";
import { paymentsApi } from "../services/payments.service";
import type { PaymentCategory, PaymentStatus } from "../types/payment.types";
import { money } from "../utils/format";
import { PaymentActions } from "./PaymentActions";
import { PaymentDialog } from "./PaymentDialog";
import { projectOption } from "@/features/projects/utils/project-option";
import { useUrlTab } from "@/hooks/useUrlTab";

const categories = paymentTabs as PaymentCategory[];

// Same `from` / `to` query keys as the old date FilterDialog.

/**
 * Payments & Expenses. With `projectId` it is embedded in a project page:
 * fixed to that project (no project filter, no page title).
 */
export function PaymentsExpensesPage({ projectId: fixedProjectId }: { projectId?: string } = {}) {
  const [active, setActive] = useUrlTab<PaymentCategory>(categories, categories[0], "category");
  const urlProjectId = useSearchParams().get("projectId");
  const list = useListState({
    pageSize: 50,
    storageKey: fixedProjectId ? "project-payments" : "payments",
    initialFilters: !fixedProjectId && urlProjectId ? { projectId: urlProjectId } : {},
  });
  const { data: projects = [] } = useProjectsQuery();
  const projectId = fixedProjectId ?? (list.filters.projectId || undefined);
  const filters: ListFilter[] = [
    ...(fixedProjectId
      ? []
      : [{ id: "projectId", label: "Project", quick: true, options: projects.map(projectOption) } as ListFilter]),
    { type: "dateRange", id: "from", toId: "to", label: "Date" },
  ];
  const [isExporting, setIsExporting] = useState(false);

  const from = list.filters.from || undefined;
  const to = list.filters.to || undefined;

  const { data: pageResult, isLoading, isError, refetch } = usePaymentsPageQuery({
    category: active,
    projectId,
    from,
    to,
    page: list.page,
    limit: list.pageSize,
  });
  const data = useMemo(() => pageResult?.data ?? [], [pageResult]);
  const total = pageResult?.pagination?.total ?? data.length;

  // Dataset-wide (respects the date filter, ignores the category tab) - the
  // stat cards and tab badges are whole-dataset figures, not page figures.
  const { data: summary } = usePaymentsSummaryQuery({ projectId, from, to });

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

  const { columns, exportColumns } = usePaymentsColumns({ plumberNameById });

  function handleCategoryChange(next: PaymentCategory) {
    setActive(next);
    list.setPage(1);
  }

  async function handleExport() {
    if (isExporting) return;
    setIsExporting(true);
    try {
      // Exports ALL rows matching the current category + date filter, not just
      // the loaded page - bounded by the filtered total.
      const { data: allRows } = await paymentsApi.listPage({ category: active, projectId, from, to, page: 1, limit: Math.max(total, 1) });
      await exportRowsToExcel(`${active.toLowerCase().replace(/\s+/g, "-")}.xlsx`, exportColumns, allRows);
    } finally {
      setIsExporting(false);
    }
  }

  const content = (
    <>
      <CompactStatGrid columns={3}>
        <DashboardStatCard label="Approved This Month" value={money(monthlyTotal)} icon={CheckCircleIcon} tone="success" dense />
        <DashboardStatCard label="Submitted" value={formatCompactCount(submittedCount)} icon={PaperPlaneTiltIcon} tone="info" dense />
        <DashboardStatCard label="Draft / Rejected" value={formatCompactCount(draftOrRejectedCount)} icon={WarningCircleIcon} tone="danger" dense />
      </CompactStatGrid>

      <Tabs value={active} onValueChange={(value) => value && handleCategoryChange(value as PaymentCategory)} className="min-w-0">
        <ScrollableTabsList>
          {categories.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="shrink-0">
              <span className="whitespace-nowrap">{tab}</span>
              <span
                title={(categoryCounts[tab] ?? 0).toLocaleString("en-IN")}
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                  tab === active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {formatCompactCount(categoryCounts[tab] ?? 0)}
              </span>
            </TabsTrigger>
          ))}
        </ScrollableTabsList>
      </Tabs>

      <ListTable
        itemLabel="expense"
        rows={data}
        total={total}
        columns={columns}
        state={list}
        filters={filters}
        // The payments API has no text search; a search box would only filter the loaded page.
        searchable={false}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        enableFullView
        empty={{ illustration: "billing", title: `No ${active.toLowerCase()} entries`, description: "Expenses recorded in this category will appear here." }}
        rowActionsWidth={110}
        renderRowActions={(row) => <PaymentActions payment={row} />}
        actions={
          <>
            {fixedProjectId ? <PaymentDialog defaultCategory={active} /> : null}
            <Link href="/payments/import" className={buttonVariants({ variant: "outline", size: "compact" })}>
              <UploadSimpleIcon size={14} />
              Import
            </Link>
            <Button variant="outline" size="compact" disabled={isExporting || total === 0} onClick={handleExport}>
              <DownloadSimpleIcon size={14} />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </>
        }
      />
    </>
  );

  if (fixedProjectId) return <div className="flex flex-col gap-4">{content}</div>;

  return (
    <PageShell
      title="Payments & Expenses"
      description="Expenses and payments recorded by supervisors, by category."
      actions={<PaymentDialog defaultCategory={active} />}
    >
      {content}
    </PageShell>
  );
}
