"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
}: DatePickerProps) {
  const selectedDate = value ? parseISO(value) : null;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(selectedDate ?? new Date());
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const leadingBlanks = getDay(startOfMonth(month));

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={pickerRef} className={cn("relative", className)}>
      <button
        type="button"
        className="flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input/70 bg-transparent px-2.5 text-left text-sm text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:border-primary/60"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={cn(!selectedDate && "text-muted-foreground")}>
          {selectedDate ? format(selectedDate, "dd MMM yyyy") : placeholder}
        </span>
        <CalendarBlankIcon size={15} className="text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute left-0 top-9 z-50 w-64 rounded-lg border border-border bg-popover p-2 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setMonth((current) => subMonths(current, 1))}
            >
              <CaretLeftIcon size={14} />
            </Button>
            <p className="text-sm font-bold text-foreground">
              {format(month, "MMM yyyy")}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setMonth((current) => addMonths(current, 1))}
            >
              <CaretRightIcon size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <span key={`${day}-${index}`} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {days.map((day) => {
              const active = selectedDate ? isSameDay(day, selectedDate) : false;

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={cn(
                    "h-7 rounded-md text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground",
                    active && "bg-primary text-white hover:bg-primary hover:text-white",
                  )}
                  onClick={() => {
                    onChange(format(day, "yyyy-MM-dd"));
                    setOpen(false);
                  }}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
