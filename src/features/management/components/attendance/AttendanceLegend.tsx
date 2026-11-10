import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "../../data/attendance.data";
import { attendanceRegisterCellClass, attendanceRegisterLabel } from "./attendance-utils";

const STATUSES: (AttendanceStatus | "Holiday")[] = ["Present", "Absent", "Late", "Half Day", "Leave", "Holiday", "Not Marked"];

/** Key for the register chips: the same chip the grid shows, plus its name. */
export function AttendanceLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)} aria-label="Status key">
      {STATUSES.map((status) => (
        <li key={status} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-semibold",
              attendanceRegisterCellClass(status),
              status === "Holiday" && "bg-muted",
            )}
          >
            {status === "Not Marked" ? "·" : attendanceRegisterLabel(status)}
          </span>
          {status}
        </li>
      ))}
    </ul>
  );
}
