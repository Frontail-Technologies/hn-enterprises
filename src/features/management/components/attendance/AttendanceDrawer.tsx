import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { InfoTile } from "@/components/shared/InfoTile";
import { supervisorOptions } from "../../data/staff.data";
import type { AttendanceRecord, AttendanceStatus } from "../../data/attendance.data";

function toTimeInputValue(value?: string) {
  if (!value || value === "-") return "";
  const match = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return value;

  const [, hourValue, minuteValue, meridiem] = match;
  let hour = Number(hourValue);
  if (meridiem.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minuteValue}`;
}

export function AttendanceDrawer({
  open,
  onOpenChange,
  date,
  record,
  selectedSupervisor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  record?: AttendanceRecord;
  selectedSupervisor: string;
}) {
  const defaultSupervisor =
    supervisorOptions.find(
      (supervisor) => supervisor.id === selectedSupervisor,
    ) ?? supervisorOptions[0];
  const [status, setStatus] = useState<AttendanceStatus>(
    record?.status ?? "Present",
  );
  const [checkInTime, setCheckInTime] = useState(
    toTimeInputValue(record?.checkInTime),
  );
  const [checkOutTime, setCheckOutTime] = useState(
    toTimeInputValue(record?.checkOutTime),
  );
  const location =
    typeof record?.latitude === "number" &&
    typeof record?.longitude === "number"
      ? { latitude: record.latitude, longitude: record.longitude }
      : null;

  const hasLocation = Boolean(location);
  const staffName =
    record?.staffName ?? defaultSupervisor?.name ?? "Supervisor";
  const mapSrc = location
    ? (() => {
        const delta = 0.006;
        const bbox = [
          location.longitude - delta,
          location.latitude - delta,
          location.longitude + delta,
          location.latitude + delta,
        ].join(",");
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${location.latitude},${location.longitude}`;
      })()
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-border bg-card sm:max-w-lg">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>
            {date ? format(date, "dd MMM yyyy") : "Attendance"}
          </SheetTitle>
          <SheetDescription>
            {staffName} : Supervisor attendance
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Status
              </span>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value) setStatus(value as AttendanceStatus);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "Present",
                      "Absent",
                      "Late",
                      "Half Day",
                      "Leave",
                    ] as AttendanceStatus[]
                  ).map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Working Hours
              </span>
              <Input value={record?.workHours ?? "-"} readOnly />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Check-in Time
              </span>
              <Input
                type="time"
                value={checkInTime}
                onChange={(event) => setCheckInTime(event.target.value)}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Check-out Time
              </span>
              <Input
                type="time"
                value={checkOutTime}
                onChange={(event) => setCheckOutTime(event.target.value)}
              />
            </label>
          </div>

          <section className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Mobile Location Evidence
                </p>
                <p className="text-xs text-muted-foreground">
                  Location is captured from the mobile app and is read-only
                  here.
                </p>
              </div>
            </div>
            {!hasLocation ? (
              <p className="rounded-md border border-border bg-background/70 px-2.5 py-2 text-xs font-medium text-muted-foreground">
                No mobile location captured for this attendance record.
              </p>
            ) : (
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <InfoTile
                  label="Latitude"
                  value={location?.latitude.toFixed(6) ?? "-"}
                />
                <InfoTile
                  label="Longitude"
                  value={location?.longitude.toFixed(6) ?? "-"}
                />
                <InfoTile
                  label="Captured At"
                  value={record?.locationCapturedAt || "-"}
                />
                <InfoTile
                  label="Address"
                  value={record?.locationAddress || "-"}
                />
                {mapSrc ? (
                  <div className="overflow-hidden rounded-md border border-border sm:col-span-2">
                    <iframe
                      title="Marked location map"
                      src={mapSrc}
                      loading="lazy"
                      className="h-48 w-full"
                    />
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Remarks
            </span>
            <Textarea defaultValue={record?.remarks} className="min-h-24" />
          </label>
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button type="button">Save Changes</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
