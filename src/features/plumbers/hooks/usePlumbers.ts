import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { plumbersApi } from "../services/plumbers.service";
import type { PlumberFormValues } from "../types/plumber.types";
import { categoryLabel } from "../utils/plumber-label";

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
    onSuccess: (_, values) => {
      queryClient.invalidateQueries({ queryKey: plumbersKey });
      toast.success(`${categoryLabel(values.category)} added`);
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to create plumber"),
  });
}

export function useUpdatePlumber(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PlumberFormValues) => plumbersApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plumbersKey });
      toast.success("Saved");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to update plumber"),
  });
}

export function useDeletePlumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plumbersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plumbersKey });
      toast.success("Deleted");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete plumber"),
  });
}

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
      toast.success(`${result.count} deleted`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete plumbers"),
  });
}
