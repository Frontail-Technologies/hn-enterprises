"use client";

import { useMemo, useState } from "react";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAuditLogModulesQuery, useAuditLogsPageQuery } from "../hooks/useAuditLogs";
import { auditLogsApi, type AuditLog } from "../services/audit-logs.service";
import { formatDateTime } from "../utils/format";
import { PageShell } from "@/components/shared/PageShell";

const PAGE_SIZE = 50;

const exportColumns: ExportColumn<AuditLog>[] = [
  { label: "User", getValue: (row) => row.user },
  { label: "Action", getValue: (row) => row.action },
  { label: "Module", getValue: (row) => row.module },
  { label: "Description", getValue: (row) => row.description },
  { label: "Date & Time", getValue: (row) => formatDateTime(row.dateTime) },
  { label: "IP/Device", getValue: (row) => row.device },
];

export function AuditLogsPage() {
  const [filters, setFilters] = useState({ search: "", module: "all" });
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const listParams = {
    search: debouncedSearch || undefined,
    module: filters.module !== "all" ? filters.module : undefined,
  };

  const { data: result, isLoading } = useAuditLogsPageQuery({ ...listParams, page, limit: PAGE_SIZE });
  const data = useMemo(() => result?.data ?? [], [result]);
  const pagination = result?.pagination;

  const { data: modules = [] } = useAuditLogModulesQuery();

  function updateFilter(key: string, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  async function handleExport() {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const total = pagination?.total ?? data.length;
      const { data: allRows } = await auditLogsApi.listPage({ ...listParams, page: 1, limit: Math.max(total, 1) });
      await exportRowsToExcel("audit-logs.xlsx", exportColumns, allRows);
    } finally {
      setIsExporting(false);
    }
  }

  const columns: ColumnDef<AuditLog>[] = [
    { key: "user", header: "User", render: (row) => <b>{row.user}</b> },
    { key: "action", header: "Action" },
    { key: "module", header: "Module" },
    { key: "description", header: "Description" },
    { key: "dateTime", header: "Date & Time", render: (row) => formatDateTime(row.dateTime) },
    { key: "device", header: "IP/Device" },
  ];

  return (
    <PageShell
      title="Audit Logs"
      actions={
        <>
          <FilterSheetButton
            searchKey="search"
            searchPlaceholder="Search user or description..."
            title="Audit Filters"
            values={filters}
            filters={[
              {
                key: "module",
                placeholder: "All Modules",
                options: modules.map((module) => ({ value: module, label: module })),
              },
            ]}
            onChange={updateFilter}
            onReset={() => {
              setFilters({ search: "", module: "all" });
              setPage(1);
            }}
          />
          <Button type="button" variant="outline" size="compact" disabled={isExporting} onClick={handleExport}>
            <DownloadSimpleIcon size={12} />
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>
        </>
      }
      contentClassName="space-y-3"
    >
      <DataTable columns={columns} data={data} isLoading={isLoading} emptyTitle="No audit log entries found" />
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
