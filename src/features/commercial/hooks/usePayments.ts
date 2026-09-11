import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentsApi, type PaymentListParams } from "../services/payments.service";
import type { PaymentFormValues } from "../types/payment.types";

const paymentsKey = ["payments"] as const;

export function usePaymentsQuery(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: [...paymentsKey, params],
    queryFn: () => paymentsApi.list(params),
  });
}

/** Paginated main Payments & Expenses list - keeps the previous page while the next loads. */
export function usePaymentsPageQuery(params: PaymentListParams & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...paymentsKey, "list", params],
    queryFn: () => paymentsApi.listPage(params),
    placeholderData: keepPreviousData,
  });
}

/** Dataset-wide totals + per-category / per-status breakdown for the stat cards and tab badges. */
export function usePaymentsSummaryQuery(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: [...paymentsKey, "summary", params],
    queryFn: () => paymentsApi.summary(params),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PaymentFormValues) => paymentsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Payment recorded successfully");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to record payment"),
  });
}

export function useUpdatePayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PaymentFormValues) => paymentsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Payment updated successfully");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to update payment"),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey });
      toast.success("Payment deleted");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to delete payment"),
  });
}
