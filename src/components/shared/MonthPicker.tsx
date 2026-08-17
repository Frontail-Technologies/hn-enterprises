"use client";

import { useState } from "react";
import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthPickerProps {
  // "yyyy-MM", "" = no month selected
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// The shadcn-style counterpart to DatePicker for month-granularity filters - same
// Popover + Button shell, month/year grid instead of a day grid since a specific day
// is meaningless for these filters.
export function MonthPicker({ value, onChange, placeholder = "All time", className }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedYear, selectedMonth] = value ? value.split("-").map(Number) : [undefined, undefined];
  const [viewYear, setViewYear] = useState(selectedYear ?? new Date().getFullYear());

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setViewYear(selectedYear ?? new Date().getFullYear());
    setOpen(nextOpen);
  }

  const label = selectedYear && selectedMonth ? `${MONTH_LABELS[selectedMonth - 1]} ${selectedYear}` : placeholder;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn("h-8 justify-between px-2.5 font-normal", !value && "text-muted-foreground", className)}
          />
        }
      >
        <span className="truncate">{label}</span>
        <CalendarBlankIcon size={15} className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2.5" align="start">
        <div className="mb-2 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setViewYear((year) => year - 1)} aria-label="Previous year">
            <CaretLeftIcon size={14} />
          </Button>
          <p className="text-sm font-semibold text-foreground">{viewYear}</p>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setViewYear((year) => year + 1)} aria-label="Next year">
            <CaretRightIcon size={14} />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MONTH_LABELS.map((monthLabel, index) => {
            const monthNum = index + 1;
            const active = selectedYear === viewYear && selectedMonth === monthNum;
            return (
              <button
                key={monthLabel}
                type="button"
                className={cn(
                  "h-8 rounded-md text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground",
                  active && "bg-primary text-white hover:bg-primary hover:text-white",
                )}
                onClick={() => {
                  onChange(`${viewYear}-${String(monthNum).padStart(2, "0")}`);
                  setOpen(false);
                }}
              >
                {monthLabel}
              </button>
            );
          })}
        </div>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-7 w-full text-xs"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            Clear month
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
