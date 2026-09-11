"use client";

import { useRouter } from "next/navigation";
import { DownloadSimpleIcon, NotePencilIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportGridToExcel } from "@/lib/export-excel";
import { useProjectQuery } from "@/features/projects/hooks/useProjects";
import { useBillPaymentsQuery, useBillQuery, useDeleteBill, useUpdateBillPaymentStatus } from "../hooks/useBills";
import { getBillingPaymentColumns } from "../hooks/billing-payment.columns";
import { buildInvoiceGrid } from "../mappers/billing-invoice.mapper";
import type { BillPaymentStatus } from "../types/bill.types";
import { formatDate, money } from "../utils/format";
import { BillDialog } from "./billing/BillDialog";
import { PaymentDialog } from "./billing/PaymentDialog";
import { Panel } from "./shared/Panel";
import { PageLoading } from "@/components/shared/PageLoading";
import { useBreadcrumbLabel } from "@/components/layout/BreadcrumbLabelContext";

export function BillingDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: bill, isLoading, isError } = useBillQuery(id);
  const { data: payments = [] } = useBillPaymentsQuery(id);
  const { data: project } = useProjectQuery(bill?.projectId ?? "");
  const deleteMutation = useDeleteBill();
  const updatePaymentStatus = useUpdateBillPaymentStatus(id);
  useBreadcrumbLabel(id, bill?.billNumber);

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !bill) {
    return <p className="p-4 text-sm text-destructive">Unable to load this bill.</p>;
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

  return (
    <div className="space-y-5">
      <PageHeader
        title={bill.billNumber}
        actions={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
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
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <PaymentDialog billId={bill.id} />
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
