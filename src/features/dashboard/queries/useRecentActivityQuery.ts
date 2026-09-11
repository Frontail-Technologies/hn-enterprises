import { useQuery } from "@tanstack/react-query";
import { recentActivityApi, type RecentActivityListParams } from "../services/recent-activity.api";

export const recentActivityKey = ["activity"] as const;

/**
 * Single source for the Recent Activity feed - replaces the old 4-query
 * (work-progress + DPR + payments + audit-logs) client-side merge/sort.
 * Keeps the previous page visible while the next one loads.
 */
export function useRecentActivityQuery(params: RecentActivityListParams) {
  return useQuery({
    queryKey: [...recentActivityKey, params],
    queryFn: () => recentActivityApi.list(params),
    placeholderData: (previous) => previous,
  });
}
