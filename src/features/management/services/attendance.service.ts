import { format, parseISO, differenceInMinutes } from "date-fns";
import { apiRequest } from "@/lib/api-client";
import type { AttendanceRecord, AttendanceStatus } from "../data/attendance.data";

type BackendLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  address?: string;
  capturedAt: string;
} | null;

type BackendAttendanceRecord = {
  id: string;
  userId: string;
  date: string;
  status: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInLocation: BackendLocation;
  checkOutLocation: BackendLocation;
  remarks: string | null;
  markedBy: string | null;
  user: { id: string; name: string; role: string } | null;
};

const STATUS_TO_BACKEND: Record<Exclude<AttendanceStatus, "Not Marked">, string> = {
  Present: "present",
  Absent: "absent",
  Late: "late",
  "Half Day": "half_day",
  Leave: "leave",
};

const STATUS_TO_FRONTEND: Record<string, AttendanceStatus> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  half_day: "Half Day",
  leave: "Leave",
};

function formatTime(value: string | null) {
  return value ? format(parseISO(value), "hh:mm a") : undefined;
}

function computeWorkHours(checkInAt: string | null, checkOutAt: string | null) {
  if (!checkInAt || !checkOutAt) return undefined;
  const minutes = differenceInMinutes(parseISO(checkOutAt), parseISO(checkInAt));
  if (minutes <= 0) return undefined;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function mapAttendanceRecord(raw: BackendAttendanceRecord): AttendanceRecord {
  const location = raw.checkInLocation ?? raw.checkOutLocation;

  return {
    id: raw.id,
    staffId: raw.userId,
    staffName: raw.user?.name ?? "",
    role: raw.user?.role ?? "",
    date: raw.date,
    status: STATUS_TO_FRONTEND[raw.status] ?? "Not Marked",
    checkInTime: formatTime(raw.checkInAt),
    checkOutTime: formatTime(raw.checkOutAt),
    workHours: computeWorkHours(raw.checkInAt, raw.checkOutAt),
    latitude: location?.latitude,
    longitude: location?.longitude,
    locationAddress: location?.address,
    locationCapturedAt: location?.capturedAt,
    remarks: raw.remarks ?? undefined,
  };
}

export const attendanceApi = {
  async list(params: { from: string; to: string; userId?: string }): Promise<AttendanceRecord[]> {
    const query = new URLSearchParams({ from: params.from, to: params.to });
    if (params.userId) query.set("userId", params.userId);
    const rows = await apiRequest<BackendAttendanceRecord[]>(`/attendance?${query.toString()}`);
    return rows.map(mapAttendanceRecord);
  },

  async upsert(input: {
    userId: string;
    date: string;
    status: Exclude<AttendanceStatus, "Not Marked">;
    checkInTime?: string;
    checkOutTime?: string;
    remarks?: string;
  }): Promise<AttendanceRecord> {
    const raw = await apiRequest<BackendAttendanceRecord>("/attendance", {
      method: "PUT",
      body: JSON.stringify({
        userId: input.userId,
        date: input.date,
        status: STATUS_TO_BACKEND[input.status],
        checkInTime: input.checkInTime || undefined,
        checkOutTime: input.checkOutTime || undefined,
        remarks: input.remarks || undefined,
      }),
    });
    return mapAttendanceRecord(raw);
  },
};
