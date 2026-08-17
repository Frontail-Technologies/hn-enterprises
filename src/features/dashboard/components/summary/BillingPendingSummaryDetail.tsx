"use client";

import { useMemo } from "react";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import type { Bill } from "@/features/commercial/types/bill.types";
import { formatDate, money } from "@/features/commercial/utils/format";
import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";
import { getPeriodRange, withinRange } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

type BillRow = Bill;

const columns: ExcelColumn<BillRow>[] = [
  { key: "billNumber", label: "Bill Number", width: 160, sticky: true, getValue: (row) => row.billNumber },
  { key: "billDate", label: "Bill Date", width: 130, getValue: (row) => formatDate(row.billDate) },
  { key: "totalAmount", label: "Total Amount", width: 150, getValue: (row) => money(row.totalAmount) },
  { key: "paidAmount", label: "Paid Amount", width: 150, getValue: (row) => money(row.paidAmount) },
  { key: "pendingAmount", label: "Pending Amount", width: 150, getValue: (row) => money(row.pendingAmount) },
  {
    key: "status",
    label: "Status",
    width: 130,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function BillingPendingSummaryDetail({
  projectId,
  period,
}: {
  projectId: string;
  period: DashboardMetricPeriod;
}) {
  // Bills are project-linked - filtered server-side by project. Bills have no
  // customer link, so there's no city to filter/enrich them by.
  const { data: bills = [], isLoading: billsLoading } = useBillsQuery({
    projectId: projectId === "all" ? undefined : projectId,
  });

  const rows = useMemo(() => {
    const range = getPeriodRange(period);
    return bills.filter((bill) => withinRange(bill.billDate, range));
  }, [bills, period]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("billing-pending").title}
      searchPlaceholder="Search bill..."
      columns={columns}
      rows={rows}
      isLoading={billsLoading}
      emptyTitle="No bills found for the selected period"
    />
  );
}
