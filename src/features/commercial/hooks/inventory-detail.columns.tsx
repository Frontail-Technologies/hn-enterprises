import type { ListColumn } from "@/components/shared/list";
import type { ExportColumn } from "@/lib/export-excel";
import type { PlumberLedgerRow } from "../mappers/inventory-detail.mapper";
import type { MaterialTransaction } from "../types/material.types";
import { formatDate, projectLabelFromName, sourceLabel } from "../utils/format";

// Every column keeps the Excel-style value filter it had on ExcelDataGrid.
// `value` returns the same raw value as before (also used for Excel export).
const filterable = { columnFilter: true } as const;

/** Excel export columns from list columns (same labels and raw values). */
export function toExportColumns<T>(columns: ListColumn<T>[]): ExportColumn<T>[] {
  return columns.map((column) => ({ label: column.header, getValue: (row: T) => column.value?.(row) }));
}

const dateColumn: ListColumn<MaterialTransaction> = {
  id: "transactionDate",
  header: "Date",
  width: 130,
  ...filterable,
  value: (row) => row.transactionDate,
  cell: (row) => formatDate(row.transactionDate),
};

export function useInventoryDetailColumns() {
  const purchaseColumns: ListColumn<MaterialTransaction>[] = [
    { id: "type", header: "Type", width: 130, pin: true, hideable: false, ...filterable, value: (row) => (row.type === "pbg_issue" ? "PBG Issue" : "Purchase") },
    { id: "vendor", header: "Vendor", width: 170, ...filterable, value: (row) => row.vendorName },
    dateColumn,
    { id: "quantity", header: "Quantity", width: 120, align: "end", ...filterable, value: (row) => row.quantity },
    { id: "rate", header: "Rate", width: 110, align: "end", ...filterable, value: (row) => row.rate ?? "-" },
    { id: "billAmount", header: "Bill Amount", width: 140, align: "end", ...filterable, value: (row) => row.billAmount ?? "-" },
    { id: "referenceNo", header: "Reference No.", width: 150, ...filterable, value: (row) => row.referenceNo },
  ];

  const storeIssueColumns: ListColumn<MaterialTransaction>[] = [
    { id: "slipNo", header: "Slip No.", width: 130, pin: true, hideable: false, ...filterable, value: (row) => row.referenceNo },
    dateColumn,
    { id: "quantity", header: "Quantity", width: 120, align: "end", ...filterable, value: (row) => row.quantity },
    { id: "source", header: "Source", width: 110, ...filterable, value: (row) => sourceLabel(row.source) },
    { id: "plumber", header: "Plumber / Team", width: 170, ...filterable, value: (row) => row.plumberName || "-" },
    { id: "supervisorName", header: "Supervisor", width: 150, ...filterable, value: (row) => row.supervisorName },
    { id: "project", header: "Project", width: 180, ...filterable, value: (row) => projectLabelFromName(row.projectId, row.projectName) },
    { id: "address", header: "Address", width: 190, ...filterable, value: (row) => row.address ?? "-" },
  ];

  const transactionColumns: ListColumn<MaterialTransaction>[] = [
    { id: "type", header: "Type", width: 150, pin: true, hideable: false, ...filterable, value: (row) => row.type },
    { id: "quantity", header: "Quantity", width: 120, align: "end", ...filterable, value: (row) => row.quantity },
    { id: "source", header: "Source", width: 110, ...filterable, value: (row) => sourceLabel(row.source) },
    { id: "plumber", header: "Plumber", width: 160, ...filterable, value: (row) => row.plumberName || "-" },
    { id: "address", header: "Address", width: 190, ...filterable, value: (row) => row.address ?? "-" },
    { id: "customer", header: "Customer", width: 190, ...filterable, value: (row) => row.customerName || "-" },
    { id: "project", header: "Project", width: 180, ...filterable, value: (row) => projectLabelFromName(row.projectId, row.projectName) },
    dateColumn,
    { id: "remarks", header: "Remarks", width: 260, ...filterable, value: (row) => row.remarks },
  ];

  const consumptionColumns: ListColumn<MaterialTransaction>[] = [
    { id: "customer", header: "Customer", width: 190, pin: true, hideable: false, ...filterable, value: (row) => row.customerName || "-" },
    { id: "usedQty", header: "Used Qty", width: 120, align: "end", ...filterable, value: (row) => row.quantity },
    { id: "source", header: "Source", width: 110, ...filterable, value: (row) => sourceLabel(row.source) },
    { id: "project", header: "Project", width: 180, ...filterable, value: (row) => projectLabelFromName(row.projectId, row.projectName) },
    { id: "plumber", header: "Plumber", width: 150, ...filterable, value: (row) => row.plumberName || "-" },
    { id: "supervisorName", header: "Supervisor", width: 160, ...filterable, value: (row) => row.supervisorName },
    { id: "reportNo", header: "Report No.", width: 140, ...filterable, value: (row) => row.reportNo },
    dateColumn,
  ];

  // Fully loaded: sortable.
  const plumberBalanceColumns: ListColumn<PlumberLedgerRow>[] = [
    { id: "plumberName", header: "Plumber / Team", width: 170, pin: true, hideable: false, sortable: true, ...filterable, value: (row) => row.plumberName },
    { id: "source", header: "Source", width: 110, sortable: true, ...filterable, value: (row) => sourceLabel(row.source) },
    { id: "project", header: "Project", width: 180, sortable: true, ...filterable, value: (row) => projectLabelFromName(row.projectId, row.projectName) },
    { id: "issued", header: "Total Issued", width: 130, align: "end", sortable: true, ...filterable, value: (row) => row.issued },
    { id: "consumed", header: "Consumed", width: 120, align: "end", sortable: true, ...filterable, value: (row) => row.consumed },
    { id: "returned", header: "Returned", width: 120, align: "end", sortable: true, ...filterable, value: (row) => row.returned },
    { id: "adjusted", header: "Adjusted", width: 120, align: "end", sortable: true, ...filterable, value: (row) => row.adjusted },
    { id: "balance", header: "Balance", width: 120, align: "end", sortable: true, ...filterable, value: (row) => row.balance },
  ];

  return { purchaseColumns, storeIssueColumns, transactionColumns, consumptionColumns, plumberBalanceColumns };
}
