import { format, getDay } from "date-fns";
import type { AttendanceRecord, AttendanceStatus } from "../../data/attendance.data";

export function attendanceCellClass(status: AttendanceStatus) {
  switch (status) {
    case "Present":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Absent":
      return "border-red-200 bg-red-50 text-red-700";
    case "Late":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "Half Day":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Leave":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-border bg-card text-muted-foreground";
  }
}

export function getGeneratedAttendanceStatus(
  staffId: string,
  day: Date,
): AttendanceStatus | "Holiday" {
  const dayNumber = Number(format(day, "d"));
  if (getDay(day) === 0) return "Holiday";
  if (staffId === "st-5" && dayNumber % 11 === 0) return "Absent";
  if (staffId === "st-4" && dayNumber % 13 === 0) return "Leave";
  if (staffId === "st-6" && dayNumber % 9 === 0) return "Late";
  if (staffId === "st-8" && dayNumber % 12 === 0) return "Half Day";
  return "Present";
}

export function attendanceRegisterLabel(status: AttendanceStatus | "Holiday") {
  switch (status) {
    case "Present":
      return "P";
    case "Absent":
      return "A";
    case "Late":
      return "L";
    case "Half Day":
      return "HD";
    case "Leave":
      return "LV";
    case "Holiday":
      return "H";
    default:
      return "-";
  }
}

export function attendanceRegisterCellClass(status: AttendanceStatus | "Holiday") {
  switch (status) {
    case "Present":
      return "bg-emerald-50 text-emerald-700";
    case "Absent":
      return "bg-red-50 text-red-700";
    case "Late":
      return "bg-orange-50 text-orange-700";
    case "Half Day":
      return "bg-amber-50 text-amber-700";
    case "Leave":
      return "bg-sky-50 text-sky-700";
    case "Holiday":
      return "bg-muted/40 text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
}

export function getAttendanceRegisterCell(
  staffId: string,
  day: Date,
  records: AttendanceRecord[],
) {
  const date = format(day, "yyyy-MM-dd");
  const record = records.find(
    (item) => item.staffId === staffId && item.date === date,
  );
  const status = record?.status ?? getGeneratedAttendanceStatus(staffId, day);

  return {
    date,
    status,
    label: attendanceRegisterLabel(status),
    payable: status === "Present" || status === "Late" || status === "Half Day",
    record,
  };
}
