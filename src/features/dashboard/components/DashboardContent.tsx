"use client";

import { useState } from "react";
import { MetricCard } from "@/components/shared/MetricCard";
import { DashboardPeriodFilter } from "@/features/dashboard/components/DashboardPeriodFilter";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivityCard";
import { WorkProgressCard } from "@/features/dashboard/components/WorkProgressCard";
import {
  dashboardMetricsByPeriod,
  type DashboardPeriod,
} from "@/features/dashboard/data/dashboard.data";

export function DashboardContent() {
  const [period, setPeriod] = useState<DashboardPeriod>("this-month");
  const dashboardMetrics = dashboardMetricsByPeriod[period];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Project, site, survey, and billing overview
          </p>
        </div>
        <DashboardPeriodFilter value={period} onChange={setPeriod} />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <WorkProgressCard />
        <RecentActivityCard />
      </section>
    </div>
  );
}
