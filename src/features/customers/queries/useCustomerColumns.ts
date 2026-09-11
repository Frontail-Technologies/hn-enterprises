import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customersApi } from "../api/customers.api";
import { customerColumnsKey } from "./customer.query-keys";
import type { ColumnPreferenceEntry } from "../config/customer-columns";

export function useCustomerColumnsQuery() {
  return useQuery({
    queryKey: customerColumnsKey,
    queryFn: () => customersApi.getColumns(),
    staleTime: 0,
  });
}

export function useSaveCustomerColumns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (columns: ColumnPreferenceEntry[]) => customersApi.saveColumns(columns),
    onSuccess: (resolved) => {
      queryClient.setQueryData(customerColumnsKey, resolved);
      toast.success("Column preferences saved");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to save column preferences"),
  });
}

export function useResetCustomerColumns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => customersApi.resetColumns(),
    onSuccess: (resolved) => {
      queryClient.setQueryData(customerColumnsKey, resolved);
      toast.success("Columns reset to default");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to reset columns"),
  });
}
