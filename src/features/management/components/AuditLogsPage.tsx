"use client";

import { useMemo, useState } from "react";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { ListTable, useListState, type ListColumn, type ListFilter } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useAuditLogModulesQuery, useAuditLogsPageQuery } from "../hooks/useAuditLogs";
import { auditLogsApi, type AuditLog } from "../services/audit-logs.service";
import { formatDateTime } from "../utils/format";

const exportColumns: ExportColumn<AuditLog>[] = [
  { label: "User", getValue: (row) => row.user },
  { label: "Action", getValue: (row) => row.action },
  { label: "Module", getValue: (row) => row.module },
  { label: "Description", getValue: (row) => row.description },
  { label: "Date & Time", getValue: (row) => formatDateTime(row.dateTime) },
  { label: "IP/Device", getValue: (row) => row.device },
];

const columns: ListColumn<AuditLog>[] = [
  { id: "user", header: "User", value: (row) => row.user, isTitle: true, hideable: false, width: 180 },
  {
    id: "action",
    header: "Action",
    value: (row) => row.action,
    cell: (row) => (
      <span className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-medium whitespace-nowrap text-foreground">
        {row.action}
      </span>
    ),
  },
  { id: "module", header: "Module", value: (row) => row.module, width: 150 },
  { id: "description", header: "Description", value: (row) => row.description, width: 360, grow: true },
  {
    id: "dateTime",
    header: "Date & time",
    width: 170,
    value: (row) => row.dateTime,
    cell: (row) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(row.dateTime)}</span>,
  },
  {
    id: "device",
    header: "IP / device",
    value: (row) => row.device,
    defaultHidden: true,
    width: 260,
    cell: (row) => <span className="text-muted-foreground">{row.device}</span>,
  },
];

export function AuditLogsPage() {
  const list = useListState({ pageSize: 50, storageKey: "audit-logs" });
  const [isExporting, setIsExporting] = useState(false);

  const listParams = {
    search: list.debouncedSearch || undefined,
    module: list.filters.module || undefined,
  };

  const { data: result, isLoading, isError, refetch } = useAuditLogsPageQuery({ ...listParams, page: list.page, limit: list.pageSize });
  const rows = useMemo(() => result?.data ?? [], [result]);
  const total = result?.pagination?.total ?? rows.length;

  const { data: modules = [] } = useAuditLogModulesQuery();
  const filters: ListFilter[] = [
    { id: "module", label: "Module", quick: true, options: modules.map((module) => ({ value: module, label: module })) },
  ];

  async function handleExport() {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const { data: allRows } = await auditLogsApi.listPage({ ...listParams, page: 1, limit: Math.max(total, 1) });
      await exportRowsToExcel("audit-logs.xlsx", exportColumns, allRows);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <PageShell title="Audit Logs" description="Who changed what in the admin panel, and when.">
      <ListTable
        itemLabel="audit log"
        rows={rows}
        total={total}
        columns={columns}
        state={list}
        filters={filters}
        searchPlaceholder="Search user or description..."
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        empty={{ illustration: "checklist", title: "No audit log entries yet", description: "Actions taken in the admin panel will appear here." }}
        actions={
          <Button variant="outline" size="compact" disabled={isExporting || total === 0} onClick={handleExport}>
            <DownloadSimpleIcon size={14} />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        }
      />
    </PageShell>
  );
}
