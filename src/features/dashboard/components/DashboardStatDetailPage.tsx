"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, DownloadSimpleIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { ListTable, useListState } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type DashboardStatKey,
  getDashboardStatDefinition,
  getDashboardStatRows,
} from "@/features/dashboard/services/dashboard-stats.service";
import { getDashboardStatColumns, getDashboardStatExportColumns } from "@/features/dashboard/columns/dashboard-stat.columns";
import { findTrustedZeroCount } from "@/features/dashboard/model/dashboard-stat-cache.model";
import { customersApi } from "@/features/customers/api/customers.api";
import { useCustomersListQuery } from "@/features/customers/queries/useCustomersQuery";
import { exportRowsToExcel } from "@/lib/export-excel";

export function DashboardStatDetailPage({
  statKey,
  projectId = "all",
  city = "all",
}: {
  statKey: DashboardStatKey;
  projectId?: string;
  city?: string;
}) {
  const list = useListState({ pageSize: 50, storageKey: `dashboard-stat-${statKey}` });
  const [isExporting, setIsExporting] = useState(false);
  const definition = getDashboardStatDefinition(statKey);
  const queryClient = useQueryClient();
  const knownZero = useMemo(
    () => findTrustedZeroCount(queryClient, statKey, projectId, city),
    [queryClient, statKey, projectId, city],
  );

  const queryParams = {
    projectId: projectId === "all" ? undefined : projectId,
    city: city === "all" ? undefined : city,
    statKey,
    search: list.debouncedSearch || undefined,
    page: list.page,
    limit: list.pageSize,
  };

  const { data: result, isLoading, isError, refetch } = useCustomersListQuery(queryParams, { enabled: !knownZero });
  const customers = useMemo(() => result?.data ?? [], [result]);
  // RG-013: a trusted zero resolves to 0 without fetching.
  const total = knownZero ? 0 : (result?.pagination?.total ?? customers.length);

  const rows = useMemo(() => (knownZero ? [] : getDashboardStatRows(statKey, customers)), [knownZero, customers, statKey]);
  const columns = useMemo(() => getDashboardStatColumns(statKey), [statKey]);

  async function handleExport() {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const { data } = await customersApi.listPaginated({ ...queryParams, page: 1, limit: Math.max(total, 1) });
      await exportRowsToExcel(`${statKey}.xlsx`, getDashboardStatExportColumns(statKey), getDashboardStatRows(statKey, data));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <PageShell
      title={definition.title}
      description="Customers counted in this dashboard figure."
      actions={
        <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "compact" })}>
          <ArrowLeftIcon size={14} />
          Back
        </Link>
      }
    >
      <ListTable
        itemLabel="customer"
        rows={rows}
        total={total}
        columns={columns}
        state={list}
        searchPlaceholder="Search customer, BR/TR, mobile..."
        isLoading={!knownZero && isLoading}
        isError={!knownZero && isError}
        onRetry={() => void refetch()}
        maxHeightClassName="max-h-[68vh]"
        empty={
          knownZero
            ? { illustration: "records", title: `No records for ${definition.title}` }
            : { illustration: "search", title: "No matching records found" }
        }
        actions={
          <Button type="button" size="compact" disabled={isExporting || knownZero} onClick={handleExport}>
            <DownloadSimpleIcon size={14} />
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>
        }
        rowActionsWidth={84}
        renderRowActions={(row) => (
          <Link
            href={`/customers/${row.customerId}/edit`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-primary")}
          >
            <PencilSimpleIcon size={14} />
            Edit
          </Link>
        )}
      />
    </PageShell>
  );
}
