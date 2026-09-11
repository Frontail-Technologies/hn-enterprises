import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import type { PlumberLedgerRow } from "../mappers/inventory-detail.mapper";
import type { Material, MaterialTransaction } from "../types/material.types";
import { formatDate, projectLabelFromName, sourceLabel } from "../utils/format";
import { TransactionRowActions } from "../components/inventory/TransactionRowActions";

export function useInventoryDetailColumns(params: { material: Material | undefined }) {
  const { material } = params;

  const actionsColumn: ExcelColumn<MaterialTransaction> = {
    key: "actions",
    label: "Actions",
    width: 140,
    getValue: () => "",
    render: (row) => (
      <TransactionRowActions
        transaction={row}
        lookups={{
          materialName: material?.name ?? "",
          plumberName: row.plumberName,
          supervisorName: row.supervisorName,
          customerName: row.customerName,
          projectName: row.projectName,
        }}
      />
    ),
  };

  const purchaseColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "type", label: "Type", width: 130, sticky: true, getValue: (row) => (row.type === "pbg_issue" ? "PBG Issue" : "Purchase") },
    { key: "vendor", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
    { key: "rate", label: "Rate", width: 110, getValue: (row) => row.rate ?? "-" },
    { key: "billAmount", label: "Bill Amount", width: 140, getValue: (row) => row.billAmount ?? "-" },
    { key: "referenceNo", label: "Reference No.", width: 150, getValue: (row) => row.referenceNo },
    actionsColumn,
  ];

  const storeIssueColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "slipNo", label: "Slip No.", width: 130, sticky: true, getValue: (row) => row.referenceNo },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
    { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
    { key: "plumber", label: "Plumber / Team", width: 170, getValue: (row) => row.plumberName || "-" },
    { key: "supervisorName", label: "Supervisor", width: 150, getValue: (row) => row.supervisorName },
    { key: "project", label: "Project", width: 180, getValue: (row) => projectLabelFromName(row.projectId, row.projectName) },
    { key: "address", label: "Address", width: 190, getValue: (row) => row.address ?? "-" },
    actionsColumn,
  ];

  const transactionColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "type", label: "Type", width: 150, sticky: true, getValue: (row) => row.type },
    { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
    { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
    { key: "plumber", label: "Plumber", width: 160, getValue: (row) => row.plumberName || "-" },
    { key: "address", label: "Address", width: 190, getValue: (row) => row.address ?? "-" },
    { key: "customer", label: "Customer", width: 190, getValue: (row) => row.customerName || "-" },
    { key: "project", label: "Project", width: 180, getValue: (row) => projectLabelFromName(row.projectId, row.projectName) },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    { key: "remarks", label: "Remarks", width: 260, getValue: (row) => row.remarks },
    actionsColumn,
  ];

  const consumptionColumns: ExcelColumn<MaterialTransaction>[] = [
    { key: "customer", label: "Customer", width: 190, sticky: true, getValue: (row) => row.customerName || "-" },
    { key: "usedQty", label: "Used Qty", width: 120, getValue: (row) => row.quantity },
    { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
    { key: "project", label: "Project", width: 180, getValue: (row) => projectLabelFromName(row.projectId, row.projectName) },
    { key: "plumber", label: "Plumber", width: 150, getValue: (row) => row.plumberName || "-" },
    { key: "supervisorName", label: "Supervisor", width: 160, getValue: (row) => row.supervisorName },
    { key: "reportNo", label: "Report No.", width: 140, getValue: (row) => row.reportNo },
    { key: "transactionDate", label: "Date", width: 130, getValue: (row) => row.transactionDate, render: (row) => formatDate(row.transactionDate) },
    actionsColumn,
  ];

  const plumberBalanceColumns: ExcelColumn<PlumberLedgerRow>[] = [
    { key: "plumberName", label: "Plumber / Team", width: 170, sticky: true, getValue: (row) => row.plumberName },
    { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
    { key: "project", label: "Project", width: 180, getValue: (row) => projectLabelFromName(row.projectId, row.projectName) },
    { key: "issued", label: "Total Issued", width: 130, getValue: (row) => row.issued },
    { key: "consumed", label: "Consumed", width: 120, getValue: (row) => row.consumed },
    { key: "returned", label: "Returned", width: 120, getValue: (row) => row.returned },
    { key: "adjusted", label: "Adjusted", width: 120, getValue: (row) => row.adjusted },
    { key: "balance", label: "Balance", width: 120, getValue: (row) => row.balance },
  ];

  return { purchaseColumns, storeIssueColumns, transactionColumns, consumptionColumns, plumberBalanceColumns };
}
