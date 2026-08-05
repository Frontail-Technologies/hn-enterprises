import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";

export type AdminDashboardStats = {
  "total-customers": number;
  "survey-done": number;
  "gi-done": number;
  "gc-done": number;
  "conversion-done": number;
  "jmr-done": number;
  "gi-bill-done": number;
  "gc-bill-done": number;
  "conversion-bill-done": number;
  "total-pbg-assignment": number;
  "connection-remark": number;
};

export function useDashboardStatsQuery(params: { projectId?: string; city?: string } = {}) {
  const query = new URLSearchParams();
  if (params.projectId && params.projectId !== "all") query.append("projectId", params.projectId);
  if (params.city && params.city !== "all") query.append("city", params.city);

  return useQuery({
    queryKey: ["dashboard-stats", params],
    queryFn: () => apiRequest<AdminDashboardStats>(`/stats/admin-summary?${query.toString()}`),
  });
}
