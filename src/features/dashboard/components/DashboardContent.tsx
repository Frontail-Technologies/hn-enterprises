"use client";

import { formatDistanceToNow } from "date-fns";
import { PageLoading } from "@/components/shared/PageLoading";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import { AttendanceSummary } from "@/features/dashboard/components/AttendanceSummary";
import { DashboardAlerts } from "@/features/dashboard/components/DashboardAlerts";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivityCard";
import { DashboardCharts } from "@/features/dashboard/components/charts/DashboardCharts";
import { ACTIVITY_ICON_BY_TYPE } from "@/features/dashboard/data/dashboard-metric-icons";
import { humanizeActivityTitle } from "@/features/dashboard/data/activity-labels";
import { useDashboardScreen } from "@/features/dashboard/hooks/useDashboardScreen";

export function DashboardContent() {
  const screen = useDashboardScreen();

  if (screen.isLoading) {
    return <PageLoading className="min-h-[60vh]" />;
  }

  if (screen.isError || !screen.overview) {
    return (
      <EmptyState
        illustration="error"
        title="Couldn't load the dashboard"
        description="Something went wrong while fetching your overview."
        action={{ label: "Retry", onClick: () => screen.refetch() }}
      />
    );
  }

  // Only operational activity on the dashboard: sign-in/password events (audit
  // module "auth") are noise here. The backend also excludes them; this keeps
  // the card clean against an API that hasn't been updated yet.
  const activityItems = screen.overview.recentActivity
    .filter((activity) => !(activity.type === "System" && activity.title.startsWith("auth - ")))
    .map((activity) => ({
    title: humanizeActivityTitle(activity.title, activity.type),
    time: formatRelativeTime(activity.dateTime),
    icon: ACTIVITY_ICON_BY_TYPE[activity.type],
    type: activity.type,
  }));

  return (
    <div className="space-y-5">
      <DashboardHeader
        projects={screen.overview.filters.projects}
        projectId={screen.filters.projectId}
        onProjectChange={screen.setProjectId}
        period={screen.filters.period}
        onPeriodChange={screen.setPeriod}
        month={screen.filters.month}
        year={screen.filters.year}
        onMonthChange={screen.setMonth}
        onYearChange={screen.setYear}
        allMetrics={screen.allMetrics}
        selectedMetricIds={screen.effectiveMetricIds}
        onSelectedMetricsChange={screen.setSelectedMetricIds}
      />

      <div className={cn("space-y-5 transition-opacity", screen.isFetching && "opacity-60")}>
        <DashboardStats metrics={screen.visibleMetrics} />

        {screen.chartsError ? (
          <p className="rounded-card border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Charts couldn&apos;t load.{" "}
            <button type="button" className="font-medium text-primary hover:underline" onClick={() => void screen.refetchCharts()}>
              Retry
            </button>
          </p>
        ) : (
          <DashboardCharts charts={screen.charts} isLoading={screen.chartsLoading} />
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[0.75fr_1.25fr]">
          <AttendanceSummary rows={screen.overview.attendance} />
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[0.8fr_1.2fr]">
            <DashboardAlerts alerts={screen.overview.alerts} />
            <RecentActivityCard items={activityItems} />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${formatDistanceToNow(date)} ago`;
}
