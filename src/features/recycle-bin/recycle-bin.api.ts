import { apiRequest } from "@/lib/api-client";

export type RecycleBinItem = {
  id: string;
  entityType: string;
  entityId: string;
  label: string;
  trBpNumber: string | null;
  projectName: string | null;
  deletedAt: string;
  expiresAt: string;
  deletedByName: string | null;
  /** Rows deleted with it, by table (complaints, customer_notes, ...). */
  related: Record<string, number>;
};

export const recycleBinApi = {
  list: () => apiRequest<RecycleBinItem[]>("/recycle-bin"),
  restore: (id: string) => apiRequest<{ label: string; entityId: string }>(`/recycle-bin/${id}/restore`, { method: "POST" }),
  purge: (id: string) => apiRequest<{ label: string }>(`/recycle-bin/${id}`, { method: "DELETE" }),
};
