"use client";

import { useMemo } from "react";
import type { ListColumn } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/features/commercial/utils/format";
import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";
import { getPeriodRange, withinRange } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { useDprRecordsQuery } from "@/features/planning/hooks/usePlanning";
import type { DprRecord } from "@/features/planning/types/planning.types";
import { SummaryStatShell } from "../SummaryStatShell";

const columns: ListColumn<DprRecord>[] = [
  { id: "siteLabel", header: "Site", width: 190, isTitle: true, hideable: false, sortable: true, columnFilter: true, value: (row) => row.siteLabel },
  { id: "projectName", header: "Project", width: 220, sortable: true, columnFilter: true, value: (row) => row.projectName },
  { id: "supervisorName", header: "Supervisor", width: 170, sortable: true, columnFilter: true, value: (row) => row.supervisorName },
  { id: "date", header: "Date", width: 130, sortable: true, columnFilter: true, value: (row) => row.date, cell: (row) => formatDate(row.date) },
  { id: "status", header: "Status", width: 130, sortable: true, columnFilter: true, value: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
  { id: "remarks", header: "Remarks", width: 260, grow: true, columnFilter: true, value: (row) => row.remarks },
];

export function DprPendingSummaryDetail({ period }: { period: DashboardMetricPeriod }) {
  const { data: dprRecords = [], isLoading: dprLoading, isError, refetch } = useDprRecordsQuery({});

  const rows = useMemo(() => {
    const range = getPeriodRange(period);
    return dprRecords.filter(
      (record) => record.status !== "Approved" && withinRange(record.date, range),
    );
  }, [dprRecords, period]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("dpr-pending").title}
      searchPlaceholder="Search DPR records..."
      columns={columns}
      rows={rows}
      isLoading={dprLoading}
      isError={isError}
      onRetry={() => void refetch()}
      emptyIllustration="allClear"
      emptyTitle="No pending DPR records found for the selected period"
    />
  );
}
