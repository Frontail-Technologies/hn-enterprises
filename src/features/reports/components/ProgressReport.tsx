"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarCheckIcon,
  ClipboardTextIcon,
  DownloadSimpleIcon,
  FlameIcon,
  PipeIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListTable, useClientRows, useListState, type ListColumn } from "@/components/shared/list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { axisProps, ChartCard, ChartTable, ChartTooltipCard, gridProps, LegendItem } from "@/features/dashboard/components/charts/chart-kit";
import { exportRowsToExcel } from "@/lib/export-excel";
import { formatCompactCount } from "@/lib/format";
import { useProgressReport, type ProgressReportData, type ProgressStageKey } from "../services/progress.service";
import type { ReportFilters } from "../types";

/** Stage colours for the chart (enough distinct, calm hues; JMR has no dates). */
const STAGE_COLORS: Partial<Record<ProgressStageKey, string>> = {
  survey: "#94a3b8",
  gi: "#2a78d6",
  gc: "#0ea5e9",
  laying: "#14b8a6",
  testing: "#22c55e",
  valveChamber: "#a3a3a3",
  preCommissioning: "#a855f7",
  connection: "#f59e0b",
  commissioning: "#eb6834",
  conversion: "#16a34a",
};

const count = (value: number) => value.toLocaleString("en-IN");
const pct = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

type ProjectRow = ProgressReportData["byProject"][number] & { id: string };
type StageRow = { id: ProgressStageKey; label: string; dated: boolean; period: number; soFar: number; percent: number };

/**
 * Work progress for the period: headline numbers, work per day by stage,
 * stage totals against all customers, and a project × stage table.
 */
