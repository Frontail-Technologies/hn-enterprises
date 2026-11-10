import type { ListColumn } from "@/components/shared/list";
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
}): ListColumn<BillPayment>[] {
  const { onStatusChange } = params;

  return [
    {
      id: "paymentDate",
      header: "Date",
      width: 130,
      sortable: true,
      hideable: false,
      value: (row) => row.paymentDate,
      cell: (row) => formatDate(row.paymentDate),
    },
    {
      id: "amount",
      header: "Amount",
      width: 140,
      align: "end",
      sortable: true,
      value: (row) => row.amount,
      cell: (row) => <span className="font-semibold">{money(row.amount)}</span>,
    },
    { id: "mode", header: "Mode", width: 130, sortable: true, value: (row) => row.mode },
    {
      id: "status",
      header: "Status",
      width: 150,
      sortable: true,
      value: (row) => row.status,
      cell: (row) => (
        <Select
          value={row.status}
          onValueChange={(status) => {
            if (status && status !== row.status) {
              onStatusChange(row.id, status as BillPaymentStatus);
            }
          }}
        >
          <SelectTrigger className="h-7 w-28 text-xs">
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
    { id: "remarks", header: "Remarks", width: 260, grow: true, value: (row) => row.remarks },
  ];
}
