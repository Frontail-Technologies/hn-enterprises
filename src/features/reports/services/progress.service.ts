import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { ReportFilters } from "../types";

export type ProgressStageKey =
  | "survey"
  | "gi"
  | "gc"
  | "laying"
  | "testing"
  | "valveChamber"
  | "preCommissioning"
  | "connection"
  | "commissioning"
  | "conversion"
  | "jmr";

export type StageCounts = Record<ProgressStageKey, number>;

export type ProgressReportData = {
  from: string;
  to: string;
  stages: { key: ProgressStageKey; label: string; dated: boolean }[];
  totalCustomers: number;
  periodTotals: StageCounts;
  doneSoFar: StageCounts;
  daily: ({ date: string } & StageCounts)[];
  byProject: { projectId: string | null; projectName: string; customers: number; counts: StageCounts }[];
  bySupervisor: { supervisorId: string | null; name: string; total: number; stages: Record<string, number> }[];
};

export function reportQueryString(filters: ReportFilters) {
  const query = new URLSearchParams({ from: filters.from, to: filters.to });
  if (filters.projectId) query.set("projectId", filters.projectId);
  return query.toString();
}

export function useProgressReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "progress", filters],
    queryFn: () => apiRequest<ProgressReportData>(`/reports/progress?${reportQueryString(filters)}`),
    enabled: Boolean(filters.from && filters.to && filters.from <= filters.to),
  });
}
