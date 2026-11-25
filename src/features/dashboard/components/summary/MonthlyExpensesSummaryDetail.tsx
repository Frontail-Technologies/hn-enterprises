"use client";

import { useMemo } from "react";
import type { ListColumn } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePaymentsQuery } from "@/features/commercial/hooks/usePayments";
import type { Payment } from "@/features/commercial/types/payment.types";
import { formatDate, money } from "@/features/commercial/utils/format";
import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";
import { getPeriodRange, withinRange } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

const customerLabel = (row: Payment) =>
  row.customerName
    ? row.customerTrBpNumber
      ? `${row.customerName} (${row.customerTrBpNumber})`
      : row.customerName
    : "-";

const columns: ListColumn<Payment>[] = [
  { id: "paidTo", header: "Paid To", width: 190, isTitle: true, hideable: false, sortable: true, columnFilter: true, value: (row) => row.paidTo },
  { id: "customerName", header: "Customer", width: 200, sortable: true, columnFilter: true, value: customerLabel },
  { id: "category", header: "Category", width: 180, sortable: true, columnFilter: true, value: (row) => row.category },
  { id: "purpose", header: "Purpose", width: 220, grow: true, columnFilter: true, value: (row) => row.purpose },
  { id: "amount", header: "Amount", width: 140, align: "end", sortable: true, columnFilter: true, value: (row) => row.amount, cell: (row) => money(row.amount) },
  { id: "paymentDate", header: "Payment Date", width: 140, sortable: true, columnFilter: true, value: (row) => row.paymentDate, cell: (row) => formatDate(row.paymentDate) },
  { id: "mode", header: "Mode", width: 120, sortable: true, columnFilter: true, value: (row) => row.mode },
  { id: "status", header: "Status", width: 130, sortable: true, columnFilter: true, value: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
];

export function MonthlyExpensesSummaryDetail({
  projectId,
  city,
  period,
}: {
  projectId: string;
  city: string;
  period: DashboardMetricPeriod;
}) {
  // Payments are server-scoped by project + customer city and carry
  // customerName/customerTrBpNumber - no full customer list needed.
  const { data: payments = [], isLoading, isError, refetch } = usePaymentsQuery({
    projectId: projectId === "all" ? undefined : projectId,
    city: city === "all" ? undefined : city,
    status: "Approved",
  });

  const rows = useMemo(() => {
    const range = getPeriodRange(period);
    return payments.filter((payment) => payment.customerId && withinRange(payment.paymentDate, range));
  }, [payments, period]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("monthly-expenses").title}
      searchPlaceholder="Search expenses..."
      columns={columns}
      rows={rows}
      getRowHref={(row) => (row.customerId ? `/customers/${row.customerId}` : undefined)}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      emptyIllustration="billing"
      emptyTitle="No approved expenses found for the selected period"
    />
  );
}
