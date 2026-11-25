"use client";

import { useMemo } from "react";
import type { ListColumn } from "@/components/shared/list";
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

const columns: ListColumn<FieldUpdateRow>[] = [
  { id: "customerName", header: "Customer", width: 190, isTitle: true, hideable: false, sortable: true, columnFilter: true, value: (row) => row.customerName },
  { id: "projectName", header: "Project", width: 190, sortable: true, columnFilter: true, value: (row) => row.projectName },
  { id: "siteName", header: "Site", width: 170, sortable: true, columnFilter: true, value: (row) => row.siteName },
  { id: "stage", header: "Stage", width: 140, sortable: true, columnFilter: true, value: (row) => row.stage },
  { id: "status", header: "Status", width: 130, sortable: true, columnFilter: true, value: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
  { id: "supervisorName", header: "Supervisor", width: 160, sortable: true, columnFilter: true, value: (row) => row.supervisorName },
  { id: "createdAt", header: "Date", width: 130, sortable: true, columnFilter: true, value: (row) => row.createdAt, cell: (row) => formatDate(row.createdAt) },
  { id: "remarks", header: "Remarks", width: 240, grow: true, columnFilter: true, value: (row) => row.remarks },
];

export function FieldUpdatesSummaryDetail({ period }: { period: DashboardMetricPeriod }) {
  const { data: workProgress = [], isLoading, isError, refetch } = useWorkProgressListQuery({ limit: 200 });

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
      getRowHref={(row) => (row.customerId ? `/customers/${row.customerId}` : undefined)}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      emptyIllustration="calendar"
      emptyTitle="No field updates found for the selected period"
    />
  );
}
