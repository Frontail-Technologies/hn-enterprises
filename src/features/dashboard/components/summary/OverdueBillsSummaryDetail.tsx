"use client";

import { useMemo } from "react";
import { differenceInCalendarDays } from "date-fns";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import type { Bill } from "@/features/commercial/types/bill.types";
import { formatDate, money } from "@/features/commercial/utils/format";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

type OverdueBillRow = Bill & { daysOverdue: number };

const columns: ExcelColumn<OverdueBillRow>[] = [
  { key: "billNumber", label: "Bill Number", width: 160, sticky: true, getValue: (row) => row.billNumber },
  { key: "dueDate", label: "Due Date", width: 130, getValue: (row) => formatDate(row.dueDate) },
  { key: "daysOverdue", label: "Days Overdue", width: 120, getValue: (row) => row.daysOverdue },
  { key: "pendingAmount", label: "Pending Amount", width: 150, getValue: (row) => money(row.pendingAmount) },
  {
    key: "status",
    label: "Status",
    width: 130,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function OverdueBillsSummaryDetail({ projectId }: { projectId: string }) {
  // Bills are project-linked - filtered server-side by project. Bills have no
  // customer link, so there's no city to filter them by.
  const { data: bills = [], isLoading: billsLoading } = useBillsQuery({
    projectId: projectId === "all" ? undefined : projectId,
  });

  const rows = useMemo(() => {
    const now = new Date();
    return bills
      .filter((bill) => bill.status === "Overdue")
      .map((bill) => ({
        ...bill,
        daysOverdue: Math.max(0, differenceInCalendarDays(now, new Date(bill.dueDate))),
      }));
  }, [bills]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("overdue-bills").title}
      searchPlaceholder="Search bill..."
      columns={columns}
      rows={rows}
      isLoading={billsLoading}
      emptyTitle="No overdue bills found"
    />
  );
}
