import { apiRequest, apiRequestPaginated, type PaginationMeta } from "@/lib/api-client";

export type AuditLog = {
  id: string;
  user: string;
  action: string;
  module: string;
  description: string;
  dateTime: string;
  device: string;
};

type BackendAuditLog = {
  id: string;
  module: string;
  action: string;
  recordId: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  /** null only for a genuine system/no-actor action - a deleted user's row still carries its name snapshot with deleted:true. */
  user: { id: string | null; name: string; role: string | null; deleted: boolean } | null;
};

function formatAction(action: string) {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function mapAuditLog(raw: BackendAuditLog): AuditLog {
  const userAgent = typeof raw.metadata?.userAgent === "string" ? raw.metadata.userAgent : "";
  return {
    id: raw.id,
    user: raw.user ? (raw.user.deleted ? `${raw.user.name} (Deleted)` : raw.user.name) : "System",
    action: formatAction(raw.action),
    module: raw.module,
    description: raw.description ?? "",
    dateTime: raw.createdAt,
    device: userAgent || "-",
  };
}

export type AuditLogListParams = { module?: string; projectId?: string; search?: string };

export const auditLogsApi = {
  async list(params: AuditLogListParams = {}): Promise<AuditLog[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.module) query.set("module", params.module);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.search) query.set("search", params.search);
    const rows = await apiRequest<BackendAuditLog[]>(`/audit-logs?${query.toString()}`);
    return rows.map(mapAuditLog);
  },

  /** Real server pagination for the Audit Logs screen; list() above stays for the scoped Project Activity tab. */
  async listPage(
    params: AuditLogListParams & { page?: number; limit?: number } = {},
  ): Promise<{ data: AuditLog[]; pagination?: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.module) query.set("module", params.module);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    const { data, pagination } = await apiRequestPaginated<BackendAuditLog[]>(`/audit-logs?${query.toString()}`);
    return { data: (data ?? []).map(mapAuditLog), pagination };
  },

  async modules(): Promise<string[]> {
    return apiRequest<string[]>("/audit-logs/modules");
  },
};
