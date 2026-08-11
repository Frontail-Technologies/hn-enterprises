"use client";

import { useMemo } from "react";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import type { Bill } from "@/features/commercial/types/bill.types";
import { formatDate, money } from "@/features/commercial/utils/format";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";
import { getPeriodRange, withinRange } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

type BillRow = Bill & { customerName: string; siteArea: string; supervisorName: string };

const columns: ExcelColumn<BillRow>[] = [
  { key: "billNumber", label: "Bill Number", width: 160, sticky: true, getValue: (row) => row.billNumber },
  { key: "customerName", label: "Customer", width: 190, getValue: (row) => row.customerName },
  { key: "siteArea", label: "Site", width: 170, getValue: (row) => row.siteArea },
  { key: "supervisorName", label: "Supervisor", width: 160, getValue: (row) => row.supervisorName },
  { key: "stage", label: "Billing Stage", width: 140, getValue: (row) => row.stage },
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
  city,
  period,
}: {
  projectId: string;
  city: string;
  period: DashboardMetricPeriod;
}) {
  const { data: customers = [], isLoading: customersLoading } = useCustomersQuery({
    projectId: projectId === "all" ? undefined : projectId,
  });
  // Bills are project-linked now - filtered server-side by project; customers
  // are kept only to enrich rows and to support the city filter.
  const { data: bills = [], isLoading: billsLoading } = useBillsQuery({
    projectId: projectId === "all" ? undefined : projectId,
  });

  const rows = useMemo(() => {
    const customerById = new Map(customers.map((customer) => [customer.id, customer]));
    const range = getPeriodRange(period);

    return bills
      .filter((bill) => {
        if (!withinRange(bill.billDate, range)) return false;
        if (city === "all") return true;
        const customer = bill.customerId ? customerById.get(bill.customerId) : undefined;
        return customer?.city === city;
      })
      .map((bill) => {
        const customer = bill.customerId ? customerById.get(bill.customerId) : undefined;
        return {
          ...bill,
          customerName: customer?.customerConnection.customerName ?? "—",
          siteArea: customer?.siteArea ?? "—",
          supervisorName: customer?.customerConnection.supervisorName ?? "—",
        };
      });
  }, [bills, customers, city, period]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("billing-pending").title}
      searchPlaceholder="Search bill or customer..."
      columns={columns}
      rows={rows}
      isLoading={customersLoading || billsLoading}
      emptyTitle="No bills found for the selected period"
    />
  );
}
