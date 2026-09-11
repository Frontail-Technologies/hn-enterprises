import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customersApi } from "../api/customers.api";
import { notesKey } from "./customer.query-keys";

export function useCustomerNotesQuery(customerId: string) {
  return useQuery({
    queryKey: notesKey(customerId),
    queryFn: () => customersApi.listNotes(customerId),
    enabled: Boolean(customerId),
  });
}

export function useCreateCustomerNoteMutation(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note: string) => customersApi.createNote(customerId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKey(customerId) });
      toast.success("Note added");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to add note"),
  });
}
