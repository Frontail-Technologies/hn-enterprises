"use client";

import type { ColumnDef } from "@/components/shared/DataTable";
import { DataTable } from "@/components/shared/DataTable";
import { SectionCard } from "@/components/shared/SectionCard";
import { useAuditLogsQuery } from "@/features/management/hooks/useAuditLogs";
import { formatDateTime } from "./project-detail.utils";
import { ProjectTabHeader } from "./ProjectTabHeader";

export function ProjectActivityTab({ projectId }: { projectId: string }) {
  const { data: logs = [], isLoading } = useAuditLogsQuery({ projectId });

  const columns: ColumnDef<(typeof logs)[number]>[] = [
    { key: "user", header: "User", render: (row) => <b>{row.user}</b> },
    { key: "action", header: "Action" },
    { key: "module", header: "Module" },
    { key: "description", header: "Description" },
    { key: "dateTime", header: "Date & Time", render: (row) => formatDateTime(row.dateTime) },
  ];

  return (
    <div className="space-y-5">
      <ProjectTabHeader title="Activity" subtitle="Recent changes recorded for this project" />

      <SectionCard title="Recent Activity">
        <DataTable
          columns={columns}
          data={logs}
          variant="striped"
          isLoading={isLoading}
          emptyTitle="No activity recorded for this project yet."
        />
      </SectionCard>
    </div>
  );
}
