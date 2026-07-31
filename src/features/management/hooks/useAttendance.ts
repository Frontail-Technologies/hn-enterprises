import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "../services/attendance.service";
import { usersApi } from "../services/users.service";

export const attendanceKey = (from: string, to: string) => ["attendance", from, to] as const;
const rosterKey = (role?: string) => ["users", role ?? "all"] as const;

export function useAttendanceQuery(params: { from: string; to: string }) {
  return useQuery({
    queryKey: attendanceKey(params.from, params.to),
    queryFn: () => attendanceApi.list(params),
  });
}

export function useRosterQuery(role?: string) {
  return useQuery({
    queryKey: rosterKey(role),
    queryFn: () => usersApi.list({ role }),
  });
}
