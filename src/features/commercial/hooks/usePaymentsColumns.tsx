import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentActions } from "../components/PaymentActions";
import type { Payment } from "../types/payment.types";
import { formatDate, money } from "../utils/format";

export function usePaymentsColumns({
  plumberNameById,
}: {
  plumberNameById: Map<string, string>;
}): ExcelColumn<Payment>[] {
  return [
    {
      key: "id",
      label: "Entry ID",
      width: 130,
      sticky: true,
      getValue: (row) => row.id.slice(0, 8).toUpperCase(),
      render: (row) => <span className="font-semibold text-foreground">{row.id.slice(0, 8).toUpperCase()}</span>,
    },
    { key: "category", label: "Category", width: 190, getValue: (row) => row.category },
    { key: "customer", label: "Customer", width: 170, getValue: (row) => row.customerName || "-" },
    { key: "supervisor", label: "Supervisor", width: 160, getValue: (row) => row.supervisorName || "-" },
    {
      key: "paidTo",
      label: "Paid To",
      width: 180,
      grow: true,
      getValue: (row) => row.paidTo || plumberNameById.get(row.plumberId) || "-",
    },
    { key: "address", label: "Address", width: 190, grow: true, getValue: (row) => row.address || "-" },
    { key: "amount", label: "Amount", width: 130, getValue: (row) => money(row.amount) },
    { key: "date", label: "Date", width: 130, getValue: (row) => formatDate(row.paymentDate) },
    { key: "mode", label: "Payment Mode", width: 150, getValue: (row) => row.mode },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdBy",
      label: "Created By",
      width: 160,
      // Financial attribution always stays supervisorName (R18); this column
      // is purely "who actually entered this record" for audit purposes -
      // an admin's on-behalf entries read differently from self-created ones.
      getValue: (row) =>
        row.createdByName && row.createdByName !== row.supervisorName
          ? `${row.createdByName} (for ${row.supervisorName || "supervisor"})`
          : row.createdByName || "-",
    },
    {
      key: "evidence",
      label: "Attachment",
      width: 140,
      getValue: (row) => row.evidence.length,
      render: (row) => (row.evidence.length ? <span className="font-medium text-primary">{row.evidence.length} file(s)</span> : "-"),
    },
    {
      key: "actions",
      label: "Actions",
      width: 100,
      getValue: () => "Actions",
      render: (row) => <PaymentActions payment={row} />,
    },
  ];
}
