import type { ColumnDef } from "@/components/shared/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BillPayment, BillPaymentStatus } from "../types/bill.types";
import { formatDate, money } from "../utils/format";

const paymentStatuses: BillPaymentStatus[] = ["Cleared", "Pending", "Bounced"];

export function getBillingPaymentColumns(params: {
  onStatusChange: (paymentId: string, status: BillPaymentStatus) => void;
}): ColumnDef<BillPayment>[] {
  const { onStatusChange } = params;

  return [
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
              onStatusChange(row.id, status as BillPaymentStatus);
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
}
