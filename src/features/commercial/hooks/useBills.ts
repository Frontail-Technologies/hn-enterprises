import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billsApi } from "../services/bills.service";
import type { BillFormValues, BillPaymentFormValues, BillStage, BillStatus } from "../types/bill.types";

const billsKey = ["bills"] as const;
const billKey = (id: string) => ["bills", id] as const;
const paymentsKey = (billId: string) => ["bills", billId, "payments"] as const;

export function useBillsQuery(params: { search?: string; customerId?: string; stage?: BillStage; status?: BillStatus } = {}) {
  return useQuery({
    queryKey: [...billsKey, params],
    queryFn: () => billsApi.list(params),
  });
}

export function useBillQuery(id: string) {
  return useQuery({
    queryKey: billKey(id),
    queryFn: () => billsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BillFormValues) => billsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKey });
    },
  });
}

export function useUpdateBill(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<BillFormValues>) => billsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billsKey });
      queryClient.invalidateQueries({ queryKey: billKey(id) });
    },
  });
}

export function useBillPaymentsQuery(billId: string) {
  return useQuery({
    queryKey: paymentsKey(billId),
    queryFn: () => billsApi.listPayments(billId),
    enabled: Boolean(billId),
  });
}

export function useCreateBillPayment(billId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BillPaymentFormValues) => billsApi.createPayment(billId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey(billId) });
      queryClient.invalidateQueries({ queryKey: billKey(billId) });
      queryClient.invalidateQueries({ queryKey: billsKey });
    },
  });
}
