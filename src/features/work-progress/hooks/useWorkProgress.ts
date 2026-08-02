import { useQuery } from "@tanstack/react-query";
import { workProgressApi } from "../services/work-progress.service";

export function useWorkProgressListQuery(params: { customerId?: string; supervisorId?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ["work-progress", params],
    queryFn: () => workProgressApi.list(params),
  });
}
