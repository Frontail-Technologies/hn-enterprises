import { Button } from "@/components/ui/button";
import {
  dashboardPeriods,
  type DashboardPeriod,
} from "@/features/dashboard/data/dashboard.data";

interface DashboardPeriodFilterProps {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
}

export function DashboardPeriodFilter({
  value,
  onChange,
}: DashboardPeriodFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/70 p-1 ring-1 ring-border/70">
      {dashboardPeriods.map((period) => {
        const isActive = value === period.value;

        return (
          <Button
            key={period.value}
            type="button"
            size="sm"
            variant={isActive ? "default" : "ghost"}
            className="h-7 px-3 text-xs"
            onClick={() => onChange(period.value)}
          >
            {period.label}
          </Button>
        );
      })}
    </div>
  );
}
