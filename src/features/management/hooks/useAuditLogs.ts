import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { auditLogsApi, type AuditLogListParams } from "../services/audit-logs.service";

export function useAuditLogsQuery(params: AuditLogListParams = {}) {
  return useQuery({
    queryKey: ["audit-logs", params.module ?? "all", params.projectId ?? "all", params.search ?? ""],
    queryFn: () => auditLogsApi.list(params),
  });
}

/** Paginated Audit Logs list - keeps the previous page while the next loads. */
export function useAuditLogsPageQuery(params: AuditLogListParams & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["audit-logs", "list", params],
    queryFn: () => auditLogsApi.listPage(params),
    placeholderData: keepPreviousData,
  });
}

/** Distinct module names for the filter dropdown. */
export function useAuditLogModulesQuery() {
  return useQuery({
    queryKey: ["audit-logs", "modules"],
    queryFn: () => auditLogsApi.modules(),
    staleTime: 5 * 60_000,
  });
}
