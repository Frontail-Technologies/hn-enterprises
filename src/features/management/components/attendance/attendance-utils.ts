import { format, getDay } from "date-fns";
import type { AttendanceRecord, AttendanceStatus } from "../../data/attendance.data";

// Semantic theme tokens (DS-COLOR), not raw Tailwind palette colours.
export function attendanceCellClass(status: AttendanceStatus) {
  switch (status) {
    case "Present":
      return "border-success/25 bg-success-soft text-success-foreground";
    case "Absent":
      return "border-destructive/25 bg-danger-soft text-destructive";
    case "Late":
    case "Half Day":
      return "border-warning/30 bg-warning-soft text-warning-foreground";
    case "Leave":
      return "border-info/25 bg-info-soft text-info-foreground";
    default:
      return "border-border bg-card text-muted-foreground";
  }
}

export function getGeneratedAttendanceStatus(day: Date): AttendanceStatus | "Holiday" {
  if (getDay(day) === 0) return "Holiday";
  return "Not Marked";
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

/** Chip colours for one day in the monthly register. */
export function attendanceRegisterCellClass(status: AttendanceStatus | "Holiday") {
  switch (status) {
    case "Present":
      return "bg-success-soft text-success-foreground";
    case "Absent":
      return "bg-danger-soft text-destructive";
    case "Late":
    case "Half Day":
      return "bg-warning-soft text-warning-foreground";
    case "Leave":
      return "bg-info-soft text-info-foreground";
    case "Holiday":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground/50";
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
  const status = record?.status ?? getGeneratedAttendanceStatus(day);

  return {
    date,
    status,
    label: attendanceRegisterLabel(status),
    payable: status === "Present" || status === "Late" || status === "Half Day",
    record,
  };
}
