"use client";

import { useMemo } from "react";
import type { ListColumn } from "@/components/shared/list";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useMaterialsQuery } from "@/features/commercial/hooks/useMaterials";
import type { Material } from "@/features/commercial/types/material.types";
import { getAdminSummaryStatDefinition } from "@/features/dashboard/services/dashboard-summary-stats.service";
import { SummaryStatShell } from "../SummaryStatShell";

const columns: ListColumn<Material>[] = [
  { id: "name", header: "Item Name", width: 230, isTitle: true, hideable: false, sortable: true, columnFilter: true, value: (row) => row.name },
  { id: "category", header: "Category", width: 150, sortable: true, columnFilter: true, value: (row) => row.category },
  { id: "unit", header: "Unit", width: 90, sortable: true, columnFilter: true, value: (row) => row.unit },
  { id: "currentBalance", header: "Current Balance", width: 150, align: "end", sortable: true, columnFilter: true, value: (row) => row.currentBalance },
  { id: "reorderLevel", header: "Reorder Level", width: 140, align: "end", sortable: true, columnFilter: true, value: (row) => row.reorderLevel },
  { id: "status", header: "Status", width: 140, sortable: true, columnFilter: true, value: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
];

export function StockAlertsSummaryDetail() {
  const { data: materials = [], isLoading, isError, refetch } = useMaterialsQuery();
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
      isError={isError}
      onRetry={() => void refetch()}
      emptyIllustration="allClear"
      emptyTitle="No materials are low or out of stock"
    />
  );
}
