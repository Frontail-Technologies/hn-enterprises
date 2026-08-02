import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    },
  });
}
