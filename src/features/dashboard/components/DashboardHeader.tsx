import { SquaresFourIcon } from "@phosphor-icons/react";
import { DashboardMetricFilter } from "@/features/dashboard/components/DashboardMetricFilter";
import { DashboardPeriodFilter } from "@/features/dashboard/components/DashboardPeriodFilter";
import { DashboardProjectFilter } from "@/features/dashboard/components/DashboardProjectFilter";
import type { DashboardMetric, DashboardPeriod } from "@/features/dashboard/data/dashboard.data";

export function DashboardHeader({
  projects,
  projectId,
  onProjectChange,
  period,
  onPeriodChange,
  month,
  year,
  onMonthChange,
  onYearChange,
  allMetrics,
  selectedMetricIds,
  onSelectedMetricsChange,
}: {
  projects: { id: string; name: string }[];
  projectId: string;
  onProjectChange: (value: string) => void;
  period: DashboardPeriod;
  onPeriodChange: (value: DashboardPeriod) => void;
  month: string;
  year: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  allMetrics: DashboardMetric[];
  selectedMetricIds: string[];
  onSelectedMetricsChange: (ids: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <SquaresFourIcon size={17} weight="bold" />
        </span>
        <h1 className="truncate text-page-title">Dashboard</h1>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <DashboardProjectFilter projects={projects} value={projectId} onChange={onProjectChange} />
        <DashboardPeriodFilter
          value={period}
          onChange={onPeriodChange}
          month={month}
          year={year}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
        />
        <DashboardMetricFilter
          metrics={allMetrics}
          selectedIds={selectedMetricIds}
          onChange={onSelectedMetricsChange}
        />
      </div>
    </div>
  );
}
