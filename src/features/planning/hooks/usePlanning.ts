import { useQuery } from "@tanstack/react-query";
import { planningApi } from "../services/planning.service";

type ListParams = {
  projectId?: string;
  siteId?: string;
  supervisorId?: string;
  customerId?: string;
  date?: string;
  from?: string;
  to?: string;
};

export function useSitePlansQuery(params: ListParams) {
  return useQuery({
    queryKey: ["site-plans", params],
    queryFn: () => planningApi.listSitePlans(params),
  });
}

export function useDprRecordsQuery(params: ListParams) {
  return useQuery({
    queryKey: ["dpr-records", params],
    queryFn: () => planningApi.listDprRecords(params),
  });
}
