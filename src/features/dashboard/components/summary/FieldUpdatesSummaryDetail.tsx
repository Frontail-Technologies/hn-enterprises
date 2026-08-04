"use client";

import { useMemo } from "react";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/features/commercial/utils/format";
import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";
import { getPeriodRange, withinRange } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { useWorkProgressListQuery } from "@/features/work-progress/hooks/useWorkProgress";
import type { WorkProgressUpdate } from "@/features/work-progress/types/work-progress.types";
import { SummaryStatShell } from "../SummaryStatShell";

type FieldUpdateRow = WorkProgressUpdate & {
  customerName: string;
  projectName: string;
  siteName: string;
  supervisorName: string;
};

const columns: ExcelColumn<FieldUpdateRow>[] = [
  { key: "customerName", label: "Customer", width: 190, sticky: true, getValue: (row) => row.customerName },
  { key: "projectName", label: "Project", width: 190, getValue: (row) => row.projectName },
  { key: "siteName", label: "Site", width: 170, getValue: (row) => row.siteName },
  { key: "stage", label: "Stage", width: 140, getValue: (row) => row.stage },
  {
    key: "status",
    label: "Status",
    width: 130,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
  { key: "supervisorName", label: "Supervisor", width: 160, getValue: (row) => row.supervisorName },
  { key: "createdAt", label: "Date", width: 130, getValue: (row) => formatDate(row.createdAt) },
  { key: "remarks", label: "Remarks", width: 240, getValue: (row) => row.remarks },
];

export function FieldUpdatesSummaryDetail({ period }: { period: DashboardMetricPeriod }) {
  const { data: workProgress = [], isLoading } = useWorkProgressListQuery({ limit: 200 });

  const rows = useMemo(() => {
    const range = getPeriodRange(period);

    return workProgress
      .filter((update) => withinRange(update.createdAt, range))
      .map((update) => ({
        ...update,
        customerName: update.customer?.name ?? "-",
        projectName: update.project?.name ?? "-",
        siteName: update.site?.name ?? "-",
        supervisorName: update.supervisor?.name ?? "-",
      }));
  }, [workProgress, period]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("field-updates").title}
      searchPlaceholder="Search field updates..."
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyTitle="No field updates found for the selected period"
    />
  );
}
