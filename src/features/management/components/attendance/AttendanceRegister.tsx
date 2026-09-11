import { useMemo, useState, type ReactNode } from "react";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "../../data/attendance.data";
import type { RosterUser } from "../../services/users.service";
import { AttendanceDrawer } from "./AttendanceDrawer";
import {
  attendanceRegisterCellClass,
  getAttendanceRegisterCell,
} from "./attendance-utils";

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
      <div className="overflow-auto">
        <table className="min-w-max border-separate border-spacing-0 text-xs">
          <thead>
            <tr>
              <AttendanceHeaderCell sticky={0} className="w-10 min-w-10">
                Sl No.
              </AttendanceHeaderCell>
              <AttendanceHeaderCell
                sticky={40}
                edge
                className="w-36 min-w-36"
              >
                Name
              </AttendanceHeaderCell>
              {days.map((day) => (
                <AttendanceHeaderCell
                  key={day.toISOString()}
                  className="w-9 min-w-9 text-center"
                >
                  <span className="block text-[9px] leading-tight">
                    {format(day, "EEEEE")}
                  </span>
                  <span className="block text-[11px] leading-tight text-foreground">
                    {format(day, "d")}
                  </span>
                </AttendanceHeaderCell>
              ))}
              <AttendanceHeaderCell className="w-14 min-w-14 text-center">
                Present
              </AttendanceHeaderCell>
              <AttendanceHeaderCell className="w-14 min-w-14 text-center">
                Absent
              </AttendanceHeaderCell>
              <AttendanceHeaderCell className="w-14 min-w-14 text-center">
                Holiday
              </AttendanceHeaderCell>
              <AttendanceHeaderCell className="w-16 min-w-16 text-center">
                Payable
              </AttendanceHeaderCell>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={days.length + 6}
                  className="h-28 border-b border-r border-border/55 bg-card px-2 py-2 text-center"
                >
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.person.id} className="hover:bg-muted/25">
                  <AttendanceBodyCell
                    sticky={0}
                    className="text-center font-medium"
                  >
                    {row.serial}
                  </AttendanceBodyCell>
                  <AttendanceBodyCell
                    sticky={40}
                    edge
                    className="font-medium text-foreground"
                  >
                    {row.person.name}
                  </AttendanceBodyCell>
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
              ))
            )}
          </tbody>
        </table>
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
  sticky,
  edge,
}: {
  children: ReactNode;
  className?: string;
  sticky?: number;
  edge?: boolean;
}) {
  // No left-pinned columns on mobile - same rule as the shared grids
  // (remove-mobile-sub-navbar brief §6).
  const isMobile = useIsMobile();
  const effectiveSticky = isMobile ? undefined : sticky;
  return (
    <th
      style={effectiveSticky !== undefined ? { left: effectiveSticky } : undefined}
      className={cn(
        "sticky top-0 h-9 whitespace-nowrap border-b border-r border-border/70 bg-table-header/90 px-1.5 py-1 text-left align-middle text-[11px] font-semibold text-muted-foreground",
        effectiveSticky === undefined
          ? "z-10"
          : "z-30 bg-table-header text-foreground",
        effectiveSticky !== undefined && edge && "shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
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
  sticky,
  edge,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
  sticky?: number;
  edge?: boolean;
}) {
  const isMobile = useIsMobile();
  const effectiveSticky = isMobile ? undefined : sticky;
  return (
    <td
      title={title}
      onClick={onClick}
      style={effectiveSticky !== undefined ? { left: effectiveSticky } : undefined}
      className={cn(
        "h-7 whitespace-nowrap border-b border-r border-border/55 bg-card px-1.5 py-1 text-xs text-foreground",
        onClick && "cursor-pointer transition-colors hover:bg-accent/45",
        effectiveSticky !== undefined && "sticky z-10 bg-card",
        effectiveSticky !== undefined && edge && "shadow-[6px_0_12px_-12px_hsl(var(--foreground))]",
        className,
      )}
    >
      {children}
    </td>
  );
}
