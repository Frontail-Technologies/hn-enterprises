import { useQuery } from "@tanstack/react-query";
import { workProgressApi } from "../services/work-progress.service";

export function useWorkProgressListQuery(params: { customerId?: string; supervisorId?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ["work-progress", params],
    queryFn: () => workProgressApi.list(params),
  });
}

export function useWorkProgressQueueQuery(
  params: { projectId?: string; siteId?: string; search?: string } = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["work-progress", "queue", params],
    queryFn: () => workProgressApi.listQueue(params),
    enabled: options.enabled ?? true,
  });
}
