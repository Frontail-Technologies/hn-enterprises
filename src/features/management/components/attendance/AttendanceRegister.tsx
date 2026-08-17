import { useMemo, useState, type ReactNode } from "react";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "../../data/attendance.data";
import type { RosterUser } from "../../services/users.service";
import { AttendanceDrawer } from "./AttendanceDrawer";
import { attendanceRegisterCellClass, getAttendanceRegisterCell } from "./attendance-utils";

export function AttendanceRegister({
  month,
  records,
  roster,
  selectedSupervisor,
  onRecordSaved,
  isLoading = false,
}: {
  month: Date;
  records: AttendanceRecord[];
  roster: RosterUser[];
  selectedSupervisor: string;
  onRecordSaved?: () => void;
  isLoading?: boolean;
}) {
  const [selectedCell, setSelectedCell] = useState<{
    staffId: string;
    date: Date;
    record?: AttendanceRecord;
  } | null>(null);
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month),
      }),
    [month],
  );
  const people = useMemo(
    () =>
      roster.filter(
        (person) =>
          selectedSupervisor === "all" || person.id === selectedSupervisor,
      ),
    [roster, selectedSupervisor],
  );
  const rows = useMemo(
    () =>
      people.map((person, index) => {
        const cells = days.map((day) =>
          getAttendanceRegisterCell(person.id, day, records),
        );
        const presentDays = cells.filter((cell) => cell.payable).length;
        const absentDays = cells.filter(
          (cell) => cell.status === "Absent",
        ).length;
        const holidays = cells.filter(
          (cell) => cell.status === "Holiday",
        ).length;

        return {
          person,
          serial: index + 1,
          cells,
          presentDays,
          absentDays,
          holidays,
          payableDays: presentDays + holidays,
        };
      }),
    [days, people, records],
  );

  return (
    <section className="rounded-lg border border-border/70 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Attendance Register
          </p>
          <p className="text-xs text-muted-foreground">
            Muster roll style view for {format(month, "MMMM yyyy")}
          </p>
        </div>
      </div>
      <div className="overflow-y-auto">
        <div className="flex min-w-0">
          <div className="shrink-0 border-r border-border/70">
            <table className="w-max border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <AttendanceHeaderCell className="w-16 min-w-16">
                    Sl No.
                  </AttendanceHeaderCell>
                  <AttendanceHeaderCell className="w-48 min-w-48">
                    Name
                  </AttendanceHeaderCell>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={2} className="h-28 border-b border-r border-border/55 bg-card px-2 py-2 text-center">
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner />
                      </div>
                    </td>
                  </tr>
                ) : rows.map((row) => (
                  <tr key={row.person.id} className="hover:bg-muted/25">
                    <AttendanceBodyCell className="text-center font-medium">
                      {row.serial}
                    </AttendanceBodyCell>
                    <AttendanceBodyCell className="font-medium text-foreground">
                      {row.person.name}
                    </AttendanceBodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto">
            <table className="min-w-max border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {days.map((day) => (
                    <AttendanceHeaderCell
                      key={day.toISOString()}
                      className="w-16 min-w-16 text-center"
                    >
                      <span className="block text-[11px]">
                        {format(day, "EEE")}
                      </span>
                      <span className="block text-sm text-foreground">
                        {format(day, "d")}
                      </span>
                    </AttendanceHeaderCell>
                  ))}
                  <AttendanceHeaderCell className="w-24 min-w-24 text-center">
                    Present
                  </AttendanceHeaderCell>
                  <AttendanceHeaderCell className="w-24 min-w-24 text-center">
                    Absent
                  </AttendanceHeaderCell>
                  <AttendanceHeaderCell className="w-24 min-w-24 text-center">
                    Holiday
                  </AttendanceHeaderCell>
                  <AttendanceHeaderCell className="w-28 min-w-28 text-center">
                    Payable
                  </AttendanceHeaderCell>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={days.length + 4} className="h-28 border-b border-r border-border/55 bg-card px-2 py-2 text-center">
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner />
                      </div>
                    </td>
                  </tr>
                ) : rows.map((row) => (
                  <tr key={row.person.id} className="hover:bg-muted/25">
                    {row.cells.map((cell, index) => (
                      <AttendanceBodyCell
                        key={cell.date}
                        className={cn(
                          "text-center font-semibold",
                          attendanceRegisterCellClass(cell.status),
                        )}
                        title={cell.status}
                        onClick={() =>
                          setSelectedCell({
                            staffId: row.person.id,
                            date: days[index],
                            record: cell.record,
                          })
                        }
                      >
                        {cell.label}
                      </AttendanceBodyCell>
                    ))}
                    <AttendanceBodyCell className="text-center font-semibold text-emerald-700">
                      {row.presentDays}
                    </AttendanceBodyCell>
                    <AttendanceBodyCell className="text-center font-semibold text-red-700">
                      {row.absentDays}
                    </AttendanceBodyCell>
                    <AttendanceBodyCell className="text-center font-semibold text-muted-foreground">
                      {row.holidays}
                    </AttendanceBodyCell>
                    <AttendanceBodyCell className="text-center font-semibold text-foreground">
                      {row.payableDays}
                    </AttendanceBodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AttendanceDrawer
        key={
          selectedCell
            ? `${selectedCell.staffId}-${format(selectedCell.date, "yyyy-MM-dd")}`
            : "none"
        }
        open={Boolean(selectedCell)}
        onOpenChange={(open) => {
          if (!open) setSelectedCell(null);
        }}
        date={selectedCell?.date ?? null}
        record={selectedCell?.record}
        selectedSupervisor={selectedCell?.staffId ?? "all"}
        roster={roster}
        onSaved={onRecordSaved}
      />
    </section>
  );
}

function AttendanceHeaderCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "sticky top-0 z-10 h-12 border-b border-r border-border/70 bg-secondary/90 px-2 py-2 text-left align-middle text-xs font-semibold text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function AttendanceBodyCell({
  children,
  className,
  title,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}) {
  return (
    <td
      title={title}
      onClick={onClick}
      className={cn(
        "h-10 border-b border-r border-border/55 bg-card px-2 py-2 text-sm text-foreground",
        onClick && "cursor-pointer transition-colors hover:bg-accent/45",
        className,
      )}
    >
      {children}
    </td>
  );
}
