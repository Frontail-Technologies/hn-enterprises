"use client";

import { useMemo } from "react";
import { differenceInCalendarDays } from "date-fns";
import type { ListColumn } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import type { Bill } from "@/features/commercial/types/bill.types";
import { formatDate, money } from "@/features/commercial/utils/format";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

type OverdueBillRow = Bill & { daysOverdue: number };

const columns: ListColumn<OverdueBillRow>[] = [
  { id: "billNumber", header: "Bill Number", width: 160, isTitle: true, hideable: false, sortable: true, columnFilter: true, value: (row) => row.billNumber },
  { id: "projectName", header: "Project", width: 220, sortable: true, columnFilter: true, value: (row) => row.projectName || "-" },
  { id: "dueDate", header: "Due Date", width: 130, sortable: true, columnFilter: true, value: (row) => row.dueDate, cell: (row) => formatDate(row.dueDate) },
  { id: "daysOverdue", header: "Days Overdue", width: 120, align: "end", sortable: true, columnFilter: true, value: (row) => row.daysOverdue },
  { id: "pendingAmount", header: "Pending Amount", width: 150, align: "end", sortable: true, columnFilter: true, value: (row) => row.pendingAmount, cell: (row) => money(row.pendingAmount) },
  { id: "status", header: "Status", width: 130, sortable: true, columnFilter: true, value: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
];

export function OverdueBillsSummaryDetail({ projectId }: { projectId: string }) {
  const { data: bills = [], isLoading: billsLoading, isError, refetch } = useBillsQuery({
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
      searchPlaceholder="Search bill or project..."
      columns={columns}
      rows={rows}
      isLoading={billsLoading}
      isError={isError}
      onRetry={() => void refetch()}
      emptyIllustration="allClear"
      emptyTitle="No overdue bills found"
    />
  );
}
