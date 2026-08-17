import { apiRequest } from "@/lib/api-client";
import type { Plumber, PlumberFormValues } from "../types/plumber.types";
import type { DeleteImpactResult } from "@/components/shared/delete-impact.types";

type BackendPlumber = {
  id: string;
  name: string;
  type: string;
  contactNumber: string | null;
  status: string;
  remarks: string | null;
  createdAt: string;
};

function mapPlumber(raw: BackendPlumber): Plumber {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type === "team" ? "team" : "individual",
    contactNumber: raw.contactNumber ?? "",
    status: raw.status === "inactive" ? "inactive" : "active",
    remarks: raw.remarks ?? "",
    createdAt: raw.createdAt,
  };
}

function mapPlumberFormToBody(values: PlumberFormValues) {
  return {
    name: values.name,
    type: values.type,
    contactNumber: values.contactNumber || undefined,
    status: values.status,
    remarks: values.remarks || undefined,
  };
}

export const plumbersApi = {
  async list(search?: string): Promise<Plumber[]> {
    const query = new URLSearchParams({ limit: "200" });
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
