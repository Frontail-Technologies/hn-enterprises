import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "../services/customers.service";
import type { Customer, CustomerDocument, CustomerFormValues, CustomerStatus, LmcPipeSizeRecord } from "../types/customer.types";

const customersKey = ["customers"] as const;
const customerKey = (id: string) => ["customers", id] as const;
const documentsKey = (customerId: string) => ["customers", customerId, "documents"] as const;

export function useCustomersQuery(params: { search?: string; projectId?: string; siteId?: string; status?: CustomerStatus } = {}) {
  return useQuery({
    queryKey: [...customersKey, params],
    queryFn: () => customersApi.list(params),
  });
}

export function useCustomerQuery(id: string) {
  return useQuery({
    queryKey: customerKey(id),
    queryFn: () => customersApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CustomerFormValues) => customersApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKey });
    },
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CustomerFormValues) => customersApi.update(id, values),
    onSuccess: (updated: Customer) => {
      queryClient.invalidateQueries({ queryKey: customersKey });
      queryClient.setQueryData(customerKey(id), updated);
    },
  });
}

export function useUpsertLmcPipeRecord(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (record: LmcPipeSizeRecord) => customersApi.upsertLmcPipeRecord(customerId, record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKey(customerId) });
    },
  });
}

export function useCustomerDocumentsQuery(customerId: string) {
  return useQuery({
    queryKey: documentsKey(customerId),
    queryFn: () => customersApi.listDocuments(customerId),
    enabled: Boolean(customerId),
  });
}

export function useCreateCustomerDocument(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doc: CustomerDocument) => customersApi.createDocument(customerId, doc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(customerId) });
      queryClient.invalidateQueries({ queryKey: customerKey(customerId) });
    },
  });
}

export function useDeleteCustomerDocument(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => customersApi.deleteDocument(customerId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(customerId) });
      queryClient.invalidateQueries({ queryKey: customerKey(customerId) });
    },
  });
}
