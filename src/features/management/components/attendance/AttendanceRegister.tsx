import { useMemo, useState, type ReactNode } from "react";
import { eachDayOfInterval, endOfMonth, format, isToday, startOfMonth } from "date-fns";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "../../data/attendance.data";
import type { RosterUser } from "../../services/users.service";
import { AttendanceDrawer } from "./AttendanceDrawer";
import { AttendanceLegend } from "./AttendanceLegend";
import { attendanceRegisterCellClass, getAttendanceRegisterCell } from "./attendance-utils";
import { UserAvatar } from "@/components/shared/UserAvatar";

const SERIAL_WIDTH = 44;

/**
 * Monthly attendance register (a bounded matrix, RG-030): one row per person,
 * one chip per day, month totals on the right. Click a day to mark or edit it.
 */
export function AttendanceRegister({
  month,
  records,
  roster,
  selectedSupervisor,
  onRecordSaved,
  isLoading = false,
  toolbarEnd,
}: {
  month: Date;
  records: AttendanceRecord[];
  roster: RosterUser[];
  selectedSupervisor: string;
  onRecordSaved?: () => void;
  isLoading?: boolean;
  /** Extra controls at the right of the register toolbar (e.g. Full View). */
  toolbarEnd?: ReactNode;
}) {
  const [selectedCell, setSelectedCell] = useState<{ staffId: string; date: Date; record?: AttendanceRecord } | null>(null);
  const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }), [month]);
  const people = useMemo(
    () => roster.filter((person) => selectedSupervisor === "all" || person.id === selectedSupervisor),
    [roster, selectedSupervisor],
  );
  const rows = useMemo(
    () =>
      people.map((person, index) => {
        const cells = days.map((day) => getAttendanceRegisterCell(person.id, day, records));
        const presentDays = cells.filter((cell) => cell.payable).length;
        const absentDays = cells.filter((cell) => cell.status === "Absent").length;
        const holidays = cells.filter((cell) => cell.status === "Holiday").length;
        return { person, serial: index + 1, cells, presentDays, absentDays, holidays, payableDays: presentDays + holidays };
      }),
    [days, people, records],
  );
  // A column is a "rest day" when every row shows Holiday for it (Sundays, declared holidays).
  const restDay = days.map((_, index) => rows.length > 0 && rows.every((row) => row.cells[index].status === "Holiday"));
  const totals = rows.reduce(
    (sum, row) => ({ present: sum.present + row.presentDays, absent: sum.absent + row.absentDays, payable: sum.payable + row.payableDays }),
    { present: 0, absent: 0, payable: 0 },
  );

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <AttendanceLegend />
        <div className="flex items-center gap-4">
          {!isLoading && rows.length ? (
            <dl className="hidden items-center gap-4 text-[13px] text-muted-foreground lg:flex">
              <div className="flex items-center gap-1.5">
                <dt>People</dt>
                <dd className="font-semibold text-foreground tabular-nums">{rows.length}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt>Present days</dt>
                <dd className="font-semibold text-success-foreground tabular-nums">{totals.present}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt>Absent</dt>
                <dd className="font-semibold text-destructive tabular-nums">{totals.absent}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt>Payable</dt>
                <dd className="font-semibold text-foreground tabular-nums">{totals.payable}</dd>
              </div>
            </dl>
          ) : null}
          {toolbarEnd}
        </div>
      </div>

      {!isLoading && rows.length === 0 ? (
        <EmptyState illustration="calendar" title="No one to show" description="Supervisors appear here once they are added under Supervisors." />
      ) : (
        <div className="min-h-0 overflow-auto">
          <table className="w-full min-w-max border-separate border-spacing-0 text-[13px]">
            <thead>
              <tr>
                <HeaderCell sticky={0} className="w-11 min-w-11 text-center">
                  #
                </HeaderCell>
                <HeaderCell sticky={SERIAL_WIDTH} edge className="w-52 min-w-52 text-left">
                  Name
                </HeaderCell>
                {days.map((day, index) => {
                  const today = isToday(day);
                  return (
                    <HeaderCell key={day.toISOString()} className={cn("min-w-9 text-center", restDay[index] && "bg-muted/70", today && "bg-primary-soft")}>
                      <span className={cn("block text-[10px] leading-tight font-medium uppercase", today ? "text-primary" : "text-muted-foreground")}>
                        {format(day, "EEEEE")}
                      </span>
                      <span
                        className={cn(
                          "mx-auto mt-0.5 flex size-6 items-center justify-center rounded-full text-xs leading-none font-semibold",
                          today ? "bg-primary text-primary-foreground" : "text-foreground",
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </HeaderCell>
                  );
                })}
                <HeaderCell className="min-w-16 border-l-2 border-l-border text-center">Present</HeaderCell>
                <HeaderCell className="min-w-16 text-center">Absent</HeaderCell>
                <HeaderCell className="min-w-16 text-center">Holiday</HeaderCell>
                <HeaderCell className="min-w-18 text-center">Payable</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 4 }, (_, rowIndex) => (
                    <tr key={rowIndex}>
                      <td colSpan={days.length + 6} className="h-11 border-b border-border px-4">
                        <Skeleton className="h-4 w-full rounded-full" />
                      </td>
                    </tr>
                  ))
                : rows.map((row) => (
                    <tr key={row.person.id} className="group/row">
                      <BodyCell sticky={0} className="text-center text-muted-foreground tabular-nums">
                        {row.serial}
                      </BodyCell>
                      <BodyCell sticky={SERIAL_WIDTH} edge>
                        <span className="flex items-center gap-2.5">
                          <UserAvatar name={row.person.name} src={row.person.avatarUrl} size="xs" />
                          <span className="truncate font-medium text-foreground">{row.person.name}</span>
                        </span>
                      </BodyCell>
                      {row.cells.map((cell, index) => {
                        const today = isToday(days[index]);
                        const marked = cell.status !== "Not Marked" && cell.status !== "Holiday";
                        return (
                          <BodyCell
                            key={cell.date}
                            className={cn("p-0 text-center", restDay[index] && "bg-muted/40", today && "bg-primary-soft/60")}
                          >
                            <button
                              type="button"
                              title={`${row.person.name} · ${format(days[index], "d MMM")} · ${cell.status}`}
                              aria-label={`${row.person.name}, ${format(days[index], "d MMMM")}: ${cell.status}. Edit`}
                              onClick={() => setSelectedCell({ staffId: row.person.id, date: days[index], record: cell.record })}
                              className="flex h-11 w-full items-center justify-center outline-none focus-visible:bg-primary-soft"
                            >
                              <span
                                className={cn(
                                  "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-[11px] font-semibold transition-shadow group-hover/row:shadow-[inset_0_0_0_1px_var(--border)] hover:!shadow-[inset_0_0_0_2px_var(--primary)]",
                                  attendanceRegisterCellClass(cell.status),
                                )}
                              >
                                {marked || cell.status === "Holiday" ? cell.label : "·"}
                              </span>
                            </button>
                          </BodyCell>
                        );
                      })}
                      <BodyCell className="border-l-2 border-l-border bg-surface-muted/50 text-center font-semibold text-success-foreground tabular-nums">
                        {row.presentDays}
                      </BodyCell>
                      <BodyCell className="bg-surface-muted/50 text-center font-semibold text-destructive tabular-nums">{row.absentDays}</BodyCell>
                      <BodyCell className="bg-surface-muted/50 text-center text-muted-foreground tabular-nums">{row.holidays}</BodyCell>
                      <BodyCell className="bg-surface-muted/50 text-center">
                        <span className="inline-flex min-w-8 justify-center rounded-full bg-card px-2 py-0.5 font-semibold text-foreground tabular-nums shadow-[inset_0_0_0_1px_var(--border)]">
                          {row.payableDays}
                        </span>
                      </BodyCell>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      <AttendanceDrawer
        key={selectedCell ? `${selectedCell.staffId}-${format(selectedCell.date, "yyyy-MM-dd")}` : "none"}
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

function HeaderCell({ children, className, sticky, edge }: { children: ReactNode; className?: string; sticky?: number; edge?: boolean }) {
  // No left-pinned columns on mobile — same rule as the shared grids.
  const isMobile = useIsMobile();
  const pinned = isMobile ? undefined : sticky;
  return (
    <th
      style={pinned !== undefined ? { left: pinned } : undefined}
      className={cn(
        "sticky top-0 h-12 border-b border-border bg-surface-muted px-1.5 py-1.5 align-middle text-xs font-semibold whitespace-nowrap text-muted-foreground",
        pinned === undefined ? "z-10" : "z-30",
        pinned !== undefined && edge && "border-r border-r-border",
        className,
      )}
    >
      {children}
    </th>
  );
}

function BodyCell({ children, className, sticky, edge }: { children: ReactNode; className?: string; sticky?: number; edge?: boolean }) {
  const isMobile = useIsMobile();
  const pinned = isMobile ? undefined : sticky;
  return (
    <td
      style={pinned !== undefined ? { left: pinned } : undefined}
      className={cn(
        "h-11 border-b border-border bg-card px-2 whitespace-nowrap text-foreground transition-colors group-hover/row:bg-surface-hover/60",
        pinned !== undefined && "sticky z-10",
        pinned !== undefined && edge && "border-r border-r-border",
        className,
      )}
    >
      {children}
    </td>
  );
}
