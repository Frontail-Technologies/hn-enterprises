import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialsApi } from "../services/materials.service";
import type {
  CorrectMaterialTransactionInput,
  InventoryDetailTab,
  MaterialFormValues,
  MaterialSource,
  MaterialTransactionFormValues,
  MaterialTransactionType,
} from "../types/material.types";

const materialsKey = ["materials"] as const;
const materialKey = (id: string) => ["materials", id] as const;
const materialOverviewKey = (id: string) => ["materials", id, "overview"] as const;
const materialDetailTransactionsKey = (id: string, params: Record<string, string | number | undefined>) =>
  ["materials", id, "transactions", params] as const;
const materialPlumberLedgerKey = (id: string) => ["materials", id, "plumber-ledger"] as const;
const transactionsKey = (params: Record<string, string | undefined>) => ["materials", "transactions", params] as const;
const transactionsPageKey = (params: Record<string, string | number | undefined>) =>
  ["materials", "transactions", params] as const;
const plumberBalancesKey = (params: Record<string, string | undefined>) => ["materials", "plumber-balances", params] as const;
const stockBalancesKey = (params: Record<string, string | undefined>) => ["materials", "stock-balances", params] as const;
const totalIssueKey = (params: Record<string, string | undefined>) => ["materials", "total-issue", params] as const;
// Outside the ["materials"] prefix, so mutations must invalidate it
// explicitly - see useCreateMaterialTransaction/useReverseMaterialTransaction/useCorrectMaterialTransaction below.
const inventoryOverviewNamespace = ["inventory", "overview"] as const;
const inventoryOverviewKey = (params: Record<string, string | undefined>) => [...inventoryOverviewNamespace, params] as const;

export function useMaterialsQuery(search?: string) {
  return useQuery({
    queryKey: [...materialsKey, search ?? ""],
    queryFn: () => materialsApi.list(search),
  });
}

export function useMaterialQuery(id: string) {
  return useQuery({
    queryKey: materialKey(id),
    queryFn: () => materialsApi.get(id),
    enabled: Boolean(id),
  });
}

/** Material + all 5 stat totals in one request - the only query InventoryDetail needs on initial load. */
export function useMaterialOverviewQuery(id: string) {
  return useQuery({
    queryKey: materialOverviewKey(id),
    queryFn: () => materialsApi.getOverview(id),
    enabled: Boolean(id),
  });
}

/**
 * Tab-scoped, server-paginated transactions for InventoryDetail. Only fires
 * when `enabled` (the tab is actually active) - callers pass
 * `enabled: activeTab === "<tab>"`.
 */
export function useMaterialDetailTransactionsQuery(
  id: string,
  params: { tab: Exclude<InventoryDetailTab, "plumberLedger">; page?: number; limit?: number; from?: string; to?: string },
  enabled: boolean,
) {
  return useQuery({
    queryKey: materialDetailTransactionsKey(id, { tab: params.tab, page: params.page, limit: params.limit, from: params.from, to: params.to }),
    queryFn: () => materialsApi.listDetailTransactions(id, params),
    enabled: Boolean(id) && enabled,
    placeholderData: (previous) => previous,
  });
}

/**
 * Plumber ledger for InventoryDetail's Plumber Ledger tab - cleanly reuses
 * the existing plumber-balances endpoint (now with plumberName joined),
 * under its own cache key so it stays independently gated by `enabled`.
 */
export function useMaterialPlumberLedgerQuery(id: string, enabled: boolean) {
  return useQuery({
    queryKey: materialPlumberLedgerKey(id),
    queryFn: () => materialsApi.plumberBalances({ materialId: id }),
    enabled: Boolean(id) && enabled,
  });
}

/** InventoryPage's tab-count badges - one request, DB-side COUNT/GROUP BY, never the underlying rows. */
export function useInventoryOverviewQuery(
  params: { source?: MaterialSource; projectId?: string; plumberId?: string; from?: string; to?: string } = {},
) {
  return useQuery({
    queryKey: inventoryOverviewKey(params),
    queryFn: () => materialsApi.getInventoryOverview(params),
  });
}

/**
 * "Total Issue" tab - one row per material (server-grouped), only fetched
 * while that tab is active.
 */
