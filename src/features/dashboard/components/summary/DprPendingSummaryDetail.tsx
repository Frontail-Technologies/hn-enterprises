"use client";

import { useMemo } from "react";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/features/commercial/utils/format";
import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";
import { getPeriodRange, withinRange } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { useDprRecordsQuery } from "@/features/planning/hooks/usePlanning";
import type { DprRecord } from "@/features/planning/types/planning.types";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { SummaryStatShell } from "../SummaryStatShell";

type DprRow = DprRecord & { projectName: string };

const columns: ExcelColumn<DprRow>[] = [
  { key: "siteLabel", label: "Site", width: 190, sticky: true, getValue: (row) => row.siteLabel },
  { key: "projectName", label: "Project", width: 220, getValue: (row) => row.projectName },
  { key: "supervisorName", label: "Supervisor", width: 170, getValue: (row) => row.supervisorName },
  { key: "date", label: "Date", width: 130, getValue: (row) => formatDate(row.date) },
  {
    key: "status",
    label: "Status",
    width: 130,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
  { key: "remarks", label: "Remarks", width: 260, getValue: (row) => row.remarks },
];

export function DprPendingSummaryDetail({ period }: { period: DashboardMetricPeriod }) {
  const { data: projects = [], isLoading: projectsLoading } = useProjectsQuery();
  const { data: dprRecords = [], isLoading: dprLoading } = useDprRecordsQuery({});

  const rows = useMemo(() => {
    const projectById = new Map(projects.map((project) => [project.id, project]));
    const range = getPeriodRange(period);

    return dprRecords
      .filter((record) => record.status !== "Approved" && withinRange(record.date, range))
      .map((record) => ({
        ...record,
        projectName: projectById.get(record.projectId)?.name ?? "-",
      }));
  }, [dprRecords, projects, period]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("dpr-pending").title}
      searchPlaceholder="Search DPR records..."
      columns={columns}
      rows={rows}
      isLoading={projectsLoading || dprLoading}
      emptyTitle="No pending DPR records found for the selected period"
    />
  );
}
