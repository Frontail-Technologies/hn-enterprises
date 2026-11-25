"use client";

import { useMemo } from "react";
import type { ListColumn } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import type { Bill } from "@/features/commercial/types/bill.types";
import { formatDate, money } from "@/features/commercial/utils/format";
import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";
import { getPeriodRange, withinRange } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

type BillRow = Bill;

const columns: ListColumn<BillRow>[] = [
  { id: "billNumber", header: "Bill Number", width: 160, isTitle: true, hideable: false, sortable: true, columnFilter: true, value: (row) => row.billNumber },
  { id: "projectName", header: "Project", width: 220, sortable: true, columnFilter: true, value: (row) => row.projectName || "-" },
  { id: "billDate", header: "Bill Date", width: 130, sortable: true, columnFilter: true, value: (row) => row.billDate, cell: (row) => formatDate(row.billDate) },
  { id: "totalAmount", header: "Bill Amount", width: 140, align: "end", sortable: true, columnFilter: true, value: (row) => row.totalAmount, cell: (row) => money(row.totalAmount) },
  { id: "tax", header: "Tax", width: 120, align: "end", sortable: true, columnFilter: true, value: (row) => row.tax, cell: (row) => money(row.tax) },
  { id: "paidAmount", header: "Paid Amount", width: 150, align: "end", sortable: true, columnFilter: true, value: (row) => row.paidAmount, cell: (row) => money(row.paidAmount) },
  { id: "pendingAmount", header: "Pending Amount", width: 150, align: "end", sortable: true, columnFilter: true, value: (row) => row.pendingAmount, cell: (row) => money(row.pendingAmount) },
  { id: "status", header: "Status", width: 130, sortable: true, columnFilter: true, value: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
];

export function BillingPendingSummaryDetail({
  projectId,
  period,
}: {
  projectId: string;
  period: DashboardMetricPeriod;
}) {
  const { data: bills = [], isLoading: billsLoading, isError, refetch } = useBillsQuery({
    projectId: projectId === "all" ? undefined : projectId,
  });

  const rows = useMemo(() => {
    const range = getPeriodRange(period);
    return bills.filter((bill) => withinRange(bill.billDate, range));
  }, [bills, period]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("billing-pending").title}
      searchPlaceholder="Search bill or project..."
      columns={columns}
      rows={rows}
      getRowHref={(row) => `/billing/${row.id}`}
      isLoading={billsLoading}
      isError={isError}
      onRetry={() => void refetch()}
      emptyIllustration="allClear"
      emptyTitle="No bills found for the selected period"
    />
  );
}
