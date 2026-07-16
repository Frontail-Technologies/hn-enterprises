"use client";

import { useState } from "react";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageShell } from "@/components/shared/PageShell";
import { DashboardPeriodFilter } from "@/features/dashboard/components/DashboardPeriodFilter";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivityCard";
import { WorkProgressCard } from "@/features/dashboard/components/WorkProgressCard";
import {
  dashboardMetricsByPeriod,
  type DashboardPeriod,
  type DashboardMetricPeriod,
} from "@/features/dashboard/data/dashboard.data";

export function DashboardContent() {
  const [period, setPeriod] = useState<DashboardPeriod>("this-month");
  const [month, setMonth] = useState("07");
  const [year, setYear] = useState("2026");
  const metricPeriod: DashboardMetricPeriod =
    period === "custom-year"
      ? "this-year"
      : period === "custom-month"
        ? "this-month"
        : period;
  const dashboardMetrics = dashboardMetricsByPeriod[metricPeriod];

  return (
    <PageShell
      title="Dashboard"
      subtitle="Project, site, survey, and billing overview"
      actions={
        <DashboardPeriodFilter
          value={period}
          onChange={setPeriod}
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />
      }
      contentClassName="space-y-5"
    >
      <CompactStatGrid dashboard>
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
            className="h-28 max-w-none p-4 sm:w-full"
          />
        ))}
      </CompactStatGrid>

      <section className="grid gap-5 xl:grid-cols-2">
        <WorkProgressCard />
        <RecentActivityCard />
      </section>
    </PageShell>
  );
}
