import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { complaintsApi } from "../services/complaints.service";
import type { ComplaintFormValues, ComplaintStatus } from "../types/complaint.types";

const complaintsKey = ["complaints"] as const;

export function useComplaintsQuery(params: { customerId?: string; status?: ComplaintStatus } = {}) {
  return useQuery({
    queryKey: [...complaintsKey, params],
    queryFn: () => complaintsApi.list(params),
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ComplaintFormValues) => complaintsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKey });
      toast.success("Complaint recorded successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to record complaint"),
  });
}

export function useUpdateComplaint(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<ComplaintFormValues>) => complaintsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKey });
      toast.success("Complaint updated successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to update complaint"),
  });
}

export function useDeleteComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => complaintsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKey });
      toast.success("Complaint deleted successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to delete complaint"),
  });
}
