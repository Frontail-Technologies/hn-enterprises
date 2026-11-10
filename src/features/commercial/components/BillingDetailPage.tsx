"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BuildingsIcon, CalendarBlankIcon, ClockIcon, DownloadSimpleIcon, NotePencilIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { DetailRows, ProgressList, RecordHeader, RecordLayout } from "@/components/shared/record";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportGridToExcel } from "@/lib/export-excel";
import { useProjectQuery } from "@/features/projects/hooks/useProjects";
import { useBillPaymentsQuery, useBillQuery, useDeleteBill, useUpdateBillPaymentStatus } from "../hooks/useBills";
import { getBillingPaymentColumns } from "../hooks/billing-payment.columns";
import { buildInvoiceGrid } from "../mappers/billing-invoice.mapper";
import type { BillPayment, BillPaymentStatus } from "../types/bill.types";
import { formatDate, money } from "../utils/format";
import { BillDialog } from "./billing/BillDialog";
import { PaymentDialog } from "./billing/PaymentDialog";
import { PageLoading } from "@/components/shared/PageLoading";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";

export function BillingDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: bill, isLoading, isError } = useBillQuery(id);
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
    refetch: refetchPayments,
  } = useBillPaymentsQuery(id);
  const { data: project } = useProjectQuery(bill?.projectId ?? "");
  const deleteMutation = useDeleteBill();
  const updatePaymentStatus = useUpdateBillPaymentStatus(id);
  useBreadcrumbLabel(id, bill?.billNumber);

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !bill) {
    return (
      <EmptyState
        illustration="error"
        title="Couldn't load this bill"
        description="It may have been removed, or the connection failed."
        action={{ label: "Back to billing", onClick: () => router.push("/billing") }}
      />
    );
  }

  function handleStatusChange(paymentId: string, status: BillPaymentStatus) {
    updatePaymentStatus.mutate({ paymentId, status });
  }

  const columns = getBillingPaymentColumns({ onStatusChange: handleStatusChange });

  function handleDownloadInvoice() {
    if (!bill) return;
    const grid = buildInvoiceGrid(bill, project?.name, payments);
    void exportGridToExcel(`invoice-${bill.billNumber}.xlsx`, grid);
  }

  // Paid + pending is the amount billed (as the API reports it), so the bar always reaches 100% when settled.
  const billed = bill.paidAmount + bill.pendingAmount;

  return (
    <div className="flex flex-col gap-5">
      <RecordHeader
        title={bill.billNumber}
        badges={<StatusBadge status={bill.status} />}
        meta={[
          { icon: BuildingsIcon, label: bill.projectName },
          { icon: CalendarBlankIcon, label: `Billed ${formatDate(bill.billDate)}` },
          { icon: ClockIcon, label: bill.dueDate ? `Due ${formatDate(bill.dueDate)}` : null },
        ]}
        figure={{
          label: "Balance due",
          value: <span className={bill.pendingAmount > 0 ? "text-destructive" : undefined}>{money(bill.pendingAmount)}</span>,
        }}
        actions={
          <>
            <BillDialog bill={bill} triggerLabel="Edit Bill" icon={<NotePencilIcon size={15} />} />
            <DeleteConfirmDialog
              itemName={`Bill ${bill.billNumber}`}
              variant="full"
              onConfirm={() =>
                deleteMutation.mutate(bill.id, {
                  onSuccess: () => router.push("/billing"),
                })
              }
            />
          </>
        }
      />

      <RecordLayout
        rail={
          <SectionCard title="Bill summary">
            <div className="flex flex-col gap-4">
              <ProgressList items={[{ label: "Collected", value: bill.paidAmount, total: billed }]} />
              <DetailRows
                rows={[
                  { label: "Total", value: money(bill.totalAmount) },
                  { label: "Tax", value: money(bill.tax) },
                  { label: "Paid", value: money(bill.paidAmount) },
                  { label: "Pending", value: <span className="text-destructive">{money(bill.pendingAmount)}</span> },
                  { label: "Bill date", value: formatDate(bill.billDate) },
                  { label: "Due date", value: bill.dueDate ? formatDate(bill.dueDate) : null },
                  { label: "Remarks", value: bill.remarks },
                ]}
              />
            </div>
          </SectionCard>
        }
      >
        <section className="flex flex-col gap-3">
          <h2 className="text-section-title">Payment history</h2>
          <PaymentHistory
            payments={payments}
            columns={columns}
            isLoading={paymentsLoading}
            isError={paymentsError}
            onRetry={() => void refetchPayments()}
            actions={
              <>
                <PaymentDialog billId={bill.id} />
                <Button type="button" variant="outline" size="compact" onClick={handleDownloadInvoice}>
                  <DownloadSimpleIcon size={14} />
                  Download Invoice
                </Button>
              </>
            }
          />
        </section>
      </RecordLayout>
    </div>
  );
}

function PaymentHistory({
  payments,
  columns,
  isLoading,
  isError,
  onRetry,
  actions,
}: {
  payments: BillPayment[];
  columns: ListColumn<BillPayment>[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  actions: ReactNode;
}) {
  const list = useListState({ pageSize: 25, storageKey: "bill-payments" });
  const { pageRows, total } = useClientRows(payments, list, { columns });

  return (
    <ListTable
      itemLabel="payment"
      rows={pageRows}
      total={total}
      columns={columns}
      state={list}
      searchPlaceholder="Search payments..."
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      actions={actions}
      empty={{ illustration: "billing", title: "No payments recorded", description: "Payments added against this bill will appear here." }}
    />
  );
}
