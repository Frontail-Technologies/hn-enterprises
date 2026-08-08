import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentsImportApi, type PaymentImportRow } from "../services/payments-import.service";

export function usePaymentsImportPreview() {
  return useMutation({
    mutationFn: (file: File) => paymentsImportApi.preview(file),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to preview import");
    },
  });
}

export function usePaymentsImportConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (validRows: PaymentImportRow[]) => paymentsImportApi.confirm(validRows),
    onSuccess: (result) => {
      toast.success(`Successfully imported ${result.insertedCount} payments`);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to confirm import");
    },
  });
}
