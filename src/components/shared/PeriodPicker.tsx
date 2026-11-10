"use client";

import { useState } from "react";
import { CalendarBlankIcon, CaretDownIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** A reporting period: a rolling preset, one calendar month, or one calendar year. */
export type PeriodSelection =
  | { kind: "today" }
  | { kind: "this-month" }
  | { kind: "this-year" }
  | { kind: "month"; year: number; month: number }
  | { kind: "year"; year: number };

const PRESETS = [
  { kind: "today", label: "Today" },
  { kind: "this-month", label: "This month" },
  { kind: "this-year", label: "This year" },
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function periodLabel(value: PeriodSelection) {
  if (value.kind === "month") return `${MONTHS[value.month - 1]} ${value.year}`;
  if (value.kind === "year") return String(value.year);
  return PRESETS.find((preset) => preset.kind === value.kind)!.label;
}

interface PeriodPickerProps {
  value: PeriodSelection;
  onChange: (value: PeriodSelection) => void;
  /** Earliest selectable year (default: two years back). */
  minYear?: number;
  className?: string;
}

/**
 * One control for "which period": presets plus a specific month or year.
 * Future months/years are disabled. Choices apply immediately.
 */
export function PeriodPicker({ value, onChange, minYear, className }: PeriodPickerProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const firstYear = minYear ?? currentYear - 2;
  const valueYear = value.kind === "month" || value.kind === "year" ? value.year : currentYear;

  const [open, setOpen] = useState(false);
  const [browseYear, setBrowseYear] = useState(valueYear);

  const choose = (next: PeriodSelection) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setBrowseYear(valueYear);
        setOpen(next);
      }}
    >
      <PopoverTrigger render={<Button variant="outline" size="compact" className={cn("font-normal", className)} />}>
        <CalendarBlankIcon size={14} className="text-muted-foreground" />
        <span className="font-medium whitespace-nowrap text-foreground">{periodLabel(value)}</span>
        <CaretDownIcon size={12} className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          <ul aria-label="Quick periods" className="flex gap-1 border-b border-border p-2 sm:w-36 sm:flex-col sm:border-r sm:border-b-0">
            {PRESETS.map((preset) => {
              const selected = value.kind === preset.kind;
              return (
                <li key={preset.kind} className="flex-1 sm:flex-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-pressed={selected}
                    onClick={() => choose({ kind: preset.kind })}
                    className={cn("w-full justify-start", selected && "bg-primary-soft font-semibold text-primary hover:bg-primary-soft")}
                  >
                    {preset.label}
                  </Button>
                </li>
              );
            })}
          </ul>

          <div className="flex w-64 flex-col gap-2 p-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon-sm" aria-label="Previous year" disabled={browseYear <= firstYear} onClick={() => setBrowseYear((year) => year - 1)}>
                <CaretLeftIcon size={14} />
              </Button>
              <span className="text-sm font-semibold tabular-nums">{browseYear}</span>
              <Button variant="ghost" size="icon-sm" aria-label="Next year" disabled={browseYear >= currentYear} onClick={() => setBrowseYear((year) => year + 1)}>
                <CaretRightIcon size={14} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((label, index) => {
                const month = index + 1;
                const selected = value.kind === "month" && value.year === browseYear && value.month === month;
                const future = browseYear === currentYear && month > currentMonth;
                return (
                  <Button
                    key={label}
                    variant="ghost"
                    size="sm"
                    disabled={future}
                    aria-pressed={selected}
                    onClick={() => choose({ kind: "month", year: browseYear, month })}
                    className={cn("h-8", selected && "bg-primary-soft font-semibold text-primary hover:bg-primary-soft")}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              aria-pressed={value.kind === "year" && value.year === browseYear}
              onClick={() => choose({ kind: "year", year: browseYear })}
              className={cn(value.kind === "year" && value.year === browseYear && "border-primary/40 bg-primary-soft font-semibold text-primary hover:bg-primary-soft")}
            >
              Whole {browseYear}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
