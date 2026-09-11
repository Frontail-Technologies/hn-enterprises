"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import { usePaymentsQuery } from "@/features/commercial/hooks/usePayments";
import { getBillHref } from "@/features/commercial/utils/billing.utils";
import { formatDate, money } from "@/features/commercial/utils/format";
import { useCustomersQuery } from "@/features/customers/queries/useCustomersQuery";
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
    width: 220,
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
  const scopedProjectId = projectId === "all" ? undefined : projectId;
  const scopedCity = city === "all" ? undefined : city;

  // Server-scoped: only customers with a pending survey approval, in this
  // project/city - not the full customer table.
  const { data: pendingSurveyCustomers = [], isLoading: customersLoading } = useCustomersQuery({
    projectId: scopedProjectId,
    city: scopedCity,
    statKey: "pending-survey-approval",
  });
  const { data: payments = [], isLoading: paymentsLoading } = usePaymentsQuery({
    projectId: scopedProjectId,
    city: scopedCity,
    status: "Submitted",
  });
  const { data: bills = [], isLoading: billsLoading } = useBillsQuery({
    projectId: scopedProjectId,
    status: "Submitted",
  });

  const rows = useMemo<PendingApprovalRow[]>(() => {
    const surveyRows: PendingApprovalRow[] = pendingSurveyCustomers.map((customer) => {
      const name = customer.customerConnection.customerName;
      const trBp = customer.customerConnection.trBpNo;
      return {
        id: `survey-${customer.id}`,
        type: "Survey",
        reference: trBp ? `${name} (${trBp})` : name,
        detail: customer.siteArea,
        amount: "-",
        status: customer.survey?.approvalStatus ?? "-",
        date: customer.survey?.surveyDate ?? "",
        actionHref: `/customers/${customer.id}/edit`,
      };
    });

    const paymentRows: PendingApprovalRow[] = payments
      .filter((payment) => payment.customerId)
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

    const billRows: PendingApprovalRow[] = bills.map((bill) => ({
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
  }, [pendingSurveyCustomers, payments, bills]);

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
