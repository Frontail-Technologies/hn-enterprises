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
} from "@/features/dashboard/data/dashboard.data";

export function DashboardContent() {
  const [period, setPeriod] = useState<DashboardPeriod>("this-month");
  const dashboardMetrics = dashboardMetricsByPeriod[period];

  return (
    <PageShell
      title="Dashboard"
      subtitle="Project, site, survey, and billing overview"
      actions={<DashboardPeriodFilter value={period} onChange={setPeriod} />}
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

      <section className="grid gap-4 xl:grid-cols-2">
        <WorkProgressCard />
        <RecentActivityCard />
      </section>
    </PageShell>
  );
}
