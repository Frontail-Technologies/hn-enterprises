import { apiRequest } from "@/lib/api-client";
import type { Plumber, PlumberFormValues } from "../types/plumber.types";
import type { DeleteImpactResult } from "@/components/shared/delete-impact.types";

type BackendPlumber = {
  id: string;
  name: string;
  category?: string;
  type: string;
  contactNumber: string | null;
  avatarUrl?: string | null;
  status: string;
  remarks: string | null;
  createdAt: string;
  projectNames?: string[] | null;
};

function mapPlumber(raw: BackendPlumber): Plumber {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category === "labour" ? "labour" : "plumber",
    type: raw.type === "team" ? "team" : "individual",
    contactNumber: raw.contactNumber ?? "",
    avatarUrl: raw.avatarUrl ?? "",
    status: raw.status === "inactive" ? "inactive" : "active",
    remarks: raw.remarks ?? "",
    createdAt: raw.createdAt,
    projectNames: raw.projectNames ?? [],
  };
}

function mapPlumberFormToBody(values: PlumberFormValues) {
  return {
    name: values.name,
    category: values.category,
    type: values.type,
    contactNumber: values.contactNumber || undefined,
    // Sent as-is so "" can remove the photo.
    avatarUrl: values.avatarUrl,
    status: values.status,
    remarks: values.remarks || undefined,
  };
}

export const plumbersApi = {
  async list(search?: string): Promise<Plumber[]> {
    const query = new URLSearchParams({ limit: "1000" });
    if (search) query.set("search", search);
    const rows = await apiRequest<BackendPlumber[]>(`/plumbers?${query.toString()}`);
    return rows.map(mapPlumber);
  },

  async create(values: PlumberFormValues): Promise<Plumber> {
    const raw = await apiRequest<BackendPlumber>("/plumbers", {
      method: "POST",
      body: JSON.stringify(mapPlumberFormToBody(values)),
    });
    return mapPlumber(raw);
  },

  async update(id: string, values: PlumberFormValues): Promise<Plumber> {
    const raw = await apiRequest<BackendPlumber>(`/plumbers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(mapPlumberFormToBody(values)),
    });
    return mapPlumber(raw);
  },

  async remove(id: string): Promise<void> {
    await apiRequest<null>(`/plumbers/${id}`, { method: "DELETE" });
  },

  async getDeleteImpact(id: string): Promise<DeleteImpactResult> {
    return apiRequest<DeleteImpactResult>(`/plumbers/${id}/delete-impact`);
  },

  async bulkRemove(ids: string[]): Promise<{ count: number }> {
    return apiRequest<{ count: number }>("/plumbers/bulk/delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },
};
