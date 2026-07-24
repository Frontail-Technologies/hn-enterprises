import { DownloadSimpleIcon, EyeIcon, NotePencilIcon, ReceiptIcon } from "@phosphor-icons/react";
import { ActionButton } from "@/components/shared/ActionButton";
import { getBillByNumber, getBillHref } from "../../utils/billing.utils";
import { ActionLink } from "../shared/ActionLink";
import { BillDrawer } from "./BillDrawer";

export function BillingActions({
  bill,
  labels = false,
}: {
  bill: string;
  labels?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <ActionLink
        href={getBillHref(getBillByNumber(bill))}
        label="View"
        icon={<EyeIcon size={15} />}
        labels={labels}
      />
      <BillDrawer
        action="Edit Draft"
        icon={<NotePencilIcon size={15} />}
        iconOnly={!labels}
      />
      <ActionButton
        label="Download Invoice"
        icon={<DownloadSimpleIcon size={15} />}
        labels={labels}
      />
      <BillDrawer
        action="Record Payment"
        icon={<ReceiptIcon size={15} />}
        iconOnly={!labels}
      />
    </div>
  );
}
