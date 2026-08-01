import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plumbersApi } from "../services/plumbers.service";
import type { PlumberFormValues } from "../types/plumber.types";

const plumbersKey = ["plumbers"] as const;

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
    },
  });
}

export function useUpdatePlumber(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PlumberFormValues) => plumbersApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plumbersKey });
    },
  });
}

export function useDeletePlumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plumbersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plumbersKey });
    },
  });
}
