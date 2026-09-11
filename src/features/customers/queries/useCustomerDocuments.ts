import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customersApi } from "../api/customers.api";
import { customerKey, documentsKey } from "./customer.query-keys";
import type { CustomerDocument } from "../types/customer.types";

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
    onError: (error: Error) => toast.error(error.message || "Failed to upload document"),
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
    onError: (error: Error) => toast.error(error.message || "Failed to delete document"),
  });
}
