"use client";

import { useMemo } from "react";
import type { ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useMaterialsQuery } from "@/features/commercial/hooks/useMaterials";
import type { Material } from "@/features/commercial/types/material.types";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

const columns: ExcelColumn<Material>[] = [
  {
    key: "name",
    label: "Item Name",
    width: 230,
    sticky: true,
    getValue: (row) => row.name,
  },
  { key: "category", label: "Category", width: 150, getValue: (row) => row.category },
  { key: "unit", label: "Unit", width: 90, getValue: (row) => row.unit },
  { key: "currentBalance", label: "Current Balance", width: 150, getValue: (row) => row.currentBalance },
  { key: "reorderLevel", label: "Reorder Level", width: 140, getValue: (row) => row.reorderLevel },
  {
    key: "status",
    label: "Status",
    width: 140,
    getValue: (row) => row.status,
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function StockAlertsSummaryDetail() {
  const { data: materials = [], isLoading } = useMaterialsQuery();
  const rows = useMemo(
    () => materials.filter((material) => ["Low Stock", "Out of Stock"].includes(material.status)),
    [materials],
  );

  return (
    <SummaryStatShell
      title={getAdminSummaryStatDefinition("stock-alerts").title}
      searchPlaceholder="Search materials..."
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyTitle="No materials are low or out of stock"
    />
  );
}
