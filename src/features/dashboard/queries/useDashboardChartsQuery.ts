import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/features/dashboard/api/dashboard.api";
import { dashboardQueryKeys } from "@/features/dashboard/queries/dashboard.query-keys";
import type { DashboardOverviewParams } from "@/features/dashboard/model/dashboard-overview.types";

export function useDashboardChartsQuery(params: DashboardOverviewParams) {
  return useQuery({
    queryKey: dashboardQueryKeys.charts(params),
    queryFn: () => dashboardApi.getCharts(params),
    placeholderData: (previousData) => previousData,
  });
}
