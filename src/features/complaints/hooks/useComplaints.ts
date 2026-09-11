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
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Complaint recorded successfully");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to record complaint"),
  });
}

export function useUpdateComplaint(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<ComplaintFormValues>) => complaintsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsKey });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Complaint updated successfully");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to update complaint"),
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
    onError: (error: Error) => toast.error(error?.message || "Failed to delete complaint"),
  });
}

export function usePushComplaintNotification() {
  return useMutation({
    mutationFn: (id: string) => complaintsApi.push(id),
    onSuccess: (result) => {
      if (result.sent) {
        toast.success(result.message || "Complaint notification sent");
      } else {
        // Zero recipients is not an error - it's a real, meaningful state
        // (no active supervisor accounts exist at all). Complaints are
        // broadcast to every active supervisor, not scoped to a project.
        toast.warning(result.message || "No active supervisor accounts exist to notify.");
      }
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to send complaint notification"),
  });
}
