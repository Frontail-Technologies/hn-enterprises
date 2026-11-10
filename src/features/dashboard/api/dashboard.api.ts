import { apiRequest } from "@/lib/api-client";
import type { DashboardChartsResponse, DashboardOverviewParams, DashboardOverviewResponse } from "@/features/dashboard/model/dashboard-overview.types";

function toQuery(params: DashboardOverviewParams) {
  const query = new URLSearchParams();
  if (params.projectId && params.projectId !== "all") query.append("projectId", params.projectId);
  query.append("period", params.period);
  if (params.month) query.append("month", params.month);
  if (params.year) query.append("year", params.year);
  return query.toString();
}

export const dashboardApi = {
  getOverview(params: DashboardOverviewParams) {
    const query = new URLSearchParams();
    if (params.projectId && params.projectId !== "all") query.append("projectId", params.projectId);
    query.append("period", params.period);
    if (params.month) query.append("month", params.month);
    if (params.year) query.append("year", params.year);

    return apiRequest<DashboardOverviewResponse>(`/dashboard/overview?${query.toString()}`);
  },

  getCharts(params: DashboardOverviewParams) {
    return apiRequest<DashboardChartsResponse>(`/dashboard/charts?${toQuery(params)}`);
  },
};