export function ProgressReport({ filters }: { filters: ReportFilters }) {
  const { data, isLoading, isError, refetch } = useProgressReport(filters);

  if (filters.from > filters.to) {
    return <EmptyState illustration="calendar" title="Check the period" description="The start date is after the end date." />;
  }
  if (isError) {
    return (
      <div className="rounded-card border border-border bg-card shadow-card">
        <EmptyState illustration="error" title="Couldn't load the progress report" action={{ label: "Retry", onClick: () => void refetch() }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Headline data={data} isLoading={isLoading} />
      <div className="grid gap-5 xl:grid-cols-5">
        <DailyChart data={data} isLoading={isLoading} className="xl:col-span-3" />
        <StageTable data={data} isLoading={isLoading} className="xl:col-span-2" />
      </div>
      <ProjectTable data={data} isLoading={isLoading} filters={filters} />
      <SupervisorTable data={data} isLoading={isLoading} />
    </div>
  );
}

function Headline({ data, isLoading }: { data?: ProgressReportData; isLoading: boolean }) {
  const totals = data?.periodTotals;
  const dash = isLoading ? "…" : undefined;
  const value = (key: ProgressStageKey) => dash ?? formatCompactCount(totals?.[key] ?? 0);
  const all = totals ? Object.entries(totals).reduce((sum, [, n]) => sum + n, 0) : 0;
  return (
    <CompactStatGrid columns={5}>
      <DashboardStatCard label="Stages completed" value={dash ?? formatCompactCount(all)} icon={CalendarCheckIcon} tone="primary" dense />
      <DashboardStatCard label="GI done" value={value("gi")} icon={PipeIcon} tone="info" dense />
      <DashboardStatCard label="Commissioning" value={value("commissioning")} icon={ClipboardTextIcon} tone="warning" dense />
      <DashboardStatCard label="Conversions" value={value("conversion")} icon={FlameIcon} tone="success" dense />
      <DashboardStatCard label="Customers in scope" value={dash ?? formatCompactCount(data?.totalCustomers ?? 0)} icon={UsersIcon} tone="info" dense />
    </CompactStatGrid>
  );
}

type ChartPoint = { bucket: string } & Record<string, number | string>;
type TooltipProps<T> = { active?: boolean; payload?: readonly { payload?: T }[] };

function DailyChart({ data, isLoading, className }: { data?: ProgressReportData; isLoading: boolean; className?: string }) {
  const dated = useMemo(() => (data?.stages ?? []).filter((stage) => stage.dated), [data?.stages]);
  // Long periods are grouped by week so the bars stay readable.
  const byWeek = (data?.daily.length ?? 0) > 62;
  const points = useMemo(() => {
    const daily = data?.daily ?? [];
    if (!byWeek) return daily.map((day) => ({ ...day, bucket: day.date }) as ChartPoint);
    const weeks = new Map<string, Record<string, number> & { bucket: string }>();
    daily.forEach((day, index) => {
      const bucket = daily[index - (index % 7)].date;
      const entry = weeks.get(bucket) ?? ({ bucket } as Record<string, number> & { bucket: string });
      dated.forEach((stage) => {
        entry[stage.key] = (entry[stage.key] ?? 0) + day[stage.key];
      });
      weeks.set(bucket, entry);
    });
    return Array.from(weeks.values()) as ChartPoint[];
  }, [data?.daily, byWeek, dated]);
  const activeStages = dated.filter((stage) => (data?.periodTotals[stage.key] ?? 0) > 0);
  const total = activeStages.reduce((sum, stage) => sum + (data?.periodTotals[stage.key] ?? 0), 0);
  const label = (bucket: string) => format(parseISO(bucket), "d MMM");

  return (
    <ChartCard
      className={className}
      title="Work completed"
      description={`Stages reached ${byWeek ? "per week" : "per day"} in this period`}
      aside={
        <span className="text-sm text-muted-foreground">
          <b className="font-semibold tabular-nums text-foreground">{count(total)}</b> stages
        </span>
      }
      isLoading={isLoading}
      isEmpty={!total}
      emptyText="No stage was completed in this period."
      table={
        <ChartTable
          headers={[byWeek ? "Week of" : "Day", ...activeStages.map((stage) => stage.label)]}
          rows={points
            .filter((point) => activeStages.some((stage) => Number((point as Record<string, unknown>)[stage.key]) > 0))
            .map((point) => [format(parseISO(point.bucket), "d MMM yyyy"), ...activeStages.map((stage) => count(Number((point as Record<string, unknown>)[stage.key]) || 0))])}
        />
      }
    >
      <div className="flex h-full flex-col gap-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {activeStages.map((stage) => (
            <LegendItem key={stage.key} color={STAGE_COLORS[stage.key] ?? "#94a3b8"} label={stage.label} />
          ))}
        </div>
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="bucket" tickFormatter={label} minTickGap={20} {...axisProps} />
              <YAxis allowDecimals={false} width={36} {...axisProps} />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.6 }}
                content={(props: TooltipProps<(typeof points)[number]>) => {
                  const point = props.active ? props.payload?.[0]?.payload : undefined;
                  if (!point) return null;
                  const rows = activeStages
                    .map((stage) => ({ stage, value: Number((point as Record<string, unknown>)[stage.key]) || 0 }))
                    .filter((row) => row.value > 0)
                    .map((row) => ({ label: row.stage.label, value: count(row.value), color: STAGE_COLORS[row.stage.key] }));
                  return (
                    <ChartTooltipCard
                      title={byWeek ? `Week of ${format(parseISO(point.bucket), "d MMM yyyy")}` : format(parseISO(point.bucket), "EEE, d MMM yyyy")}
                      rows={rows.length ? rows : [{ label: "Nothing completed", value: "", muted: true }]}
                    />
                  );
                }}
              />
              {activeStages.map((stage, index) => (
                <Bar
                  key={stage.key}
                  dataKey={stage.key}
                  stackId="stages"
                  fill={STAGE_COLORS[stage.key] ?? "#94a3b8"}
                  maxBarSize={28}
                  radius={index === activeStages.length - 1 ? [4, 4, 0, 0] : 0}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
}

function StageTable({ data, isLoading, className }: { data?: ProgressReportData; isLoading: boolean; className?: string }) {
  const total = data?.totalCustomers ?? 0;
  const rows: StageRow[] = (data?.stages ?? []).map((stage) => ({
    id: stage.key,
    label: stage.label,
    dated: stage.dated,
    period: data?.periodTotals[stage.key] ?? 0,
    soFar: data?.doneSoFar[stage.key] ?? 0,
    percent: pct(data?.doneSoFar[stage.key] ?? 0, total),
  }));

  return (
    <section className={`flex min-w-0 flex-col gap-3 rounded-card border border-border bg-card p-5 shadow-card ${className ?? ""}`}>
      <header>
        <h2 className="text-section-title">Stage summary</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">In this period, and done so far out of {count(total)} customers</p>
      </header>
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-7 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 py-2">
              <span className="w-32 shrink-0 text-sm text-foreground">{row.label}</span>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted" title={`${row.percent}% of customers`}>
                <div className="h-full rounded-full" style={{ width: `${row.percent}%`, background: STAGE_COLORS[row.id] ?? "var(--primary)" }} />
              </div>
              <span className="w-14 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground" title="In this period">
                {row.dated ? `+${count(row.period)}` : "—"}
              </span>
              <span className="w-20 shrink-0 text-right text-xs tabular-nums text-muted-foreground" title="Done so far">
                {count(row.soFar)} · {row.percent}%
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">JMR has no date stored, so it only shows in &ldquo;done so far&rdquo;.</p>
    </section>
  );
}

function ProjectTable({ data, isLoading, filters }: { data?: ProgressReportData; isLoading: boolean; filters: ReportFilters }) {
  const list = useListState({ pageSize: 25, storageKey: "report-progress-projects" });
  const dated = useMemo(() => (data?.stages ?? []).filter((stage) => stage.dated), [data?.stages]);
  const rows = useMemo<ProjectRow[]>(() => (data?.byProject ?? []).map((row) => ({ ...row, id: row.projectId ?? "none" })), [data?.byProject]);
  const columns = useMemo<ListColumn<ProjectRow>[]>(
    () => [
      { id: "project", header: "Project", value: (row) => row.projectName, isTitle: true, hideable: false, sortable: true, width: 240, grow: true },
      { id: "customers", header: "Customers", value: (row) => row.customers, cell: (row) => count(row.customers), align: "end", sortable: true, width: 110 },
      ...dated.map<ListColumn<ProjectRow>>((stage) => ({
        id: stage.key,
        header: stage.label,
        value: (row) => row.counts[stage.key],
        cell: (row) => (row.counts[stage.key] ? count(row.counts[stage.key]) : <span className="text-muted-foreground">0</span>),
        align: "end",
        sortable: true,
        width: 120,
      })),
    ],
    [dated],
  );
  const view = useClientRows(rows, list, { columns });

  function exportExcel() {
    void exportRowsToExcel(
      `work-progress-${filters.from}-to-${filters.to}`,
      [
        { label: "Project", getValue: (row: ProjectRow) => row.projectName },
        { label: "Customers", getValue: (row: ProjectRow) => row.customers },
        ...dated.map((stage) => ({ label: stage.label, getValue: (row: ProjectRow) => row.counts[stage.key] })),
      ],
      view.rows,
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-section-title">By project</h2>
      <ListTable
        itemLabel="project"
        rows={view.pageRows}
        total={view.total}
        columns={columns}
        state={list}
        isLoading={isLoading}
        searchPlaceholder="Search projects..."
        empty={{ illustration: "projects", title: "No customers in these projects." }}
        actions={
          <Button type="button" variant="outline" size="compact" disabled={!view.total} onClick={exportExcel}>
            <DownloadSimpleIcon size={14} />
            Export
          </Button>
        }
      />
    </section>
  );
}

type SupervisorRow = ProgressReportData["bySupervisor"][number] & { id: string };

function SupervisorTable({ data, isLoading }: { data?: ProgressReportData; isLoading: boolean }) {
  const list = useListState({ pageSize: 25, storageKey: "report-progress-supervisors" });
  const stageNames = useMemo(
    () => Array.from(new Set((data?.bySupervisor ?? []).flatMap((row) => Object.keys(row.stages)))),
    [data?.bySupervisor],
  );
  const rows = useMemo<SupervisorRow[]>(() => (data?.bySupervisor ?? []).map((row) => ({ ...row, id: row.supervisorId ?? "none" })), [data?.bySupervisor]);
  const columns = useMemo<ListColumn<SupervisorRow>[]>(
    () => [
      { id: "name", header: "Supervisor / Manager", value: (row) => row.name, isTitle: true, hideable: false, sortable: true, width: 220, grow: true },
      { id: "total", header: "Completed", value: (row) => row.total, cell: (row) => count(row.total), align: "end", sortable: true, width: 120 },
      ...stageNames.map<ListColumn<SupervisorRow>>((stage) => ({
        id: stage,
        header: stage,
        value: (row) => row.stages[stage] ?? 0,
        align: "end",
        sortable: true,
        width: 120,
      })),
    ],
    [stageNames],
  );
  const view = useClientRows(rows, list, { columns });

  return (
    <section className="flex flex-col gap-2">
      <div>
        <h2 className="text-section-title">By supervisor</h2>
        <p className="text-[13px] text-muted-foreground">Stage updates marked completed in the mobile app during this period.</p>
      </div>
      <ListTable
        itemLabel="supervisor"
        rows={view.pageRows}
        total={view.total}
        columns={columns}
        state={list}
        isLoading={isLoading}
        searchable={false}
        empty={{ illustration: "projects", title: "No completed stage updates from the app in this period." }}
      />
    </section>
  );
}
