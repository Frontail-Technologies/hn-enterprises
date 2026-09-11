import { useState } from "react";
import { DownloadSimpleIcon, EyeIcon, NotePencilIcon, ReceiptIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ActionButton } from "@/components/shared/ActionButton";
import { exportGridToExcel } from "@/lib/export-excel";
import { buildInvoiceGrid } from "../../mappers/billing-invoice.mapper";
import { billsApi } from "../../services/bills.service";
import { getBillHref } from "../../utils/billing.utils";
import type { Bill } from "../../types/bill.types";
import { ActionLink } from "../shared/ActionLink";
import { BillDialog } from "./BillDialog";
import { PaymentDialog } from "./PaymentDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useDeleteBill } from "../../hooks/useBills";

export function BillingActions({
  bill,
  labels = false,
}: {
  bill: Bill;
  labels?: boolean;
}) {
  const deleteMutation = useDeleteBill();
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownloadInvoice() {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const payments = await billsApi.listPayments(bill.id);
      const grid = buildInvoiceGrid(bill, bill.projectName, payments);
      await exportGridToExcel(`invoice-${bill.billNumber}.xlsx`, grid);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to download invoice");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <ActionLink
        href={getBillHref(bill)}
        label="View"
        icon={<EyeIcon size={15} />}
        labels={labels}
      />
      <BillDialog
        bill={bill}
        triggerLabel="Edit Bill"
        icon={<NotePencilIcon size={15} />}
        iconOnly={!labels}
      />
      <ActionButton
        label="Download Invoice"
        icon={<DownloadSimpleIcon size={15} />}
        labels={labels}
        onClick={handleDownloadInvoice}
        disabled={isDownloading}
      />
      <PaymentDialog
        billId={bill.id}
        icon={<ReceiptIcon size={15} />}
        iconOnly={!labels}
      />
      <DeleteConfirmDialog
        itemName={`Bill ${bill.billNumber}`}
        onConfirm={() => deleteMutation.mutateAsync(bill.id)}
      />
    </div>
  );
}
