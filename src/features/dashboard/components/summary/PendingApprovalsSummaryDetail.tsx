"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ListColumn } from "@/components/shared/list";
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
  /** Raw amount for sorting; null for surveys (shown as "-"). */
  amountValue: number | null;
  status: string;
  date: string;
  actionHref: string;
};

const columns: ListColumn<PendingApprovalRow>[] = [
  { id: "type", header: "Type", width: 110, pin: true, sortable: true, columnFilter: true, value: (row) => row.type },
  {
    id: "reference",
    header: "Reference",
    width: 220,
    pin: true,
    hideable: false,
    sortable: true,
    columnFilter: true,
    value: (row) => row.reference,
    cell: (row) => (
      <Link href={row.actionHref} className="font-semibold text-foreground hover:text-primary">
        {row.reference}
      </Link>
    ),
  },
  { id: "detail", header: "Detail", width: 220, grow: true, columnFilter: true, value: (row) => row.detail },
  { id: "amount", header: "Amount", width: 130, align: "end", sortable: true, columnFilter: true, value: (row) => row.amountValue, cell: (row) => row.amount },
  { id: "date", header: "Date", width: 130, sortable: true, columnFilter: true, value: (row) => row.date, cell: (row) => formatDate(row.date) },
  { id: "status", header: "Status", width: 140, sortable: true, columnFilter: true, value: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
];

export function PendingApprovalsSummaryDetail({ projectId, city }: { projectId: string; city: string }) {
  const scopedProjectId = projectId === "all" ? undefined : projectId;
  const scopedCity = city === "all" ? undefined : city;

  // Server-scoped: only customers with a pending survey approval, in this
  // project/city - not the full customer table.
  const customersQuery = useCustomersQuery({
    projectId: scopedProjectId,
    city: scopedCity,
    statKey: "pending-survey-approval",
  });
  const paymentsQuery = usePaymentsQuery({
    projectId: scopedProjectId,
    city: scopedCity,
    status: "Submitted",
  });
  const billsQuery = useBillsQuery({
    projectId: scopedProjectId,
    status: "Submitted",
  });
  const pendingSurveyCustomers = useMemo(() => customersQuery.data ?? [], [customersQuery.data]);
  const payments = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data]);
  const bills = useMemo(() => billsQuery.data ?? [], [billsQuery.data]);

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
        amountValue: null,
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
        amountValue: payment.amount,
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
      amountValue: bill.totalAmount,
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
      getRowHref={(row) => row.actionHref}
      isLoading={customersQuery.isLoading || paymentsQuery.isLoading || billsQuery.isLoading}
      isError={customersQuery.isError || paymentsQuery.isError || billsQuery.isError}
      onRetry={() => {
        void customersQuery.refetch();
        void paymentsQuery.refetch();
        void billsQuery.refetch();
      }}
      emptyIllustration="allClear"
      emptyTitle="No approvals pending"
    />
  );
}
