"use client";

import { useMemo, useState } from "react";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { buttonVariants } from "@/components/ui/button";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";
import { useAuditLogsQuery } from "../hooks/useAuditLogs";
import type { AuditLog } from "../services/audit-logs.service";
import { formatDateTime, uniqOptions } from "../utils/format";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";

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
  const { data: auditLogs = [], isLoading } = useAuditLogsQuery();
  const data = useMemo(
    () =>
      auditLogs.filter(
        (row) =>
          (!filters.search ||
            row.user.toLowerCase().includes(filters.search.toLowerCase()) ||
            row.description.toLowerCase().includes(filters.search.toLowerCase())) &&
          (filters.module === "all" || row.module === filters.module),
      ),
    [auditLogs, filters],
  );
  const columns: ColumnDef<AuditLog>[] = [
    { key: "user", header: "User", render: (row) => <b>{row.user}</b> },
    { key: "action", header: "Action" },
    { key: "module", header: "Module" },
    { key: "description", header: "Description" },
    {
      key: "dateTime",
      header: "Date & Time",
      render: (row) => formatDateTime(row.dateTime),
    },
    { key: "device", header: "IP/Device" },
  ];
  return (
    <PageShell
      title="Audit Logs"
      subtitle="Track important system activity and admin changes."
      actions={
        <button
          type="button"
          className={buttonVariants({ variant: "outline", size: "default" })}
          onClick={() => void exportRowsToExcel("audit-logs.xlsx", exportColumns, data)}
        >
          <DownloadSimpleIcon size={15} />
          Export Excel
        </button>
      }
    >
      <FilterSheetButton
        searchKey="search"
        searchPlaceholder="Search user..."
        title="Audit Filters"
        values={filters}
        filters={[
          {
            key: "module",
            placeholder: "All Modules",
            options: uniqOptions(auditLogs.map((row) => row.module)),
          },
        ]}
        onChange={(key, value) =>
          setFilters((current) => ({ ...current, [key]: value }))
        }
        onReset={() => setFilters({ search: "", module: "all" })}
      />
      <PaginatedDataTable data={data} columns={columns} isLoading={isLoading} stickyLastColumn={false} />
    </PageShell>
  );
}
