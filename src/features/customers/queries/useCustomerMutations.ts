import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customersApi } from "../api/customers.api";
import { customerKey, customersKey } from "./customer.query-keys";
import type { CompletionSectionKey, Customer, CustomerFormValues, LmcPipeSizeRecord } from "../types/customer.types";

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CustomerFormValues) => customersApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKey });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Customer created successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create customer"),
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CustomerFormValues) => customersApi.update(id, values),
    onSuccess: (updated: Customer) => {
      queryClient.invalidateQueries({ queryKey: customersKey });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.setQueryData(customerKey(id), updated);
      toast.success("Customer updated successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update customer"),
  });
}

/**
 * Atomic customer + LMC pipe-records save (see `customersApi.saveWithPipeRecords`).
 * Replaces the old create/update-then-loop-upsert sequence in `CustomerForm`'s
 * save handler with a single mutation call.
 */
export function useSaveCustomerWithPipeRecords(mode: "create" | "edit", id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ values, pipeRecords }: { values: CustomerFormValues; pipeRecords: LmcPipeSizeRecord[] }) =>
      customersApi.saveWithPipeRecords(mode, id, values, pipeRecords),
    onSuccess: (saved: Customer) => {
      queryClient.invalidateQueries({ queryKey: customersKey });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.setQueryData(customerKey(saved.id), saved);
      toast.success(mode === "edit" ? "Customer updated successfully" : "Customer created successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to save customer"),
  });
}

export function useSetSectionCompletion(id: string, sectionLabel: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionKey, completed }: { sectionKey: CompletionSectionKey; completed: boolean }) =>
      customersApi.setSectionCompletion(id, sectionKey, completed),
    onSuccess: (updated: Customer, { completed }) => {
      queryClient.setQueryData(customerKey(id), updated);
      queryClient.invalidateQueries({ queryKey: customersKey });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      // Admin dashboard "workflow metric" cards (e.g. GC Done) are computed
      // from the same progressMilestones/billing state via
      // dashboardStatsService.getAdminCounts - a separate cache namespace
      // from ["dashboard-stats"] above, so it needs its own invalidation.
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast.success(completed ? `${sectionLabel} marked complete.` : `${sectionLabel} reopened.`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update section completion"),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKey });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Customer deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete customer"),
  });
}

export function useUpsertLmcPipeRecord(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (record: LmcPipeSizeRecord) => customersApi.upsertLmcPipeRecord(customerId, record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKey(customerId) });
      toast.success("LMC record saved");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to save LMC record"),
  });
}
