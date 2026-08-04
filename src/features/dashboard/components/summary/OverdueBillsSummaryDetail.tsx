"use client";

import { useMemo } from "react";
import { differenceInCalendarDays } from "date-fns";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import type { Bill } from "@/features/commercial/types/bill.types";
import { formatDate, money } from "@/features/commercial/utils/format";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

type OverdueBillRow = Bill & { customerName: string; siteArea: string; supervisorName: string; daysOverdue: number };

const columns: ExcelColumn<OverdueBillRow>[] = [
  { key: "billNumber", label: "Bill Number", width: 160, sticky: true, getValue: (row) => row.billNumber },
  { key: "customerName", label: "Customer", width: 190, getValue: (row) => row.customerName },
  { key: "siteArea", label: "Site", width: 170, getValue: (row) => row.siteArea },
  { key: "supervisorName", label: "Supervisor", width: 160, getValue: (row) => row.supervisorName },
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

export function OverdueBillsSummaryDetail({ projectId, city }: { projectId: string; city: string }) {
  const { data: customers = [], isLoading: customersLoading } = useCustomersQuery({
    projectId: projectId === "all" ? undefined : projectId,
  });
  const { data: bills = [], isLoading: billsLoading } = useBillsQuery();

  const scopedCustomers = useMemo(
    () => customers.filter((customer) => city === "all" || customer.city === city),
    [customers, city],
  );

  const rows = useMemo(() => {
    const customerById = new Map(scopedCustomers.map((customer) => [customer.id, customer]));
    const now = new Date();

    return bills
      .filter((bill) => customerById.has(bill.customerId) && bill.status === "Overdue")
      .map((bill) => {
        const customer = customerById.get(bill.customerId);
        return {
          ...bill,
          customerName: customer?.customerConnection.customerName ?? "-",
          siteArea: customer?.siteArea ?? "-",
          supervisorName: customer?.customerConnection.supervisorName ?? "-",
          daysOverdue: Math.max(0, differenceInCalendarDays(now, new Date(bill.dueDate))),
        };
      });
  }, [bills, scopedCustomers]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("overdue-bills").title}
      searchPlaceholder="Search bill or customer..."
      columns={columns}
      rows={rows}
      isLoading={customersLoading || billsLoading}
      emptyTitle="No overdue bills found"
    />
  );
}
