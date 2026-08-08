"use client";

import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, NotePencilIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportGridToExcel, type GridCell } from "@/lib/export-excel";
import { useCustomerQuery } from "@/features/customers/hooks/useCustomers";
import { useBillPaymentsQuery, useBillQuery, useDeleteBill, useUpdateBillPaymentStatus } from "../hooks/useBills";
import type { BillPayment, BillPaymentStatus } from "../types/bill.types";
import { formatDate, money } from "../utils/format";
import { BillDrawer } from "./billing/BillDrawer";
import { PaymentDrawer } from "./billing/PaymentDrawer";
import { Panel } from "./shared/Panel";
import { PageLoading } from "@/components/shared/PageLoading";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";

const paymentStatuses: BillPaymentStatus[] = ["Cleared", "Pending", "Bounced"];

export function BillingDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: bill, isLoading, isError } = useBillQuery(id);
  const { data: payments = [] } = useBillPaymentsQuery(id);
  const { data: customer } = useCustomerQuery(bill?.customerId ?? "");
  const deleteMutation = useDeleteBill();
  const updatePaymentStatus = useUpdateBillPaymentStatus(id);
  // Replaces the layout's generic (raw-UUID) breadcrumb segment with the
  // bill number instead of rendering a second breadcrumb on this page.
  useBreadcrumbLabel(bill?.billNumber);

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
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Select
          value={row.status}
          onValueChange={(status) => {
            if (status && status !== row.status) {
              updatePaymentStatus.mutate({ paymentId: row.id, status: status as BillPaymentStatus });
            }
          }}
        >
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {paymentStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
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
      [bold("Date"), bold("Amount"), bold("Mode"), bold("Status"), bold("Remarks")],
      ...payments.map((payment) => [
        formatDate(payment.paymentDate),
        money(payment.amount),
        payment.mode,
        payment.status,
        payment.remarks || "-",
      ]),
    ];
    void exportGridToExcel(`invoice-${bill.billNumber}.xlsx`, grid);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={bill.billNumber}
        subtitle={`${bill.stage} billing for ${customer?.customerConnection.customerName ?? "customer"}`}
        actions={
          <div className="flex items-center gap-2">
            <BillDrawer bill={bill} triggerLabel="Edit Bill" icon={<NotePencilIcon size={15} />} />
            <DeleteConfirmDialog
              itemName={`Bill ${bill.billNumber}`}
              variant="full"
              onConfirm={() =>
                deleteMutation.mutate(bill.id, {
                  onSuccess: () => router.push("/billing"),
                })
              }
            />
          </div>
        }
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <StatusBadge status={bill.status} />
        <span>
          Bill date: <span className="font-semibold text-foreground">{formatDate(bill.billDate)}</span>
        </span>
        <span>
          Total: <span className="font-semibold text-foreground">{money(bill.totalAmount)}</span>
        </span>
        <span>
          Paid: <span className="font-semibold text-foreground">{money(bill.paidAmount)}</span>
        </span>
        <span>
          Pending: <span className="font-semibold text-destructive">{money(bill.pendingAmount)}</span>
        </span>
      </div>
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
