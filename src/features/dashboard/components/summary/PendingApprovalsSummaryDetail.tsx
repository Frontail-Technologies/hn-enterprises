"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import { usePaymentsQuery } from "@/features/commercial/hooks/usePayments";
import { getBillHref } from "@/features/commercial/utils/billing.utils";
import { formatDate, money } from "@/features/commercial/utils/format";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

type PendingApprovalRow = {
  id: string;
  type: "Survey" | "Payment" | "Bill";
  reference: string;
  detail: string;
  amount: string;
  status: string;
  date: string;
  actionHref: string;
};

const columns: ExcelColumn<PendingApprovalRow>[] = [
  { key: "type", label: "Type", width: 110, sticky: true, getValue: (row) => row.type },
  {
    key: "reference",
    label: "Reference",
    width: 200,
    sticky: true,
    getValue: (row) => row.reference,
    render: (row) => (
      <Link href={row.actionHref} className="font-semibold text-foreground hover:text-primary">
        {row.reference}
      </Link>
    ),
  },
  { key: "detail", label: "Detail", width: 220, getValue: (row) => row.detail },
  { key: "amount", label: "Amount", width: 130, getValue: (row) => row.amount },
  { key: "date", label: "Date", width: 130, getValue: (row) => formatDate(row.date) },
  {
    key: "status",
    label: "Status",
    width: 140,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function PendingApprovalsSummaryDetail({ projectId, city }: { projectId: string; city: string }) {
  const { data: customers = [], isLoading: customersLoading } = useCustomersQuery({
    projectId: projectId === "all" ? undefined : projectId,
  });
  const { data: payments = [], isLoading: paymentsLoading } = usePaymentsQuery();
  // Bills are project-linked now - scoped server-side by project.
  const { data: bills = [], isLoading: billsLoading } = useBillsQuery({
    projectId: projectId === "all" ? undefined : projectId,
  });

  const scopedCustomers = useMemo(
    () => customers.filter((customer) => city === "all" || customer.city === city),
    [customers, city],
  );

  const rows = useMemo<PendingApprovalRow[]>(() => {
    const scopedCustomerIds = new Set(scopedCustomers.map((customer) => customer.id));

    const surveyRows: PendingApprovalRow[] = scopedCustomers
      .filter((customer) =>
        ["Submitted", "In Review", "Sent Back"].includes(customer.survey?.approvalStatus ?? ""),
      )
      .map((customer) => ({
        id: `survey-${customer.id}`,
        type: "Survey",
        reference: customer.customerConnection.customerName,
        detail: customer.siteArea,
        amount: "-",
        status: customer.survey?.approvalStatus ?? "-",
        date: customer.survey?.surveyDate ?? "",
        actionHref: `/customers/${customer.id}/edit`,
      }));

    const paymentRows: PendingApprovalRow[] = payments
      .filter((payment) => scopedCustomerIds.has(payment.customerId) && payment.status === "Submitted")
      .map((payment) => ({
        id: `payment-${payment.id}`,
        type: "Payment",
        reference: payment.paidTo,
        detail: payment.purpose || payment.category,
        amount: money(payment.amount),
        status: payment.status,
        date: payment.paymentDate,
        actionHref: "/payments",
      }));

    const billRows: PendingApprovalRow[] = bills
      // Project scope already applied server-side. Bills have no customer
      // link, so they aren't further scoped by the city filter.
      .filter((bill) => bill.status === "Submitted")
      .map((bill) => ({
        id: `bill-${bill.id}`,
        type: "Bill",
        reference: bill.billNumber,
        detail: bill.dueDate ? `Due ${formatDate(bill.dueDate)}` : "-",
        amount: money(bill.totalAmount),
        status: bill.status,
        date: bill.billDate,
        actionHref: getBillHref(bill),
      }));

    return [...surveyRows, ...paymentRows, ...billRows].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [scopedCustomers, payments, bills, city]);

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("pending-approvals").title}
      searchPlaceholder="Search pending approvals..."
      columns={columns}
      rows={rows}
      isLoading={customersLoading || paymentsLoading || billsLoading}
      emptyTitle="No approvals pending"
    />
  );
}
