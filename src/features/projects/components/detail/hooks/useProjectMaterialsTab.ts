import {
  useInventoryTransactionsPageQuery,
  useMaterialProjectUsageQuery,
} from "@/features/commercial/hooks/useMaterials";

const MOVEMENTS_PAGE_SIZE = 50;

export function useProjectMaterialsTab(projectId: string, page: number) {
  // Whole-project per-material totals - a real server GROUP BY, not a fold
  // over a capped transaction page.
  const { data: perMaterial = [], isLoading: summaryLoading } = useMaterialProjectUsageQuery(projectId);

  // "Recent Movements" - real server pagination.
  const { data: movementsResult, isLoading: movementsLoading } = useInventoryTransactionsPageQuery(
    { projectId, page, limit: MOVEMENTS_PAGE_SIZE },
    Boolean(projectId),
  );

  return {
    perMaterial,
    transactions: movementsResult?.rows ?? [],
    movementsPagination: movementsResult?.pagination,
    isLoading: summaryLoading || movementsLoading,
  };
}
