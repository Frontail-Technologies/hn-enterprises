import { apiRequest } from "@/lib/api-client";
import type { DashboardOverviewParams, DashboardOverviewResponse } from "@/features/dashboard/model/dashboard-overview.types";

export const dashboardApi = {
  getOverview(params: DashboardOverviewParams) {
    const query = new URLSearchParams();
    if (params.projectId && params.projectId !== "all") query.append("projectId", params.projectId);
    query.append("period", params.period);
    if (params.month) query.append("month", params.month);
    if (params.year) query.append("year", params.year);

    return apiRequest<DashboardOverviewResponse>(`/dashboard/overview?${query.toString()}`);
  },
};
