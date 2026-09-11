import type { DashboardOverviewParams } from "@/features/dashboard/model/dashboard-overview.types";

export const dashboardQueryKeys = {
  overview: (params: DashboardOverviewParams) => ["dashboard", "overview", params] as const,
};
