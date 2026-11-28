import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { ReportFilters } from "../types";
import { reportQueryString, type ProgressStageKey } from "./progress.service";

export type PeopleReportPerson = {
  id: string;
  name: string;
  category: "plumber" | "labour";
  status: string;
  projectNames: string[];
  assignedCustomers: number;
  stagesDone: number;
  stages: Record<ProgressStageKey, number> | null;
  materialEntries: number;
  daysWorked: number;
  netWages: number;
};

export type PeopleReportMaterial = {
  plumberId: string;
  plumberName: string;
  materialId: string;
  materialName: string;
  unit: string;
  issued: number;
  consumed: number;
  returned: number;
  adjusted: number;
  net: number;
};

export type PeopleReportData = {
  from: string;
  to: string;
  months: string[];
  stages: { key: ProgressStageKey; label: string }[];
  people: PeopleReportPerson[];
  materials: PeopleReportMaterial[];
};

export function usePeopleReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "people", filters],
    queryFn: () => apiRequest<PeopleReportData>(`/reports/people?${reportQueryString(filters)}`),
    enabled: Boolean(filters.from && filters.to && filters.from <= filters.to),
  });
}
