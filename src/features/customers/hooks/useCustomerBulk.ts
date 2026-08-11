import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customersBulkApi } from "../services/customers-bulk.service";
import type { CustomerBulkChanges } from "../types/customer-bulk.types";

const customersKey = ["customers"] as const;

export function useBulkUpdateCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, changes }: { ids: string[]; changes: CustomerBulkChanges; successMessage?: string }) =>
      customersBulkApi.update(ids, changes),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: customersKey });
      toast.success(variables.successMessage ?? `${result.count} customer record${result.count === 1 ? "" : "s"} updated.`);
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to update customers"),
  });
}

export function useBulkRemarkCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, note }: { ids: string[]; note: string }) => customersBulkApi.remark(ids, note),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: customersKey });
      toast.success(`Remark added to ${result.count} customer${result.count === 1 ? "" : "s"}`);
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to add remark"),
  });
}

export function useBulkDeleteCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => customersBulkApi.remove(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: customersKey });
      toast.success(`${result.count} customer${result.count === 1 ? "" : "s"} deleted`);
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to delete customers"),
  });
}
