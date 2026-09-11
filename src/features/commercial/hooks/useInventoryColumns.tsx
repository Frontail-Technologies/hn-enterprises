import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { PlumberBalanceRow } from "../mappers/inventory.mapper";
import type { Material, MaterialTransaction, MaterialTransactionType, TotalIssueSummaryRow } from "../types/material.types";
import { computeStockStatus, formatDate, projectLabelFromName, sourceLabel } from "../utils/format";
import { TransactionRowActions } from "../components/inventory/TransactionRowActions";

export function useInventoryColumns(params: {
  stockFiltered: boolean;
  stockBalanceByMaterialId: Map<string, number>;
}) {
  const { stockFiltered, stockBalanceByMaterialId } = params;

  const stockColumns: ExcelColumn<Material>[] = [
    {
      key: "name",
      label: "Item Name",
      width: 230,
      sticky: true,
      grow: true,
      getValue: (row) => row.name,
      render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    { key: "category", label: "Category", width: 150, grow: true, getValue: (row) => row.category },
    { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
    {
      key: "currentBalance",
      label: stockFiltered ? "Balance (Filtered)" : "Current Balance",
      width: 160,
      getValue: (row) => (stockFiltered ? stockBalanceByMaterialId.get(row.id) ?? 0 : row.currentBalance),
    },
    { key: "reorderLevel", label: "Reorder Level", width: 140, getValue: (row) => row.reorderLevel },
    {
      key: "status",
      label: "Status",
      width: 140,
      getValue: (row) => (stockFiltered ? computeStockStatus(stockBalanceByMaterialId.get(row.id) ?? 0, row.reorderLevel) : row.status),
      render: (row) => (
        <StatusBadge status={stockFiltered ? computeStockStatus(stockBalanceByMaterialId.get(row.id) ?? 0, row.reorderLevel) : row.status} />
      ),
    },
  ];

  function transactionColumns(kind: MaterialTransactionType): ExcelColumn<MaterialTransaction>[] {
    const base: ExcelColumn<MaterialTransaction>[] = [
      {
        key: "material",
        label: "Item Name",
        width: 220,
        sticky: true,
        grow: true,
        getValue: (row) => row.materialName || "-",
        render: (row) => <span className="font-semibold text-foreground">{row.materialName || "-"}</span>,
      },
      { key: "referenceNo", label: "Reference No.", width: 150, getValue: (row) => row.referenceNo },
      { key: "quantity", label: "Quantity", width: 120, getValue: (row) => row.quantity },
      {
        key: "transactionDate",
        label: "Date",
        width: 130,
        getValue: (row) => row.transactionDate,
        render: (row) => formatDate(row.transactionDate),
      },
    ];

    let specific: ExcelColumn<MaterialTransaction>[] = [];
    if (kind === "purchase") {
      specific = [
        { key: "rate", label: "Rate", width: 110, getValue: (row) => row.rate ?? "-" },
        { key: "billAmount", label: "Bill Amount", width: 140, getValue: (row) => row.billAmount ?? "-" },
        { key: "vendorName", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
      ];
    } else if (kind === "pbg_issue") {
      specific = [
        { key: "vendorName", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
        { key: "vehicleNo", label: "Vehicle No.", width: 140, getValue: (row) => row.vehicleNo },
        { key: "vehicleQty", label: "Vehicle Qty", width: 120, getValue: (row) => row.vehicleQty ?? "-" },
        { key: "supervisorName", label: "Person", width: 150, getValue: (row) => row.supervisorName },
      ];
    } else if (kind === "pbg_consumption") {
      specific = [
        { key: "customer", label: "Customer", width: 190, getValue: (row) => row.customerName || "-" },
        { key: "plumber", label: "Plumber", width: 150, getValue: (row) => row.plumberName || "-" },
        { key: "project", label: "Project", width: 180, getValue: (row) => projectLabelFromName(row.projectId, row.projectName) },
        { key: "vendorName", label: "Vendor", width: 170, getValue: (row) => row.vendorName },
      ];
    } else if (kind === "issue") {
      specific = [
        { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
        { key: "plumber", label: "Plumber / Team", width: 170, getValue: (row) => row.plumberName || "-" },
        { key: "supervisorName", label: "Supervisor", width: 150, getValue: (row) => row.supervisorName },
        { key: "project", label: "Project", width: 180, getValue: (row) => projectLabelFromName(row.projectId, row.projectName) },
        { key: "address", label: "Address", width: 190, getValue: (row) => row.address ?? "-" },
      ];
    } else if (kind === "consumption") {
      specific = [
        { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
        { key: "customer", label: "Customer", width: 190, getValue: (row) => row.customerName || "-" },
        { key: "project", label: "Project", width: 180, getValue: (row) => projectLabelFromName(row.projectId, row.projectName) },
        { key: "reportNo", label: "Report No.", width: 140, getValue: (row) => row.reportNo },
        { key: "plumber", label: "Plumber", width: 150, getValue: (row) => row.plumberName || "-" },
        { key: "supervisorName", label: "Supervisor", width: 150, getValue: (row) => row.supervisorName },
        { key: "address", label: "Address", width: 190, getValue: (row) => row.address ?? "-" },
      ];
    }

    const actionsColumn: ExcelColumn<MaterialTransaction> = {
      key: "actions",
      label: "Actions",
      width: 140,
      getValue: () => "",
      render: (row) => (
        <TransactionRowActions
          transaction={row}
          lookups={{
            materialName: row.materialName || "-",
            plumberName: row.plumberName,
            supervisorName: row.supervisorName,
            customerName: row.customerName,
            projectName: row.projectName,
          }}
        />
      ),
    };

    return [...base, ...specific, actionsColumn];
  }

  const totalIssueColumns: ExcelColumn<TotalIssueSummaryRow>[] = [
    {
      key: "materialName",
      label: "Item Name",
      width: 240,
      sticky: true,
      grow: true,
      getValue: (row) => row.materialName,
      render: (row) => <span className="font-semibold text-foreground">{row.materialName}</span>,
    },
    { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
    { key: "totalIssued", label: "Total Issued", width: 150, getValue: (row) => row.totalIssued },
    { key: "transactionCount", label: "Issue Slips", width: 130, getValue: (row) => row.transactionCount },
    {
      key: "lastIssueDate",
      label: "Last Issue Date",
      width: 160,
      getValue: (row) => row.lastIssueDate,
      render: (row) => formatDate(row.lastIssueDate),
    },
  ];

  const plumberBalanceColumns: ExcelColumn<PlumberBalanceRow>[] = [
    {
      key: "plumberName",
      label: "Plumber / Team",
      width: 180,
      sticky: true,
      grow: true,
      getValue: (row) => row.plumberName,
      render: (row) => <span className="font-semibold text-foreground">{row.plumberName}</span>,
    },
    { key: "materialName", label: "Material", width: 210, grow: true, getValue: (row) => row.materialName },
    { key: "source", label: "Source", width: 110, getValue: (row) => sourceLabel(row.source) },
    { key: "project", label: "Project", width: 180, getValue: (row) => projectLabelFromName(row.projectId, row.projectName) },
    { key: "issued", label: "Total Issued", width: 140, getValue: (row) => row.issued },
    { key: "consumed", label: "Consumed", width: 130, getValue: (row) => row.consumed },
    { key: "returned", label: "Returned", width: 130, getValue: (row) => row.returned },
    { key: "adjusted", label: "Adjusted", width: 120, getValue: (row) => row.adjusted },
    {
      key: "balance",
      label: "Balance With Plumber",
      width: 190,
      getValue: (row) => row.balance,
      render: (row) => <b>{row.balance}</b>,
    },
  ];

  return { stockColumns, transactionColumns, totalIssueColumns, plumberBalanceColumns };
}
