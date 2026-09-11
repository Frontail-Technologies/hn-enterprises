"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { ExcelDataGrid } from "@/components/shared/ExcelDataGrid";
import { Pagination } from "@/components/shared/Pagination";
import { PageShell } from "@/components/shared/PageShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type DashboardStatKey,
  getDashboardStatDefinition,
  getDashboardStatRows,
} from "@/features/dashboard/services/dashboard-stats.service";
import { getDashboardStatColumns } from "@/features/dashboard/columns/dashboard-stat.columns";
import { findTrustedZeroCount } from "@/features/dashboard/model/dashboard-stat-cache.model";
import { customersApi } from "@/features/customers/api/customers.api";
import { useCustomersListQuery } from "@/features/customers/queries/useCustomersQuery";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { exportRowsToExcel } from "@/lib/export-excel";

const PAGE_SIZE = 50;

export function DashboardStatDetailPage({
  statKey,
  projectId = "all",
  city = "all",
}: {
  statKey: DashboardStatKey;
  projectId?: string;
  city?: string;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const definition = getDashboardStatDefinition(statKey);
  const queryClient = useQueryClient();
  const knownZero = useMemo(
    () => findTrustedZeroCount(queryClient, statKey, projectId, city),
    [queryClient, statKey, projectId, city],
  );

  const scopedProjectId = projectId === "all" ? undefined : projectId;
  const scopedCity = city === "all" ? undefined : city;
  const queryParams = {
    projectId: scopedProjectId,
    city: scopedCity,
    statKey,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data: result, isLoading } = useCustomersListQuery(queryParams, { enabled: !knownZero });
  const customers = useMemo(() => result?.data ?? [], [result]);
  const pagination = result?.pagination;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const rows = useMemo(
    () => (knownZero ? [] : getDashboardStatRows(statKey, customers)),
    [knownZero, customers, statKey],
  );
  const columns = useMemo(() => getDashboardStatColumns(statKey), [statKey]);

  async function handleExport() {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const total = pagination?.total ?? rows.length;
      const { data } = await customersApi.listPaginated({
        ...queryParams,
        page: 1,
        limit: Math.max(total, 1),
      });
      await exportRowsToExcel(
        `${statKey}.xlsx`,
        columns.filter((column) => column.key !== "actions"),
        getDashboardStatRows(statKey, data),
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <PageShell
      title={definition.title}
      actions={
        <>
          <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ArrowLeftIcon size={14} />
            Back
          </Link>
          <Button type="button" size="sm" disabled={isExporting || knownZero} onClick={handleExport}>
            <DownloadSimpleIcon size={14} />
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>
        </>
      }
      contentClassName="space-y-3"
    >
      <Input
        value={search}
        onChange={(event) => handleSearchChange(event.target.value)}
        placeholder="Search customer, BR/TR, mobile..."
        className="h-8 w-96 max-w-full"
      />

      <ExcelDataGrid
        columns={columns}
        rows={rows}
        emptyTitle={knownZero ? `No records for ${definition.title}` : "No matching records found"}
        isLoading={isLoading}
        maxHeightClassName="max-h-[68vh]"
      />
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
    </PageShell>
  );
}