export function useTotalIssueSummaryQuery(
  params: { source?: MaterialSource; projectId?: string; from?: string; to?: string },
  enabled: boolean,
) {
  return useQuery({
    queryKey: totalIssueKey(params),
    queryFn: () => materialsApi.totalIssueSummary(params),
    enabled,
  });
}

/** Whole-project per-material usage summary for ProjectDetail → Materials. */
export function useMaterialProjectUsageQuery(projectId: string) {
  return useQuery({
    queryKey: ["materials", "project-usage", projectId],
    queryFn: () => materialsApi.projectUsageSummary(projectId),
    enabled: Boolean(projectId),
  });
}

/**
 * Genuinely server-paginated, tab-scoped transactions for InventoryPage.
 * Only fires when `enabled` (that tab is active) - callers pass
 * `enabled` based on the current tab, and the query key changes per tab
 * (via `type`/`types` in params) so switching tabs reuses TanStack Query
 * cache instead of refetching every time.
 */
export function useInventoryTransactionsPageQuery(
  params: {
    type?: MaterialTransactionType;
    types?: MaterialTransactionType[];
    source?: MaterialSource;
    plumberId?: string;
    projectId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  },
  enabled: boolean,
) {
  return useQuery({
    queryKey: transactionsPageKey({
      type: params.type,
      types: params.types?.join(","),
      source: params.source,
      plumberId: params.plumberId,
      projectId: params.projectId,
      from: params.from,
      to: params.to,
      page: params.page,
      limit: params.limit,
    }),
    queryFn: () => materialsApi.listTransactionsPage(params),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MaterialFormValues) => materialsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKey });
      toast.success("Material created successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create material"),
  });
}

export function useUpdateMaterial(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<MaterialFormValues>) => materialsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKey });
      queryClient.invalidateQueries({ queryKey: materialKey(id) });
      toast.success("Material updated successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update material"),
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materialsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKey });
      toast.success("Material deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete material"),
  });
}

export function useMaterialDeleteImpactQuery(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...materialKey(id), "delete-impact"],
    queryFn: () => materialsApi.getDeleteImpact(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 0,
  });
}

export function useMaterialTransactionsQuery(
  params: {
    materialId?: string;
    type?: MaterialTransactionType;
    source?: MaterialSource;
    plumberId?: string;
    siteId?: string;
    customerId?: string;
    projectId?: string;
    from?: string;
    to?: string;
  } = {},
) {
  return useQuery({
    queryKey: transactionsKey(params),
    queryFn: () => materialsApi.listTransactions(params),
  });
}

export function useCreateMaterialTransaction(type: MaterialTransactionType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: MaterialTransactionFormValues) => materialsApi.createTransaction(type, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKey });
      queryClient.invalidateQueries({ queryKey: ["materials", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "plumber-balances"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "total-issue"] });
      // Outside the "materials" namespace - invalidated explicitly.
      queryClient.invalidateQueries({ queryKey: inventoryOverviewNamespace });
      toast.success(`${type === "purchase" ? "Purchase" : type === "issue" ? "Issue" : "Transaction"} recorded`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to record transaction"),
  });
}

export function usePlumberBalancesQuery(
  params: { plumberId?: string; materialId?: string; source?: MaterialSource; projectId?: string } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: plumberBalancesKey(params),
    queryFn: () => materialsApi.plumberBalances(params),
    enabled,
  });
}

export function useStockBalancesQuery(
  params: { materialId?: string; source?: MaterialSource; projectId?: string } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: stockBalancesKey(params),
    queryFn: () => materialsApi.stockBalances(params),
    enabled,
  });
}

export function useReverseMaterialTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => materialsApi.reverseTransaction(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKey });
      queryClient.invalidateQueries({ queryKey: ["materials", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "plumber-balances"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "stock-balances"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "total-issue"] });
      queryClient.invalidateQueries({ queryKey: inventoryOverviewNamespace });
      toast.success("Transaction reversed");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to reverse transaction"),
  });
}

export function useCorrectMaterialTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CorrectMaterialTransactionInput }) =>
      materialsApi.correctTransaction(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKey });
      queryClient.invalidateQueries({ queryKey: ["materials", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "plumber-balances"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "stock-balances"] });
      queryClient.invalidateQueries({ queryKey: ["materials", "total-issue"] });
      queryClient.invalidateQueries({ queryKey: inventoryOverviewNamespace });
      toast.success("Transaction corrected");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to correct transaction"),
  });
}
