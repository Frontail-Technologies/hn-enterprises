"use client";

import { EyeIcon } from "@phosphor-icons/react";
import { ActionButton } from "@/components/shared/ActionButton";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { resolveFileUrl } from "@/lib/upload";
import { useDeletePayment } from "../hooks/usePayments";
import type { Payment } from "../types/payment.types";
import { PaymentDialog } from "./PaymentDialog";

export function PaymentActions({ payment }: { payment: Payment }) {
  const href = resolveFileUrl(payment.evidence[0]?.fileUrl);
  const deletePayment = useDeletePayment();
  return (
    <div className="flex items-center gap-1">
      <ActionButton label="View" icon={<EyeIcon size={15} />} href={href} disabled={!href} />
      <PaymentDialog payment={payment} iconOnly />
      <DeleteConfirmDialog
        itemName={payment.paidTo || payment.purpose || "this entry"}
        onConfirm={() => deletePayment.mutate(payment.id)}
      />
    </div>
  );
}
