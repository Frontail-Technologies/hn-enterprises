import type { QueryClient } from "@tanstack/react-query";
import type { DashboardOverviewResponse } from "@/features/dashboard/model/dashboard-overview.types";
import type { DashboardStatKey } from "@/features/dashboard/services/dashboard-stats.service";

function normalize(value: string | undefined) {
  return !value || value === "all" ? undefined : value;
}

function hrefMatchesFilters(href: string | undefined, projectId: string | undefined, city: string | undefined) {
  if (!href) return false;
  const query = href.includes("?") ? new URLSearchParams(href.split("?")[1]) : new URLSearchParams();
  return normalize(query.get("projectId") ?? undefined) === projectId && normalize(query.get("city") ?? undefined) === city;
}

export function findTrustedZeroCount(
  queryClient: QueryClient,
  statKey: DashboardStatKey,
  projectId: string | undefined,
  city: string | undefined,
): boolean {
  const normalizedProjectId = normalize(projectId);
  const normalizedCity = normalize(city);
  const cachedOverviews = queryClient.getQueriesData<DashboardOverviewResponse>({ queryKey: ["dashboard", "overview"] });

  for (const [, data] of cachedOverviews) {
    if (!data) continue;
    const metric = data.metrics.find((item) => item.id === statKey);
    if (!metric) continue;
    if (!hrefMatchesFilters(metric.href, normalizedProjectId, normalizedCity)) continue;
    const numericValue = Number(metric.value.replace(/,/g, ""));
    if (Number.isFinite(numericValue) && numericValue === 0) return true;
  }

  return false;
}
