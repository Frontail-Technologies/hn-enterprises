import { useMemo } from "react";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import type { MaterialSource } from "../types/material.types";
import { useMaterialsQuery, useStockBalancesQuery } from "./useMaterials";

/**
 * Data shared across the whole InventoryPage, not one specific tab:
 * - materials: the Stock tab's own dataset (always visible as the default tab)
 * - plumbers/projects: power the always-visible Inventory filter bar
 *   (genuine active selectors, not label-only joins - kept as full lists)
 * - stockBalances: already gated by `stockFiltered`, unchanged
 *
 * customers was removed entirely (R7/R8) - it was only ever used to build
 * a customerNameById label map, and every transaction row now carries
 * customerName server-joined (see materials.service.ts's listTransactions).
 */
export function useInventoryBaseData(params: {
  source?: MaterialSource;
  projectId?: string;
  stockFiltered: boolean;
}) {
  const { source, projectId, stockFiltered } = params;

  const { data: materials = [], isLoading: materialsLoading } = useMaterialsQuery();
  const { data: plumbers = [] } = usePlumbersQuery();
  const { data: projects = [] } = useProjectsQuery();
  const { data: stockBalances = [] } = useStockBalancesQuery({ source, projectId }, stockFiltered);

  const stockBalanceByMaterialId = useMemo(
    () => new Map(stockBalances.map((row) => [row.materialId, row.balance])),
    [stockBalances],
  );

  return {
    materials,
    materialsLoading,
    plumbers,
    projects,
    stockBalances,
    stockBalanceByMaterialId,
  };
}
