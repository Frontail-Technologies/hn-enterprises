import { useQuery } from "@tanstack/react-query";
import { auditLogsApi } from "../services/audit-logs.service";

export function useAuditLogsQuery(module?: string) {
  return useQuery({
    queryKey: ["audit-logs", module ?? "all"],
    queryFn: () => auditLogsApi.list({ module }),
  });
}
