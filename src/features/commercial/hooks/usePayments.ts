import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "../services/payments.service";
import type { PaymentCategory, PaymentFormValues, PaymentStatus } from "../types/payment.types";

const paymentsKey = ["payments"] as const;

export function usePaymentsQuery(params: { category?: PaymentCategory; status?: PaymentStatus; search?: string } = {}) {
  return useQuery({
    queryKey: [...paymentsKey, params],
    queryFn: () => paymentsApi.list(params),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PaymentFormValues) => paymentsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey });
    },
  });
}

export function useUpdatePayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PaymentFormValues) => paymentsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey });
    },
  });
}
