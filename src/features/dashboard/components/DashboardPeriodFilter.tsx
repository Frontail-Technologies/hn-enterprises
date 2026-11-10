import { PeriodPicker, type PeriodSelection } from "@/components/shared/PeriodPicker";
import type { DashboardPeriod } from "@/features/dashboard/data/dashboard.data";

interface DashboardPeriodFilterProps {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
  /** "01".."12" */
  month: string;
  /** "2026" */
  year: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

/** Maps the dashboard's URL state (period + month + year) onto the shared PeriodPicker. */
function toSelection(period: DashboardPeriod, month: string, year: string): PeriodSelection {
  const yearNumber = Number(year);
  const monthNumber = Number(month);
  if (period === "custom-month" && yearNumber && monthNumber) return { kind: "month", year: yearNumber, month: monthNumber };
  if (period === "custom-year" && yearNumber) return { kind: "year", year: yearNumber };
  // An incomplete custom period is treated by the API as the current month.
  if (period === "custom-month" || period === "custom-year") return { kind: "this-month" };
  return { kind: period };
}

export function DashboardPeriodFilter({ value, onChange, month, year, onMonthChange, onYearChange }: DashboardPeriodFilterProps) {
  return (
    <PeriodPicker
      value={toSelection(value, month, year)}
      onChange={(next) => {
        if (next.kind === "month") {
          // Month and year always travel together; the API ignores a month without a year.
          onMonthChange(String(next.month).padStart(2, "0"));
          onYearChange(String(next.year));
          onChange("custom-month");
        } else if (next.kind === "year") {
          onMonthChange("");
          onYearChange(String(next.year));
          onChange("custom-year");
        } else {
          onChange(next.kind);
        }
      }}
    />
  );
}
