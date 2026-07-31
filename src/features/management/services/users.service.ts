import { apiRequest } from "@/lib/api-client";

export type RosterUser = {
  id: string;
  name: string;
  role: string;
  status: string;
};

export const usersApi = {
  async list(params: { role?: string } = {}): Promise<RosterUser[]> {
    const query = new URLSearchParams();
    if (params.role) query.set("role", params.role);
    const qs = query.toString();
    return apiRequest<RosterUser[]>(`/users${qs ? `?${qs}` : ""}`);
  },
};
