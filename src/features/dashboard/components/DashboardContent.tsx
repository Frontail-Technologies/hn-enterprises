"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { WarningIcon } from "@phosphor-icons/react";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageShell } from "@/components/shared/PageShell";
import { SectionCard } from "@/components/shared/SectionCard";
import { DashboardPeriodFilter } from "@/features/dashboard/components/DashboardPeriodFilter";
import { DashboardProjectFilter } from "@/features/dashboard/components/DashboardProjectFilter";
import { DashboardMetricFilter } from "@/features/dashboard/components/DashboardMetricFilter";
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
import { useDashboardStatsQuery } from "@/features/dashboard/hooks/useDashboardStats";
import { useAuditLogsQuery } from "@/features/management/hooks/useAuditLogs";

export function DashboardContent() {
  const [period, setPeriod] = useState<DashboardPeriod>("this-month");
  const [month, setMonth] = useState("07");
  const [year, setYear] = useState("2026");
  const [projectId, setProjectId] = useState("all");

  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("dashboard_metrics");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

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
  const { data: auditLogs = [] } = useAuditLogsQuery();

  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const { data: attendance = [] } = useAttendanceQuery({ from: today, to: today });

  const { data: adminStats } = useDashboardStatsQuery({ projectId, city: "all" });

  const dashboard = useMemo(
    () =>
      getAdminDashboardData(
        { projectId, city: "all", period: metricPeriod },
        { customers, projects, projectSites, bills, payments, materials, dprRecords, workProgress, attendance },
        adminStats,
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
      adminStats,
      projectId,
    ],
  );

  const activityItems = useMemo(() => {
    return buildActivities({ workProgress, dprRecords, payments, auditLogs })
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      .slice(0, 6)
      .map((activity) => ({
        title: activity.title,
        time: formatRelativeTime(activity.dateTime),
        icon: activity.icon,
        type: activity.type,
      }));
  }, [dprRecords, payments, workProgress, auditLogs]);

  useEffect(() => {
    if (selectedMetricIds.length === 0 && !localStorage.getItem("dashboard_metrics")) {
      setSelectedMetricIds(dashboard.allMetrics.map((m) => m.id));
    }
  }, [dashboard.allMetrics, selectedMetricIds.length]);

  const handleMetricChange = (ids: string[]) => {
    setSelectedMetricIds(ids);
    localStorage.setItem("dashboard_metrics", JSON.stringify(ids));
  };

  const visibleMetrics = dashboard.allMetrics.filter((m) => selectedMetricIds.includes(m.id));

  return (
    <PageShell
      title="Dashboard"
      subtitle="Admin control overview for projects, customers, finance and field operations."
      actions={
        <div className="flex items-center gap-2">
          <DashboardMetricFilter
            metrics={dashboard.allMetrics}
            selectedIds={selectedMetricIds}
            onChange={handleMetricChange}
          />
          <DashboardProjectFilter projects={projects} value={projectId} onChange={setProjectId} />
          <DashboardPeriodFilter
            value={period}
            onChange={setPeriod}
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
          />
        </div>
      }
      contentClassName="space-y-5"
    >
      {visibleMetrics.length > 0 ? (
        <CompactStatGrid dashboard>
          {visibleMetrics.map((metric) => (
            <Link
              key={metric.id}
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
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border/70 py-12 text-muted-foreground">
          No stats selected. Click "Customize Stats" to add some.
        </div>
      )}

      <section className="grid items-start gap-5 xl:grid-cols-[0.75fr_1.25fr]">
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
      <div className="flex flex-1 flex-col gap-2">
        {rows.map((row) => {
          let dotColor = "bg-muted-foreground";
          if (row.id === "present") dotColor = "bg-emerald-500";
          if (row.id === "late") dotColor = "bg-amber-500";
          if (row.id === "absent") dotColor = "bg-rose-500";
          if (row.id === "leave") dotColor = "bg-blue-500";

          return (
            <div
              key={row.id}
              className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 px-3 py-2.5 transition-colors hover:bg-muted/40"
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground pl-4">{row.helper}</p>
              </div>
              <p className="text-lg font-semibold text-foreground">{row.value}</p>
            </div>
          );
        })}
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
