import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialsApi } from "../services/materials.service";
import type {
  CorrectMaterialTransactionInput,
  MaterialFormValues,
  MaterialSource,
  MaterialTransactionFormValues,
  MaterialTransactionType,
} from "../types/material.types";

const materialsKey = ["materials"] as const;
const materialKey = (id: string) => ["materials", id] as const;
const transactionsKey = (params: Record<string, string | undefined>) => ["materials", "transactions", params] as const;
const plumberBalancesKey = (params: Record<string, string | undefined>) => ["materials", "plumber-balances", params] as const;
const stockBalancesKey = (params: Record<string, string | undefined>) => ["materials", "stock-balances", params] as const;

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

// Only fetched while the delete dialog is open - matches the Projects delete-impact pattern.
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
      toast.success(`${type === "purchase" ? "Purchase" : type === "issue" ? "Issue" : "Transaction"} recorded`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to record transaction"),
  });
}

export function usePlumberBalancesQuery(
  params: { plumberId?: string; materialId?: string; source?: MaterialSource; projectId?: string } = {},
) {
  return useQuery({
    queryKey: plumberBalancesKey(params),
    queryFn: () => materialsApi.plumberBalances(params),
  });
}

// Only used when a Project or Source filter narrows the Stock Sheet (§3) - the "All
// Projects + All Sources" view reads materials.currentBalance directly instead.
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
      toast.success("Transaction corrected");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to correct transaction"),
  });
}
