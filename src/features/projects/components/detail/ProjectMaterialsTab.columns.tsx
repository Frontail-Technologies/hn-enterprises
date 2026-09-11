import type { ColumnDef } from "@/components/shared/DataTable";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { formatDate as formatMoneyDate } from "@/features/commercial/utils/format";
import type { MaterialTransaction, ProjectMaterialUsageRow } from "@/features/commercial/types/material.types";

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  purchase: "Purchase",
  pbg_issue: "PBG Issue",
  pbg_consumption: "PBG Consumption",
  issue: "Issue",
  return: "Return",
  adjustment: "Adjustment",
  consumption: "Consumption",
};

export const materialsSummaryColumns: ColumnDef<ProjectMaterialUsageRow>[] = [
  { key: "name", header: "Material" },
  { key: "issued", header: "Issued" },
  { key: "consumed", header: "Consumed" },
  { key: "returned", header: "Returned" },
  { key: "net", header: "Project Usage", render: (row) => row.issued - row.consumed - row.returned },
];

export function buildMaterialTransactionColumns(): ExcelColumn<MaterialTransaction>[] {
  return [
    {
      key: "material",
      label: "Material",
      width: 190,
      sticky: true,
      getValue: (row) => row.materialName || "Unknown material",
    },
    {
      key: "type",
      label: "Type",
      width: 150,
      getValue: (row) => TRANSACTION_TYPE_LABELS[row.type] ?? row.type,
    },
    { key: "quantity", label: "Quantity", width: 110, getValue: (row) => row.quantity },
    { key: "site", label: "Site", width: 150, getValue: (row) => row.address || "-" },
    { key: "date", label: "Date", width: 140, getValue: (row) => formatMoneyDate(row.transactionDate) },
    { key: "vendor", label: "Vendor", width: 170, getValue: (row) => row.vendorName || "-" },
    { key: "remarks", label: "Remarks", width: 220, getValue: (row) => row.remarks || "-" },
  ];
}
