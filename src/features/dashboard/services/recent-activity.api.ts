import { apiRequestPaginated, type PaginationMeta } from "@/lib/api-client";

export type RecentActivityActor = {
  /** null when the account has been hard-deleted - name/role are then the immutable snapshot, not a live relation. */
  id: string | null;
  name: string;
  role: string | null;
  deleted: boolean;
};

export type RecentActivityCustomer = {
  id: string;
  name: string;
  trBpNumber: string | null;
};

export type RecentActivityProject = {
  id: string;
  name: string | null;
};

/** One normalized activity row - the backend already merged/sorted every source. */
export type RecentActivityRow = {
  id: string;
  type: string;
  action: string;
  title: string;
  description: string;
  actor: RecentActivityActor | null;
  onBehalfOf: { id: string | null; name: string | null } | null;
  customer: RecentActivityCustomer | null;
  project: RecentActivityProject | null;
  entityType: string;
  entityId: string;
  occurredAt: string;
  metadata: Record<string, unknown> | null;
};

export type RecentActivityListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "newest" | "oldest";
  type?: string;
  projectId?: string;
  customerId?: string;
  actorId?: string;
  from?: string;
  to?: string;
};

export const recentActivityApi = {
  async list(
    params: RecentActivityListParams = {},
  ): Promise<{ data: RecentActivityRow[]; pagination?: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.sort) query.set("sort", params.sort);
    if (params.type) query.set("type", params.type);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.customerId) query.set("customerId", params.customerId);
    if (params.actorId) query.set("actorId", params.actorId);
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    const { data, pagination } = await apiRequestPaginated<RecentActivityRow[]>(
      `/activity?${query.toString()}`,
    );
    return { data: data ?? [], pagination };
  },
};
