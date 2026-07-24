import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "../../data/attendance.data";
import { attendanceCellClass } from "./attendance-utils";

export function AttendanceLegend() {
  const statuses: AttendanceStatus[] = [
    "Present",
    "Absent",
    "Late",
    "Half Day",
    "Leave",
    "Not Marked",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <span
          key={status}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium",
            attendanceCellClass(status),
          )}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {status}
        </span>
      ))}
    </div>
  );
}
