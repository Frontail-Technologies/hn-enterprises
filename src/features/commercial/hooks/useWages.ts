import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { wagesApi } from "../services/wages.service";
import type { WageFormValues, WageStatus } from "../types/wage.types";

const wagesKey = ["wages"] as const;

export function useWagesQuery(params: { month?: string; plumberId?: string; status?: WageStatus } = {}) {
  return useQuery({
    queryKey: [...wagesKey, params],
    queryFn: () => wagesApi.list(params),
  });
}

export function useUpsertWage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: WageFormValues) => wagesApi.upsert(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wagesKey });
      toast.success("Wage updated successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to update wage"),
  });
}

export function useDeleteWage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wagesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wagesKey });
      toast.success("Wage record deleted");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete wage record"),
  });
}
