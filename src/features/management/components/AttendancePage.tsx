"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { CaretLeftIcon, CaretRightIcon, ClockIcon, MapPinIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { cn } from "@/lib/utils";
import { attendanceKey, useAttendanceQuery, useRosterQuery } from "../hooks/useAttendance";
import type { AttendanceViewMode } from "../data/attendance.data";
import { AttendanceLegend } from "./attendance/AttendanceLegend";
import { AttendanceRegister } from "./attendance/AttendanceRegister";
import { AttendanceDrawer } from "./attendance/AttendanceDrawer";
import { attendanceCellClass } from "./attendance/attendance-utils";

export function AttendancePage() {
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [viewMode, setViewMode] = useState<AttendanceViewMode>("register");
  const [selectedSupervisor, setSelectedSupervisor] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const monthRange = useMemo(
    () => ({
      from: format(startOfMonth(calendarMonth), "yyyy-MM-dd"),
      to: format(endOfMonth(calendarMonth), "yyyy-MM-dd"),
    }),
    [calendarMonth],
  );
  const { data: roster = [] } = useRosterQuery("supervisor,field_executive");
  const {
    data: attendanceRecords = [],
    isLoading,
    error: loadError,
  } = useAttendanceQuery(monthRange);
  const refetchRecords = () =>
    queryClient.invalidateQueries({ queryKey: attendanceKey(monthRange.from, monthRange.to) });

  const visibleRecords = useMemo(
    () =>
      selectedSupervisor === "all"
        ? attendanceRecords
        : attendanceRecords.filter(
            (record) => record.staffId === selectedSupervisor,
          ),
    [attendanceRecords, selectedSupervisor],
  );
  const selectedSupervisorName =
    selectedSupervisor === "all"
      ? "All Supervisors"
      : (roster.find(
          (supervisor) => supervisor.id === selectedSupervisor,
        )?.name ?? "Supervisor");
  const monthDays = useMemo(() => {
    const days = eachDayOfInterval({
      start: startOfMonth(calendarMonth),
      end: endOfMonth(calendarMonth),
    });

    return [
      ...Array.from(
        { length: getDay(startOfMonth(calendarMonth)) },
        () => null,
      ),
      ...days,
    ];
  }, [calendarMonth]);

  const selectedRecord = selectedDate
    ? visibleRecords.find((record) =>
        isSameDay(parseISO(record.date), selectedDate),
      )
    : undefined;
  const attendanceControls = (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={selectedSupervisor}
        onValueChange={(value) => {
          if (!value) return;
          setSelectedSupervisor(value);
          setSelectedDate(null);
          setDrawerOpen(false);
        }}
      >
        <SelectTrigger className="h-8 w-[190px] bg-card">
          <SelectValue>{selectedSupervisorName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Supervisors</SelectItem>
          {roster.map((supervisor) => (
            <SelectItem key={supervisor.id} value={supervisor.id}>
              {supervisor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center rounded-md border border-border bg-card">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCalendarMonth((current) => subMonths(current, 1))}
        >
          <CaretLeftIcon size={15} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCalendarMonth(startOfMonth(new Date()))}
        >
          {format(calendarMonth, "MMM yyyy")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCalendarMonth((current) => addMonths(current, 1))}
        >
          <CaretRightIcon size={15} />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Attendance
          </h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <UnderlineTabs
          items={[
            { id: "register", label: "Register View" },
            { id: "calendar", label: "Calendar View" },
          ]}
          active={viewMode}
          onChange={(value) => setViewMode(value as AttendanceViewMode)}
        />
        {attendanceControls}
      </div>

      {loadError ? (
        <p className="text-sm text-destructive">
          {loadError instanceof Error ? loadError.message : "Unable to load attendance"}
        </p>
      ) : null}

      {viewMode === "register" ? (
        <AttendanceRegister
          month={calendarMonth}
          records={attendanceRecords}
          roster={roster}
          selectedSupervisor={selectedSupervisor}
          onRecordSaved={refetchRecords}
        />
      ) : null}

      {viewMode === "calendar" ? (
        <section className="space-y-3 rounded-lg border border-border/70 bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <AttendanceLegend />
            <p className="text-xs font-medium text-muted-foreground">
              {isLoading ? "Loading..." : "Showing attendance for"}{" "}
              <span className="text-foreground">{selectedSupervisorName}</span>
            </p>
          </div>
          <div className="grid grid-cols-7 overflow-hidden rounded-md border border-border/70 bg-secondary text-xs font-semibold text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="border-r border-border/70 px-2.5 py-2 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-border/70 bg-card">
            {monthDays.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`blank-${index}`}
                    className="min-h-28 border-b border-r border-border/70 bg-muted/20"
                  />
                );
              }
              const dayRecord = visibleRecords.find((record) =>
                isSameDay(parseISO(record.date), day),
              );
              const status = dayRecord?.status ?? "Not Marked";

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day);
                    setDrawerOpen(true);
                  }}
                  className={cn(
                    "min-h-28 border-b border-r border-border/70 p-2.5 text-left transition-colors hover:bg-accent/45",
                    attendanceCellClass(status),
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {format(day, "d")}
                    </span>
                    <span className="rounded-full bg-background/70 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      {status}
                    </span>
                  </div>
                  {dayRecord ? (
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      {dayRecord.checkInTime ? (
                        <p className="flex items-center gap-1">
                          <ClockIcon size={13} />
                          {dayRecord.checkInTime}
                          {dayRecord.checkOutTime
                            ? ` - ${dayRecord.checkOutTime}`
                            : ""}
                        </p>
                      ) : null}
                      {dayRecord.latitude && dayRecord.longitude ? (
                        <p className="flex items-center gap-1 text-foreground">
                          <MapPinIcon size={13} className="text-primary" />
                          Location captured
                        </p>
                      ) : null}
                      <p className="line-clamp-2">{dayRecord.staffName}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Click to mark
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <AttendanceDrawer
        key={`${selectedDate ? format(selectedDate, "yyyy-MM-dd") : "none"}-${selectedSupervisor}`}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        date={selectedDate}
        record={selectedRecord}
        selectedSupervisor={selectedSupervisor}
        roster={roster}
        onSaved={refetchRecords}
      />
    </div>
  );
}
