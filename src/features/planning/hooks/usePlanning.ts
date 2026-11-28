import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buildDprByKey } from "../model/planning-entry.rules";
import { planningApi, type DprRecordUpdate, type SitePlanUpdate } from "../services/planning.service";
import type { SitePlan } from "../types/planning.types";

type ListParams = {
  projectId?: string;
  siteId?: string;
  supervisorId?: string;
  customerId?: string;
  date?: string;
  from?: string;
  to?: string;
  /** Plans: "submitted" | "approved" | "sent_back". DPRs: "draft" | "submitted" | "approved". */
  status?: string;
};

export function useSitePlansQuery(params: ListParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["site-plans", params],
    queryFn: () => planningApi.listSitePlans(params),
    enabled: options.enabled,
  });
}

export function useDprRecordsQuery(params: ListParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["dpr-records", params],
    queryFn: () => planningApi.listDprRecords(params),
    enabled: options.enabled,
  });
}

/**
 * DPRs for the days a list of plans covers, keyed with the date - for plan
 * lists that span several days (each plan's DPR progress pill).
 */
export function useDprByPlanDates(plans: SitePlan[], filters: { projectId?: string; supervisorId?: string }, enabled = true) {
  const dates = plans.map((plan) => plan.date).filter(Boolean).sort();
  const from = dates[0];
  const to = dates[dates.length - 1];
  const { data } = useDprRecordsQuery({ ...filters, from, to }, { enabled: enabled && Boolean(from) });
  return useMemo(() => buildDprByKey(data ?? [], true), [data]);
}

function useInvalidatePlanning() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["site-plans"] });
    void queryClient.invalidateQueries({ queryKey: ["dpr-records"] });
    void queryClient.invalidateQueries({ queryKey: ["projects"] });
  };
}

/** Approve submitted plans, or send them back with a reason. */
export function useReviewPlans() {
  const invalidate = useInvalidatePlanning();
  return useMutation({
    mutationFn: ({ ids, action, note }: { ids: string[]; action: "approve" | "reject"; note?: string }) =>
      planningApi.reviewSitePlans(ids, action, note),
    onSuccess: (result, variables) => {
      invalidate();
      const verb = variables.action === "approve" ? "approved" : "sent back";
      toast.success(`${result.updated} plan${result.updated === 1 ? "" : "s"} ${verb}${result.skipped ? ` (${result.skipped} skipped - not submitted)` : ""}`);
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't update the plan"),
  });
}

export function useUpdatePlan() {
  const invalidate = useInvalidatePlanning();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SitePlanUpdate }) => planningApi.updateSitePlan(id, input),
    onSuccess: () => {
      invalidate();
      toast.success("Plan saved");
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't save the plan"),
  });
}

export function useDeletePlan() {
  const invalidate = useInvalidatePlanning();
  return useMutation({
    mutationFn: (id: string) => planningApi.deleteSitePlan(id),
    onSuccess: () => {
      invalidate();
      toast.success("Plan moved to the recycle bin");
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't delete the plan"),
  });
}

export function useUpdateDpr() {
  const invalidate = useInvalidatePlanning();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DprRecordUpdate }) => planningApi.updateDprRecord(id, input),
    onSuccess: () => {
      invalidate();
      toast.success("DPR saved");
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't save the DPR"),
  });
}

export function useDeleteDpr() {
  const invalidate = useInvalidatePlanning();
  return useMutation({
    mutationFn: (id: string) => planningApi.deleteDprRecord(id),
    onSuccess: () => {
      invalidate();
      toast.success("DPR moved to the recycle bin");
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't delete the DPR"),
  });
}
