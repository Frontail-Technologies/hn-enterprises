import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  dashboardPeriods,
  type DashboardPeriod,
} from "@/features/dashboard/data/dashboard.data";

interface DashboardPeriodFilterProps {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
  month: string;
  year: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

export function DashboardPeriodFilter({
  value,
  onChange,
  month,
  year,
  onMonthChange,
  onYearChange,
}: DashboardPeriodFilterProps) {
  const selectedMonthLabel = monthOptions.find((option) => option.value === month)?.label ?? "Month";

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="grid grid-cols-3 gap-1.5 sm:contents">
        {dashboardPeriods.map((period) => {
          const isActive = value === period.value;
          return (
            <button
              key={period.value}
              type="button"
              onClick={() => onChange(period.value)}
              className={cn(
                "flex h-8 w-full items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors sm:w-auto",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-subtle"
                  : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {period.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:contents">
        <Select
          value={month}
          onValueChange={(nextMonth) => {
            if (!nextMonth) return;
            onMonthChange(nextMonth);
            onChange("custom-month");
          }}
        >
          <SelectTrigger
            size="sm"
            className={cn(
              "w-full text-xs hover:border-border-strong sm:w-24",
              value === "custom-month" && "border-primary/50 text-primary",
            )}
          >
            <SelectValue placeholder="Month">{selectedMonthLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year}
          onValueChange={(nextYear) => {
            if (!nextYear) return;
            onYearChange(nextYear);
            onChange("custom-year");
          }}
        >
          <SelectTrigger
            size="sm"
            className={cn(
              "w-full text-xs hover:border-border-strong sm:w-20",
              value === "custom-year" && "border-primary/50 text-primary",
            )}
          >
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

const monthOptions = [
  { label: "Jan", value: "01" },
  { label: "Feb", value: "02" },
  { label: "Mar", value: "03" },
  { label: "Apr", value: "04" },
  { label: "May", value: "05" },
  { label: "Jun", value: "06" },
  { label: "Jul", value: "07" },
  { label: "Aug", value: "08" },
  { label: "Sep", value: "09" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];

const yearOptions = ["2026", "2025", "2024"];
