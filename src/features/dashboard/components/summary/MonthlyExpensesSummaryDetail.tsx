"use client";

import { useMemo } from "react";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePaymentsQuery } from "@/features/commercial/hooks/usePayments";
import type { Payment } from "@/features/commercial/types/payment.types";
import { formatDate, money } from "@/features/commercial/utils/format";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import type { DashboardMetricPeriod } from "@/features/dashboard/data/dashboard.data";
import { getPeriodRange, withinRange } from "@/features/dashboard/services/dashboard.selectors";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

type PaymentRow = Payment & { customerName: string };

const columns: ExcelColumn<PaymentRow>[] = [
  { key: "paidTo", label: "Paid To", width: 190, sticky: true, getValue: (row) => row.paidTo },
  { key: "customerName", label: "Customer", width: 190, getValue: (row) => row.customerName },
  { key: "category", label: "Category", width: 180, getValue: (row) => row.category },
  { key: "purpose", label: "Purpose", width: 220, getValue: (row) => row.purpose },
  { key: "amount", label: "Amount", width: 140, getValue: (row) => money(row.amount) },
  { key: "paymentDate", label: "Payment Date", width: 140, getValue: (row) => formatDate(row.paymentDate) },
  { key: "mode", label: "Mode", width: 120, getValue: (row) => row.mode },
  {
    key: "status",
    label: "Status",
    width: 130,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
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
  const { data: customers = [], isLoading: customersLoading } = useCustomersQuery({
    projectId: projectId === "all" ? undefined : projectId,
  });
  const { data: payments = [], isLoading: paymentsLoading } = usePaymentsQuery();

  const scopedCustomers = useMemo(
    () => customers.filter((customer) => city === "all" || customer.city === city),
    [customers, city],
  );

  const rows = useMemo(() => {
    const customerById = new Map(scopedCustomers.map((customer) => [customer.id, customer]));
    const range = getPeriodRange(period);

    return payments
      .filter(
        (payment) =>
          customerById.has(payment.customerId) &&
          payment.status === "Approved" &&
          withinRange(payment.paymentDate, range),
      )
      .map((payment) => ({
        ...payment,
        customerName: customerById.get(payment.customerId)?.customerConnection.customerName ?? "-",
      }));
  }, [payments, scopedCustomers, period]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("monthly-expenses").title}
      searchPlaceholder="Search expenses..."
      columns={columns}
      rows={rows}
      isLoading={customersLoading || paymentsLoading}
      emptyTitle="No approved expenses found for the selected period"
    />
  );
}
