import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { planningApi } from "../services/planning.service";

type ListParams = {
  projectId?: string;
  siteId?: string;
  supervisorId?: string;
  customerId?: string;
  date?: string;
  from?: string;
  to?: string;
  /** "draft" | "submitted" | "approved" */
  status?: string;
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

export function useReviewDpr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, action, note }: { ids: string[]; action: "approve" | "reject"; note?: string }) =>
      planningApi.reviewDprRecords(ids, action, note),
    onSuccess: (result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["dpr-records"] });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      const verb = variables.action === "approve" ? "approved" : "sent back";
      toast.success(`${result.updated} DPR${result.updated === 1 ? "" : "s"} ${verb}${result.skipped ? ` (${result.skipped} skipped - not submitted)` : ""}`);
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't update the DPR"),
  });
}
