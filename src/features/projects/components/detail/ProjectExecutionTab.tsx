"use client";

import { ChartBarIcon, ClipboardTextIcon, UsersThreeIcon } from "@phosphor-icons/react";
import type { ColumnDef } from "@/components/shared/DataTable";
import { DataTable } from "@/components/shared/DataTable";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { ExcelDataGrid } from "@/components/shared/ExcelDataGrid";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { MetricCard } from "@/components/shared/MetricCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge, type StatusValue } from "@/components/shared/StatusBadge";
import { useDprRecordsQuery } from "@/features/planning/hooks/usePlanning";
import { useWorkProgressQueueQuery } from "@/features/work-progress/hooks/useWorkProgress";
import type { WorkQueueRow } from "@/features/work-progress/types/work-progress.types";
import { computeExecutionSummary } from "../../model/execution-summary.model";
import { formatCompactCount } from "@/lib/format";
import { formatDate } from "./project-detail.utils";
import { ProjectTabHeader } from "./ProjectTabHeader";

export function ProjectExecutionTab({ projectId }: { projectId: string }) {
  const { data: dprRecords = [], isLoading: dprLoading } = useDprRecordsQuery({ projectId });
  const { data: queueRows = [], isLoading: queueLoading } = useWorkProgressQueueQuery({ projectId });

  const { dprSubmitted, dprPending, giCompleted, gcCompleted, conversions } = computeExecutionSummary(
    dprRecords,
    queueRows,
  );

  const queueColumns: ExcelColumn<WorkQueueRow>[] = [
    { key: "customerName", label: "Customer", width: 190, sticky: true, getValue: (row) => row.customerName },
    { key: "trBpNumber", label: "TR/BP No.", width: 140, getValue: (row) => row.trBpNumber },
    { key: "site", label: "Site", width: 150, getValue: (row) => row.site?.name ?? "" },
    { key: "stage", label: "Stage", width: 150, getValue: (row) => row.stage },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status as StatusValue} />,
    },
    { key: "nextRequiredAction", label: "Next Action", width: 220, getValue: (row) => row.nextRequiredAction },
    { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisor?.name ?? "" },
    { key: "lastUpdated", label: "Last Updated", width: 140, getValue: (row) => formatDate(row.lastUpdated) },
  ];

  const dprColumns: ColumnDef<(typeof dprRecords)[number]>[] = [
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "site", header: "Site", render: (row) => row.siteLabel },
    { key: "supervisor", header: "Supervisor", render: (row) => row.supervisorName },
    { key: "tasks", header: "Tasks Logged", render: (row) => row.tasks.length },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as StatusValue} /> },
    { key: "remarks", header: "Remarks", render: (row) => row.remarks || "-" },
  ];

  return (
    <div className="space-y-5">
      <ProjectTabHeader title="Execution" subtitle="Field progress and daily reports for this project" />

      <SectionCard title="Execution Summary">
        <CompactStatGrid columns={3}>
          <MetricCard label="Customers Worked On" value={formatCompactCount(queueRows.length)} icon={UsersThreeIcon} />
          <MetricCard label="GI Completed" value={formatCompactCount(giCompleted)} icon={ChartBarIcon} />
          <MetricCard label="GC Completed" value={formatCompactCount(gcCompleted)} icon={ChartBarIcon} />
          <MetricCard label="Conversions" value={formatCompactCount(conversions)} icon={ChartBarIcon} />
          <MetricCard label="DPR Submitted" value={formatCompactCount(dprSubmitted)} icon={ClipboardTextIcon} />
          <MetricCard label="DPR Pending" value={formatCompactCount(dprPending)} icon={ClipboardTextIcon} />
        </CompactStatGrid>
      </SectionCard>

      <SectionCard title="Work Progress (Work Queue)">
        <ExcelDataGrid
          columns={queueColumns}
          rows={queueRows}
          isLoading={queueLoading}
          emptyTitle="No work progress recorded for this project yet."
          maxHeightClassName="max-h-[420px]"
        />
      </SectionCard>

      <SectionCard title="DPR Reports">
        <DataTable
          columns={dprColumns}
          data={dprRecords}
          variant="striped"
          isLoading={dprLoading}
          emptyTitle="No DPR reports found for this project."
        />
      </SectionCard>
    </div>
  );
}
