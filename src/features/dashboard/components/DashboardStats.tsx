import type { ElementType } from "react";
import Link from "next/link";
import { DashboardStatCard, type StatCardTone } from "@/components/shared/DashboardStatCard";
import { DEFAULT_METRIC_TONE, METRIC_TONE_BY_ID, PRIMARY_METRIC_IDS } from "@/features/dashboard/data/dashboard-metric-icons";
import { formatCompactStatValue } from "@/lib/format";

type StatMetric = {
  id: string;
  label: string;
  value: string;
  helperText: string;
  href?: string;
  icon: ElementType;
};

export function DashboardStats({ metrics }: { metrics: StatMetric[] }) {
  if (metrics.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-card border border-dashed border-border bg-card py-12 text-body-small text-muted-foreground">
        No stats selected. Use &ldquo;Customize&rdquo; to add some.
      </div>
    );
  }

  const primaryMetrics = metrics.filter((metric) => PRIMARY_METRIC_IDS.has(metric.id));
  const operationalMetrics = metrics.filter((metric) => !PRIMARY_METRIC_IDS.has(metric.id));

  return (
    <div className="space-y-4">
      {primaryMetrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {primaryMetrics.map((metric) => (
            <StatCardLink key={metric.id} metric={metric} />
          ))}
        </div>
      ) : null}

      {operationalMetrics.length > 0 ? (
        <div className="mt-2 pt-2">
          <p className="mb-3 text-xs font-semibold tracking-wide text-foreground/70 uppercase">
            Operational progress
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {operationalMetrics.map((metric) => (
              <StatCardLink key={metric.id} metric={metric} dense />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCardLink({ metric, dense }: { metric: StatMetric; dense?: boolean }) {
  const tone: StatCardTone = METRIC_TONE_BY_ID[metric.id] ?? DEFAULT_METRIC_TONE;

  return (
    <Link
      href={metric.href ?? "/dashboard"}
      className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <DashboardStatCard
        label={metric.label}
        value={formatCompactStatValue(metric.value)}
        fullValue={metric.value}
        icon={metric.icon}
        helperText={metric.helperText}
        tone={tone}
        dense={dense}
        className="hover:border-primary/40"
      />
    </Link>
  );
}
