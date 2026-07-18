import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const selectedMonthLabel =
    monthOptions.find((option) => option.value === month)?.label ?? "Select month";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs value={value} onValueChange={(v) => v && onChange(v as DashboardPeriod)}>
        <TabsList>
          {dashboardPeriods.map((period) => (
            <TabsTrigger key={period.value} value={period.value} className="px-3 text-xs">
              {period.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Select
        value={month}
        onValueChange={(nextMonth) => {
          if (!nextMonth) return;
          onMonthChange(nextMonth);
          onChange("custom-month");
        }}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-[132px] bg-card text-xs",
            value === "custom-month" && "border-primary/60 text-primary ring-1 ring-primary/20",
          )}
        >
          <SelectValue placeholder="Select month">{selectedMonthLabel}</SelectValue>
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
          className={cn(
            "h-8 w-[104px] bg-card text-xs",
            value === "custom-year" && "border-primary/60 text-primary ring-1 ring-primary/20",
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
