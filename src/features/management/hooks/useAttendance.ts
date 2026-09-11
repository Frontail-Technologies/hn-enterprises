import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../services/attendance.service";
import { usersApi } from "../services/users.service";

const attendanceBaseKey = ["attendance"] as const;
export const attendanceKey = (from: string, to: string) => [...attendanceBaseKey, from, to] as const;
const rosterKey = (role?: string) => ["users", role ?? "all"] as const;

export function useAttendanceQuery(params: { from: string; to: string }) {
  return useQuery({
    queryKey: attendanceKey(params.from, params.to),
    queryFn: () => attendanceApi.list(params),
  });
}

/**
 * Selector/roster use only (attendance, planning, payment/material dialogs)
 * - always active-only, never a deactivated or (by row absence) hard-deleted
 * user. Admin's own user-management list (useUsersQuery/listFull) is a
 * separate call that intentionally shows every status, since admins need to
 * find and manage inactive accounts too.
 */
export function useRosterQuery(role?: string) {
  return useQuery({
    queryKey: rosterKey(role),
    queryFn: () => usersApi.list({ role, status: "active" }),
  });
}

export function useUpsertAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.upsert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceBaseKey });
    },
  });
}
