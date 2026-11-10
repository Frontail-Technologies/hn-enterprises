import type { ListColumn } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { PlumberBalanceRow } from "../mappers/inventory.mapper";
import type { Material, MaterialTransaction, MaterialTransactionType, TotalIssueSummaryRow } from "../types/material.types";
import { computeStockStatus, formatDate, projectLabelFromName, sourceLabel } from "../utils/format";
import { TransactionRowActions } from "../components/inventory/TransactionRowActions";

// Every column keeps the Excel-style value filter it had on ExcelDataGrid
// (`columnFilter: true`). `value` returns the same raw value as before.
const filterable = { columnFilter: true } as const;

export function renderTransactionActions(row: MaterialTransaction, materialName?: string) {
  return (
    <TransactionRowActions
      transaction={row}
      lookups={{
        materialName: materialName ?? (row.materialName || "-"),
        plumberName: row.plumberName,
        supervisorName: row.supervisorName,
        customerName: row.customerName,
        projectName: row.projectName,
      }}
    />
  );
}

export function useInventoryColumns(params: {
  stockFiltered: boolean;
  stockBalanceByMaterialId: Map<string, number>;
}) {
  const { stockFiltered, stockBalanceByMaterialId } = params;
  const stockBalance = (row: Material) => (stockFiltered ? stockBalanceByMaterialId.get(row.id) ?? 0 : row.currentBalance);
  const stockStatus = (row: Material) =>
    stockFiltered ? computeStockStatus(stockBalanceByMaterialId.get(row.id) ?? 0, row.reorderLevel) : row.status;

  const stockColumns: ListColumn<Material>[] = [
    { id: "name", header: "Item Name", width: 230, isTitle: true, grow: true, hideable: false, sortable: true, ...filterable, value: (row) => row.name },
    { id: "category", header: "Category", width: 150, grow: true, sortable: true, ...filterable, value: (row) => row.category },
    { id: "unit", header: "Unit", width: 90, sortable: true, ...filterable, value: (row) => row.unit },
    {
      id: "currentBalance",
      header: stockFiltered ? "Balance (Filtered)" : "Current Balance",
      width: 160,
      align: "end",
      sortable: true,
      ...filterable,
      value: stockBalance,
    },
    { id: "reorderLevel", header: "Reorder Level", width: 140, align: "end", sortable: true, ...filterable, value: (row) => row.reorderLevel },
    { id: "status", header: "Status", width: 140, sortable: true, ...filterable, value: stockStatus, cell: (row) => <StatusBadge status={stockStatus(row)} /> },
  ];

  // Server-paged: no sorting (the API has no sort params); column filters act on the loaded page, as before.
  function transactionColumns(kind: MaterialTransactionType): ListColumn<MaterialTransaction>[] {
    const base: ListColumn<MaterialTransaction>[] = [
      { id: "material", header: "Item Name", width: 220, isTitle: true, grow: true, hideable: false, ...filterable, value: (row) => row.materialName || "-" },
      { id: "referenceNo", header: "Reference No.", width: 150, ...filterable, value: (row) => row.referenceNo },
      { id: "quantity", header: "Quantity", width: 120, align: "end", ...filterable, value: (row) => row.quantity },
      { id: "transactionDate", header: "Date", width: 130, ...filterable, value: (row) => row.transactionDate, cell: (row) => formatDate(row.transactionDate) },
    ];

    let specific: ListColumn<MaterialTransaction>[] = [];
    if (kind === "purchase") {
      specific = [
        { id: "rate", header: "Rate", width: 110, align: "end", ...filterable, value: (row) => row.rate ?? "-" },
        { id: "billAmount", header: "Bill Amount", width: 140, align: "end", ...filterable, value: (row) => row.billAmount ?? "-" },
        { id: "vendorName", header: "Vendor", width: 170, ...filterable, value: (row) => row.vendorName },
      ];
    } else if (kind === "pbg_issue") {
      specific = [
        { id: "vendorName", header: "Vendor", width: 170, ...filterable, value: (row) => row.vendorName },
        { id: "vehicleNo", header: "Vehicle No.", width: 140, ...filterable, value: (row) => row.vehicleNo },
        { id: "vehicleQty", header: "Vehicle Qty", width: 120, align: "end", ...filterable, value: (row) => row.vehicleQty ?? "-" },
        { id: "supervisorName", header: "Person", width: 150, ...filterable, value: (row) => row.supervisorName },
      ];
    } else if (kind === "pbg_consumption") {
      specific = [
        { id: "customer", header: "Customer", width: 190, ...filterable, value: (row) => row.customerName || "-" },
        { id: "plumber", header: "Plumber", width: 150, ...filterable, value: (row) => row.plumberName || "-" },
        { id: "project", header: "Project", width: 180, ...filterable, value: (row) => projectLabelFromName(row.projectId, row.projectName) },
        { id: "vendorName", header: "Vendor", width: 170, ...filterable, value: (row) => row.vendorName },
      ];
    } else if (kind === "issue") {
      specific = [
        { id: "source", header: "Source", width: 110, ...filterable, value: (row) => sourceLabel(row.source) },
        { id: "plumber", header: "Plumber / Team", width: 170, ...filterable, value: (row) => row.plumberName || "-" },
        { id: "supervisorName", header: "Supervisor", width: 150, ...filterable, value: (row) => row.supervisorName },
        { id: "project", header: "Project", width: 180, ...filterable, value: (row) => projectLabelFromName(row.projectId, row.projectName) },
        { id: "address", header: "Address", width: 190, ...filterable, value: (row) => row.address ?? "-" },
      ];
    } else if (kind === "consumption") {
      specific = [
        { id: "source", header: "Source", width: 110, ...filterable, value: (row) => sourceLabel(row.source) },
        { id: "customer", header: "Customer", width: 190, ...filterable, value: (row) => row.customerName || "-" },
        { id: "project", header: "Project", width: 180, ...filterable, value: (row) => projectLabelFromName(row.projectId, row.projectName) },
        { id: "reportNo", header: "Report No.", width: 140, ...filterable, value: (row) => row.reportNo },
        { id: "plumber", header: "Plumber", width: 150, ...filterable, value: (row) => row.plumberName || "-" },
        { id: "supervisorName", header: "Supervisor", width: 150, ...filterable, value: (row) => row.supervisorName },
        { id: "address", header: "Address", width: 190, ...filterable, value: (row) => row.address ?? "-" },
      ];
    }

    return [...base, ...specific];
  }

  const totalIssueColumns: ListColumn<TotalIssueSummaryRow>[] = [
    { id: "materialName", header: "Item Name", width: 240, isTitle: true, grow: true, hideable: false, sortable: true, ...filterable, value: (row) => row.materialName },
    { id: "unit", header: "Unit", width: 90, sortable: true, ...filterable, value: (row) => row.unit },
    { id: "totalIssued", header: "Total Issued", width: 150, align: "end", sortable: true, ...filterable, value: (row) => row.totalIssued },
    { id: "transactionCount", header: "Issue Slips", width: 130, align: "end", sortable: true, ...filterable, value: (row) => row.transactionCount },
    {
      id: "lastIssueDate",
      header: "Last Issue Date",
      width: 160,
      sortable: true,
      ...filterable,
      value: (row) => row.lastIssueDate,
      cell: (row) => formatDate(row.lastIssueDate),
    },
  ];

  const plumberBalanceColumns: ListColumn<PlumberBalanceRow>[] = [
    { id: "plumberName", header: "Plumber / Team", width: 180, isTitle: true, grow: true, hideable: false, sortable: true, ...filterable, value: (row) => row.plumberName },
    { id: "materialName", header: "Material", width: 210, grow: true, sortable: true, ...filterable, value: (row) => row.materialName },
    { id: "source", header: "Source", width: 110, sortable: true, ...filterable, value: (row) => sourceLabel(row.source) },
    { id: "project", header: "Project", width: 180, sortable: true, ...filterable, value: (row) => projectLabelFromName(row.projectId, row.projectName) },
    { id: "issued", header: "Total Issued", width: 140, align: "end", sortable: true, ...filterable, value: (row) => row.issued },
    { id: "consumed", header: "Consumed", width: 130, align: "end", sortable: true, ...filterable, value: (row) => row.consumed },
    { id: "returned", header: "Returned", width: 130, align: "end", sortable: true, ...filterable, value: (row) => row.returned },
    { id: "adjusted", header: "Adjusted", width: 120, align: "end", sortable: true, ...filterable, value: (row) => row.adjusted },
    {
      id: "balance",
      header: "Balance With Plumber",
      width: 190,
      align: "end",
      sortable: true,
      ...filterable,
      value: (row) => row.balance,
      cell: (row) => <b>{row.balance}</b>,
    },
  ];

  return { stockColumns, transactionColumns, totalIssueColumns, plumberBalanceColumns };
}
