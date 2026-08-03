"use client";

import { CalendarBlankIcon, CurrencyInrIcon, DownloadSimpleIcon, FileTextIcon, UserIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportGridToExcel, type GridCell } from "@/lib/export-excel";
import { useCustomerQuery } from "@/features/customers/hooks/useCustomers";
import { useBillPaymentsQuery, useBillQuery } from "../hooks/useBills";
import type { BillPayment } from "../types/bill.types";
import { formatDate, money } from "../utils/format";
import { BillingActions } from "./billing/BillingActions";
import { PaymentDrawer } from "./billing/PaymentDrawer";
import { CommercialBreadcrumb } from "./shared/CommercialBreadcrumb";
import { DetailSummaryCard } from "./shared/DetailSummaryCard";
import { Panel } from "./shared/Panel";
import { PageLoading } from "@/components/shared/PageLoading";

export function BillingDetailPage({ id }: { id: string }) {
  const { data: bill, isLoading, isError } = useBillQuery(id);
  const { data: payments = [] } = useBillPaymentsQuery(id);
  const { data: customer } = useCustomerQuery(bill?.customerId ?? "");

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !bill) {
    return <p className="p-4 text-sm text-destructive">Unable to load this bill.</p>;
  }

  const columns: ColumnDef<BillPayment>[] = [
    { key: "paymentDate", header: "Date", render: (row) => formatDate(row.paymentDate) },
    {
      key: "amount",
      header: "Amount",
      render: (row) => <b>{money(row.amount)}</b>,
    },
    { key: "mode", header: "Mode" },
    { key: "remarks", header: "Remarks" },
  ];

  function handleDownloadInvoice() {
    if (!bill) return;
    const bold = (value: string | number): GridCell => ({ value, bold: true });
    const grid: GridCell[][] = [
      [bold("INVOICE")],
      [bold("Bill Number"), bill.billNumber, bold("Bill Date"), formatDate(bill.billDate)],
      [bold("Customer"), customer?.customerConnection.customerName ?? "-", bold("Billing Stage"), bill.stage],
      [bold("Due Date"), formatDate(bill.dueDate), bold("Status"), bill.status],
      [bold("Total Amount"), money(bill.totalAmount), bold("Tax"), money(bill.tax)],
      [bold("Paid Amount"), money(bill.paidAmount), bold("Pending Amount"), money(bill.pendingAmount)],
      [],
      [bold("Date"), bold("Amount"), bold("Mode"), bold("Remarks")],
      ...payments.map((payment) => [
        formatDate(payment.paymentDate),
        money(payment.amount),
        payment.mode,
        payment.remarks || "-",
      ]),
    ];
    void exportGridToExcel(`invoice-${bill.billNumber}.xlsx`, grid);
  }

  return (
    <div className="space-y-5">
      <CommercialBreadcrumb
        items={[
          { label: "Billing", href: "/billing" },
          { label: bill.billNumber },
        ]}
      />
      <PageHeader
        title={bill.billNumber}
        subtitle={`${bill.stage} billing for ${customer?.customerConnection.customerName ?? "customer"}`}
        actions={<BillingActions bill={bill} labels />}
      />
      <DetailSummaryCard
        title="Bill Overview"
        status={<StatusBadge status={bill.status} />}
        leftItems={[
          {
            icon: <FileTextIcon size={15} />,
            label: "Bill Number",
            value: bill.billNumber,
          },
          {
            icon: <CalendarBlankIcon size={15} />,
            label: "Bill Date",
            value: formatDate(bill.billDate),
          },
          {
            icon: <CalendarBlankIcon size={15} />,
            label: "Due Date",
            value: formatDate(bill.dueDate),
          },
          {
            icon: <CurrencyInrIcon size={15} />,
            label: "Amount",
            value: money(bill.totalAmount),
          },
          {
            icon: <CurrencyInrIcon size={15} />,
            label: "Tax",
            value: money(bill.tax),
          },
        ]}
        rightTitle="Collection"
        rightItems={[
          {
            icon: <UserIcon size={15} />,
            label: "Customer",
            value: customer?.customerConnection.customerName ?? "-",
          },
          {
            icon: <FileTextIcon size={15} />,
            label: "Billing Stage",
            value: bill.stage,
          },
          {
            icon: <CurrencyInrIcon size={15} />,
            label: "Paid Amount",
            value: money(bill.paidAmount),
          },
          {
            icon: <CurrencyInrIcon size={15} />,
            label: "Pending Amount",
            value: money(bill.pendingAmount),
          },
        ]}
      />
      <Panel
        title="Payment History"
        actions={
          <div className="flex items-center gap-2">
            <PaymentDrawer billId={bill.id} />
            <Button type="button" variant="outline" size="sm" onClick={handleDownloadInvoice}>
              <DownloadSimpleIcon size={14} />
              Download Invoice
            </Button>
          </div>
        }
      >
        <DataTable data={payments} columns={columns} />
      </Panel>
    </div>
  );
}
