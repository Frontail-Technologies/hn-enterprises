import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customersApi } from "../services/customers.service";
import type { Customer, CustomerDocument, CustomerFormValues, CustomerStatus, LmcPipeSizeRecord } from "../types/customer.types";

const customersKey = ["customers"] as const;
const customerKey = (id: string) => ["customers", id] as const;
const documentsKey = (customerId: string) => ["customers", customerId, "documents"] as const;

export function useCustomersQuery(params: { search?: string; projectId?: string; siteId?: string; status?: CustomerStatus; statKey?: string; city?: string } = {}) {
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
      toast.success("Customer created successfully");
    },
    onError: () => toast.error("Failed to create customer"),
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CustomerFormValues) => customersApi.update(id, values),
    onSuccess: (updated: Customer) => {
      queryClient.invalidateQueries({ queryKey: customersKey });
      queryClient.setQueryData(customerKey(id), updated);
      toast.success("Customer updated successfully");
    },
    onError: () => toast.error("Failed to update customer"),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKey });
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
    onError: () => toast.error("Failed to save LMC record"),
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
      toast.success("Document uploaded successfully");
    },
    onError: () => toast.error("Failed to upload document"),
  });
}

export function useDeleteCustomerDocument(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => customersApi.deleteDocument(customerId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey(customerId) });
      queryClient.invalidateQueries({ queryKey: customerKey(customerId) });
      toast.success("Document deleted");
    },
    onError: () => toast.error("Failed to delete document"),
  });
}
