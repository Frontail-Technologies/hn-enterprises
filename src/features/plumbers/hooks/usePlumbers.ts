import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { plumbersApi } from "../services/plumbers.service";
import type { PlumberFormValues } from "../types/plumber.types";

const plumbersKey = ["plumbers"] as const;
const plumberKey = (id: string) => ["plumbers", id] as const;

export function usePlumbersQuery(search?: string) {
  return useQuery({
    queryKey: [...plumbersKey, search ?? ""],
    queryFn: () => plumbersApi.list(search),
  });
}

export function useCreatePlumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PlumberFormValues) => plumbersApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plumbersKey });
      toast.success("Plumber created successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to create plumber"),
  });
}

export function useUpdatePlumber(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PlumberFormValues) => plumbersApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plumbersKey });
      toast.success("Plumber updated successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to update plumber"),
  });
}

export function useDeletePlumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plumbersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plumbersKey });
      toast.success("Plumber deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete plumber"),
  });
}

// Only fetched while the delete dialog is open - matches the Projects delete-impact pattern.
export function usePlumberDeleteImpactQuery(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...plumberKey(id), "delete-impact"],
    queryFn: () => plumbersApi.getDeleteImpact(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 0,
  });
}

export function useBulkDeletePlumbers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => plumbersApi.bulkRemove(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: plumbersKey });
      toast.success(`${result.count} plumber${result.count === 1 ? "" : "s"} deleted`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete plumbers"),
  });
}
