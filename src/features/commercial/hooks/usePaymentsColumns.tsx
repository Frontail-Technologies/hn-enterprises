import type { ListColumn } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ExportColumn } from "@/lib/export-excel";
import type { Payment } from "../types/payment.types";
import { formatDate, money } from "../utils/format";

const entryId = (row: Payment) => row.id.slice(0, 8).toUpperCase();

// Financial attribution always stays supervisorName (R18); "Created By" is
// purely "who actually entered this record" for audit purposes - an admin's
// on-behalf entries read differently from self-created ones.
const createdBy = (row: Payment) =>
  row.createdByName && row.createdByName !== row.supervisorName
    ? `${row.createdByName} (for ${row.supervisorName || "supervisor"})`
    : row.createdByName || "-";

/**
 * Payments are server-paged, so the Excel-style column filters (kept from the
 * old grid) act on the loaded page, as they did before. No sorting: the API
 * has no sort params.
 */
export function usePaymentsColumns({ plumberNameById }: { plumberNameById: Map<string, string> }) {
  const paidTo = (row: Payment) => row.paidTo || plumberNameById.get(row.plumberId) || "-";

  const columns: ListColumn<Payment>[] = [
    { id: "id", header: "Entry ID", width: 120, value: entryId, isTitle: true, hideable: false, columnFilter: true },
    { id: "category", header: "Category", width: 190, value: (row) => row.category, columnFilter: true },
    { id: "customer", header: "Customer", width: 170, value: (row) => row.customerName || "-", columnFilter: true },
    { id: "supervisor", header: "Supervisor", width: 160, value: (row) => row.supervisorName || "-", columnFilter: true },
    { id: "paidTo", header: "Paid To", width: 180, grow: true, value: paidTo, columnFilter: true },
    { id: "address", header: "Address", width: 190, grow: true, value: (row) => row.address || "-", columnFilter: true },
    { id: "amount", header: "Amount", width: 130, align: "end", value: (row) => money(row.amount), columnFilter: true },
    { id: "date", header: "Date", width: 120, value: (row) => formatDate(row.paymentDate), columnFilter: true },
    { id: "mode", header: "Payment Mode", width: 140, value: (row) => row.mode, columnFilter: true },
    { id: "status", header: "Status", width: 130, value: (row) => row.status, cell: (row) => <StatusBadge status={row.status} />, columnFilter: true },
    { id: "createdBy", header: "Created By", width: 180, value: createdBy, columnFilter: true },
    {
      id: "evidence",
      header: "Attachment",
      width: 120,
      value: (row) => row.evidence.length,
      cell: (row) => (row.evidence.length ? <span className="font-medium text-primary">{row.evidence.length} file(s)</span> : "-"),
      columnFilter: true,
    },
  ];

  const exportColumns: ExportColumn<Payment>[] = [
    { label: "Entry ID", getValue: entryId },
    { label: "Category", getValue: (row) => row.category },
    { label: "Customer", getValue: (row) => row.customerName || "-" },
    { label: "Supervisor", getValue: (row) => row.supervisorName || "-" },
    { label: "Paid To", getValue: paidTo },
    { label: "Address", getValue: (row) => row.address || "-" },
    { label: "Amount", getValue: (row) => money(row.amount) },
    { label: "Date", getValue: (row) => formatDate(row.paymentDate) },
    { label: "Payment Mode", getValue: (row) => row.mode },
    { label: "Status", getValue: (row) => row.status },
    { label: "Created By", getValue: createdBy },
    { label: "Attachment", getValue: (row) => row.evidence.length },
  ];

  return { columns, exportColumns };
}
