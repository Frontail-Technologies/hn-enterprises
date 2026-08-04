"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { WarningIcon } from "@phosphor-icons/react";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageShell } from "@/components/shared/PageShell";
import { SectionCard } from "@/components/shared/SectionCard";
import { DashboardPeriodFilter } from "@/features/dashboard/components/DashboardPeriodFilter";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivityCard";
import {
  type ActivityItem,
  type DashboardMetricPeriod,
  type DashboardPeriod,
} from "@/features/dashboard/data/dashboard.data";
import {
  buildActivities,
} from "@/features/dashboard/services/activity.service";
import {
  getAdminDashboardData,
  type AttendanceSummaryRow,
  type DashboardAlert,
} from "@/features/dashboard/services/dashboard.selectors";
import { useAllProjectSitesFullQuery } from "@/features/commercial/hooks/useAllProjectSites";
import { useBillsQuery } from "@/features/commercial/hooks/useBills";
import { useMaterialsQuery } from "@/features/commercial/hooks/useMaterials";
import { usePaymentsQuery } from "@/features/commercial/hooks/usePayments";
import { useCustomersQuery } from "@/features/customers/hooks/useCustomers";
import { useAttendanceQuery } from "@/features/management/hooks/useAttendance";
import { useDprRecordsQuery } from "@/features/planning/hooks/usePlanning";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { useWorkProgressListQuery } from "@/features/work-progress/hooks/useWorkProgress";

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

  const { data: customers = [] } = useCustomersQuery();
  const { data: projects = [] } = useProjectsQuery();
  const { data: projectSites = [] } = useAllProjectSitesFullQuery();
  const { data: bills = [] } = useBillsQuery();
  const { data: payments = [] } = usePaymentsQuery();
  const { data: materials = [] } = useMaterialsQuery();
  const { data: dprRecords = [] } = useDprRecordsQuery({});
  const { data: workProgress = [] } = useWorkProgressListQuery({ limit: 200 });

  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const { data: attendance = [] } = useAttendanceQuery({ from: today, to: today });

  const dashboard = useMemo(
    () =>
      getAdminDashboardData(
        { projectId: "all", city: "all", period: metricPeriod },
        { customers, projects, projectSites, bills, payments, materials, dprRecords, workProgress, attendance },
      ),
    [
      customers,
      dprRecords,
      materials,
      metricPeriod,
      payments,
      bills,
      projectSites,
      projects,
      workProgress,
      attendance,
    ],
  );

  const activityItems = useMemo(() => {
    return buildActivities({ workProgress, dprRecords, payments })
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      .slice(0, 6)
      .map((activity) => ({
        title: activity.title,
        time: formatRelativeTime(activity.dateTime),
        icon: activity.icon,
        type: activity.type,
      }));
  }, [dprRecords, payments, workProgress]);

  return (
    <PageShell
      title="Dashboard"
      subtitle="Admin control overview for projects, customers, finance and field operations."
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
        {dashboard.metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href ?? "/dashboard"}
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MetricCard
              {...metric}
              className="h-28 max-w-none p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 sm:w-full"
            />
          </Link>
        ))}
      </CompactStatGrid>

      <section className="space-y-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Customer Workflow</h2>
          <p className="text-xs text-muted-foreground">
            Master-sheet progress counts. Click any stat to open the filtered records.
          </p>
        </div>
        <CompactStatGrid dashboard>
          {dashboard.workflowMetrics.map(({ key: metricKey, ...metric }) => (
              <Link
                key={metricKey}
                href={metric.href ?? "/dashboard"}
                className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MetricCard
                  {...metric}
                  className="h-28 max-w-none p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 sm:w-full"
                />
              </Link>
            ))}
        </CompactStatGrid>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <AttendanceSummary rows={dashboard.attendanceRows} />
        <AlertsAndActivity alerts={dashboard.alerts} activityItems={activityItems} />
      </section>
    </PageShell>
  );
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${formatDistanceToNow(date)} ago`;
}

function AttendanceSummary({ rows }: { rows: AttendanceSummaryRow[] }) {
  return (
    <SectionCard title="Attendance Summary" className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-2 gap-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex min-h-24 flex-col justify-between rounded-md border border-border/70 bg-muted/25 p-3"
          >
            <p className="text-xs font-medium text-muted-foreground">{row.label}</p>
            <p className="mt-1 text-xl font-semibold leading-none text-foreground">
              {row.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{row.helper}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function AlertsAndActivity({
  alerts,
  activityItems,
}: {
  alerts: DashboardAlert[];
  activityItems: ActivityItem[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[0.8fr_1.2fr]">
      <SectionCard title="Alerts">
        <div className="space-y-2">
          {alerts.length ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex gap-2 rounded-md border border-border/70 bg-muted/20 p-2.5"
              >
                <span className={getAlertIconClass(alert.tone)}>
                  <WarningIcon size={15} weight="bold" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {alert.title}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No active alerts.</p>
          )}
        </div>
      </SectionCard>
      <RecentActivityCard items={activityItems} />
    </div>
  );
}

function getAlertIconClass(tone: DashboardAlert["tone"]) {
  if (tone === "danger") {
    return "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive";
  }

  if (tone === "info") {
    return "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-status-info-bg text-status-info-fg";
  }

  return "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-status-warning-bg text-status-warning-fg";
}
