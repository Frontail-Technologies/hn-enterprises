import { useQuery } from "@tanstack/react-query";
import { auditLogsApi } from "../services/audit-logs.service";

export function useAuditLogsQuery(params: { module?: string; projectId?: string } = {}) {
  return useQuery({
    queryKey: ["audit-logs", params.module ?? "all", params.projectId ?? "all"],
    queryFn: () => auditLogsApi.list(params),
  });
}
