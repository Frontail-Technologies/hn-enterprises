import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { staffApi } from "../services/staff.service";
import type { CreateStaffFormValues, StaffPayrollFormValues, StaffUserPatchValues } from "../types/staff.types";

const staffKey = ["staff"] as const;
const staffMemberKey = (id: string) => ["staff", id] as const;

export function useStaffQuery(search?: string) {
  return useQuery({
    queryKey: [...staffKey, search ?? ""],
    queryFn: () => staffApi.list({ search }),
  });
}

export function useStaffMemberQuery(id: string) {
  return useQuery({
    queryKey: staffMemberKey(id),
    queryFn: () => staffApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateStaffFormValues) => staffApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKey });
      toast.success("Staff member created successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to create staff member"),
  });
}

export function useUpdateStaff(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ values, userPatch }: { values: StaffPayrollFormValues; userPatch?: Partial<StaffUserPatchValues> }) =>
      staffApi.update(id, values, userPatch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKey });
      queryClient.invalidateQueries({ queryKey: staffMemberKey(id) });
      toast.success("Staff member updated successfully");
    },
    onError: (error: any) => toast.error(error?.message || "Failed to update staff member"),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKey });
      toast.success("Staff member deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete staff member"),
  });
}

// Only fetched while the delete dialog is open - matches the Projects delete-impact pattern.
export function useStaffDeleteImpactQuery(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...staffMemberKey(id), "delete-impact"],
    queryFn: () => staffApi.getDeleteImpact(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 0,
  });
}

export function useBulkDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => staffApi.bulkDelete(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: staffKey });
      toast.success(`${result.count} staff member${result.count === 1 ? "" : "s"} deleted`);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete staff members"),
  });
}
