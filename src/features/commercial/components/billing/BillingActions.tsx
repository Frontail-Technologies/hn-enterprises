import { DownloadSimpleIcon, EyeIcon, NotePencilIcon, ReceiptIcon } from "@phosphor-icons/react";
import { ActionButton } from "@/components/shared/ActionButton";
import { getBillHref } from "../../utils/billing.utils";
import type { Bill } from "../../types/bill.types";
import { ActionLink } from "../shared/ActionLink";
import { BillDrawer } from "./BillDrawer";
import { PaymentDrawer } from "./PaymentDrawer";

export function BillingActions({
  bill,
  labels = false,
}: {
  bill: Bill;
  labels?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <ActionLink
        href={getBillHref(bill)}
        label="View"
        icon={<EyeIcon size={15} />}
        labels={labels}
      />
      <BillDrawer
        bill={bill}
        triggerLabel="Edit Bill"
        icon={<NotePencilIcon size={15} />}
        iconOnly={!labels}
      />
      <ActionButton
        label="Download Invoice"
        icon={<DownloadSimpleIcon size={15} />}
        labels={labels}
      />
      <PaymentDrawer
        billId={bill.id}
        icon={<ReceiptIcon size={15} />}
        iconOnly={!labels}
      />
    </div>
  );
}
