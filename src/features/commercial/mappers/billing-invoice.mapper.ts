import type { GridCell } from "@/lib/export-excel";
import type { Bill, BillPayment } from "../types/bill.types";
import { formatDate, money } from "../utils/format";

export function buildInvoiceGrid(bill: Bill, projectName: string | undefined, payments: BillPayment[]): GridCell[][] {
  const bold = (value: string | number): GridCell => ({ value, bold: true });

  return [
    [bold("INVOICE")],
    [bold("Bill Number"), bill.billNumber, bold("Bill Date"), formatDate(bill.billDate)],
    [bold("Project"), projectName ?? "-", bold("Due Date"), formatDate(bill.dueDate)],
    [bold("Status"), bill.status],
    [bold("Total Amount"), money(bill.totalAmount), bold("Tax"), money(bill.tax)],
    [bold("Paid Amount"), money(bill.paidAmount), bold("Pending Amount"), money(bill.pendingAmount)],
    [],
    [bold("Date"), bold("Amount"), bold("Mode"), bold("Status"), bold("Remarks")],
    ...payments.map((payment) => [
      formatDate(payment.paymentDate),
      money(payment.amount),
      payment.mode,
      payment.status,
      payment.remarks || "-",
    ]),
  ];
}
