"use client";

import { useState } from "react";
import { type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { auditLogs } from "../data/audit-logs.data";
import { formatDateTime, uniqOptions } from "../utils/format";
import { PageShell } from "./shared/PageShell";
import { PaginatedDataTable } from "./shared/PaginatedDataTable";

export function AuditLogsPage() {
  const [filters, setFilters] = useState({ search: "", module: "all" });
  const data = auditLogs.filter(
    (row) =>
      (!filters.search ||
        row.user.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.module === "all" || row.module === filters.module),
  );
  const columns: ColumnDef<(typeof auditLogs)[number]>[] = [
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
      <PaginatedDataTable data={data} columns={columns} />
    </PageShell>
  );
}
