import { apiRequest } from "@/lib/api-client";

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
  user: { id: string; name: string } | null;
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
    user: raw.user?.name ?? "System",
    action: formatAction(raw.action),
    module: raw.module,
    description: raw.description ?? "",
    dateTime: raw.createdAt,
    device: userAgent || "-",
  };
}

export const auditLogsApi = {
  async list(params: { module?: string } = {}): Promise<AuditLog[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.module) query.set("module", params.module);
    const rows = await apiRequest<BackendAuditLog[]>(`/audit-logs?${query.toString()}`);
    return rows.map(mapAuditLog);
  },
};
