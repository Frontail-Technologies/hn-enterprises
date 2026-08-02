import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    },
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
    },
  });
}
