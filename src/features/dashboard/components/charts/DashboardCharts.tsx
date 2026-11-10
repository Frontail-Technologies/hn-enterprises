"use client";

import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardChartsResponse } from "@/features/dashboard/model/dashboard-overview.types";
import { axisProps, ChartCard, ChartTable, ChartTooltipCard, gridProps, inr, inrCompact, LegendItem, SERIES } from "./chart-kit";

const STAGE_LABELS: Record<string, string> = {
  survey: "Survey",
  workable: "Workable",
  plumbing_gi: "GI plumbing",
  gc: "GC",
  commissioning: "Commissioning",
  conversion: "Conversion",
};

const CATEGORY_LABELS: Record<string, string> = {
  worker_payment: "Worker payments",
  supervisor_payment: "Supervisor payments",
  plumber_payment: "Plumber payments",
  rent: "Office / guest house rent",
  material_expense: "Material expenses",
  other_expense: "Other expenses",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type TooltipProps<T> = { active?: boolean; payload?: readonly { payload?: T }[] };
const hovered = <T,>(props: TooltipProps<T>) => (props.active ? props.payload?.[0]?.payload : undefined);

const pct = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);
const count = (value: number) => value.toLocaleString("en-IN");

/** Customers that have completed each field stage, as bars against the total. */
function PipelineChart({ data, isLoading }: { data?: DashboardChartsResponse["pipeline"]; isLoading: boolean }) {
  const total = data?.total ?? 0;
  const rows = (data?.stages ?? []).map((stage) => ({ ...stage, percent: pct(stage.done, total), label2: `${count(stage.done)} · ${pct(stage.done, total)}%` }));
  return (
    <ChartCard
      title="Connection pipeline"
      description={`Customers through each stage · all time · ${count(total)} customers`}
      isLoading={isLoading}
      isEmpty={!total}
      emptyText="No customers yet."
      table={<ChartTable headers={["Stage", "Done", "Of total"]} rows={rows.map((row) => [row.label, count(row.done), `${row.percent}%`])} />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 88, bottom: 4, left: 4 }} barCategoryGap="28%">
          <XAxis type="number" domain={[0, Math.max(total, 1)]} hide />
          <YAxis type="category" dataKey="label" width={84} {...axisProps} tick={{ ...axisProps.tick, fill: "var(--foreground)" }} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={(props: TooltipProps<(typeof rows)[number]>) => {
              const row = hovered(props);
              return row ? (
                <ChartTooltipCard
                  title={row.label}
                  rows={[
                    { label: "Done", value: count(row.done), color: SERIES.primary },
                    { label: "Remaining", value: count(Math.max(total - row.done, 0)), muted: true },
                    { label: "Share", value: `${row.percent}%`, muted: true },
                  ]}
                />
              ) : null;
            }}
          />
          <Bar dataKey="done" fill={SERIES.primary} maxBarSize={24} radius={[0, 4, 4, 0]} background={{ fill: "var(--muted)", radius: 4 }} isAnimationActive={false}>
            <LabelList dataKey="label2" position="right" offset={8} fill="var(--muted-foreground)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/** Field updates over the period (per day, or per month for long periods); tooltip splits by stage. */
function FieldTrendChart({ data, isLoading }: { data?: DashboardChartsResponse["fieldTrend"]; isLoading: boolean }) {
  const points = data?.points ?? [];
  const total = points.reduce((sum, point) => sum + point.total, 0);
  const daily = data?.unit !== "month";
  const tickLabel = (bucket: string) => format(parseISO(bucket), daily ? "d MMM" : "MMM");
  const fullLabel = (bucket: string) => format(parseISO(bucket), daily ? "EEE, d MMM yyyy" : "MMMM yyyy");
  return (
    <ChartCard
      title="Field work"
      description={`Survey and installation updates ${daily ? "per day" : "per month"} in this period`}
      aside={<span className="text-sm text-muted-foreground"><b className="font-semibold text-foreground tabular-nums">{count(total)}</b> updates</span>}
      isLoading={isLoading}
      isEmpty={!total}
      emptyText="No field updates in this period."
      table={
        <ChartTable
          headers={[daily ? "Day" : "Month", "Updates", ...(data?.stages ?? []).map((stage) => STAGE_LABELS[stage] ?? stage)]}
          rows={points.filter((point) => point.total > 0).map((point) => [fullLabel(point.bucket), count(point.total), ...(data?.stages ?? []).map((stage) => count(point.byStage[stage] ?? 0))])}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="bucket" tickFormatter={tickLabel} minTickGap={24} {...axisProps} />
          <YAxis allowDecimals={false} width={36} {...axisProps} />
          <Tooltip
            cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
            content={(props: TooltipProps<(typeof points)[number]>) => {
              const point = hovered(props);
              if (!point) return null;
              const stages = Object.entries(point.byStage).filter(([, value]) => value > 0);
              return (
                <ChartTooltipCard
                  title={fullLabel(point.bucket)}
                  rows={[
                    { label: "Updates", value: count(point.total), color: SERIES.primary },
                    ...stages.map(([stage, value]) => ({ label: STAGE_LABELS[stage] ?? stage, value: count(value), muted: true })),
                  ]}
                />
              );
            }}
          />
          <Area
            type="linear"
            dataKey="total"
            stroke={SERIES.primary}
            strokeWidth={2}
            fill={SERIES.primary}
            fillOpacity={0.12}
            dot={false}
            activeDot={{ r: 4, fill: SERIES.primary, stroke: "var(--card)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/** Approved expenses per category, largest first. */
function ExpensesChart({ data, isLoading }: { data?: DashboardChartsResponse["expensesByCategory"]; isLoading: boolean }) {
  const rows = (data ?? []).map((row) => ({ ...row, label: CATEGORY_LABELS[row.category] ?? row.category, amountLabel: inrCompact(row.amount) }));
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  return (
    <ChartCard
      title="Expenses by category"
      description="Approved expenses in this period"
      aside={<span className="text-sm text-muted-foreground"><b className="font-semibold text-foreground tabular-nums">{inrCompact(total)}</b> total</span>}
      isLoading={isLoading}
      isEmpty={!rows.length}
      emptyText="No approved expenses in this period."
      table={<ChartTable headers={["Category", "Amount", "Share"]} rows={rows.map((row) => [row.label, inr(row.amount), `${pct(row.amount, total)}%`])} />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 4 }} barCategoryGap="28%">
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey="label" width={156} {...axisProps} tick={{ ...axisProps.tick, fill: "var(--foreground)" }} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={(props: TooltipProps<(typeof rows)[number]>) => {
              const row = hovered(props);
              return row ? (
                <ChartTooltipCard
                  title={row.label}
                  rows={[
                    { label: "Amount", value: inr(row.amount), color: SERIES.primary },
                    { label: "Share of total", value: `${pct(row.amount, total)}%`, muted: true },
                  ]}
                />
              ) : null;
            }}
          />
          <Bar dataKey="amount" fill={SERIES.primary} maxBarSize={24} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList dataKey="amountLabel" position="right" offset={8} fill="var(--muted-foreground)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/** Billed vs collected per month of the selected year — one ₹ axis, two series. */
function BillingChart({ data, isLoading }: { data?: DashboardChartsResponse["billing"]; isLoading: boolean }) {
  const rows = (data?.months ?? []).map((month) => ({ ...month, label: MONTHS[month.month - 1] }));
  const billed = rows.reduce((sum, row) => sum + row.billed, 0);
  const collected = rows.reduce((sum, row) => sum + row.collected, 0);
  return (
    <ChartCard
      title="Billed vs collected"
      description={`Per month in ${data?.year ?? ""} · ${inrCompact(billed)} billed, ${inrCompact(collected)} collected`}
      aside={
        <div className="flex items-center gap-3">
          <LegendItem color={SERIES.primary} label="Billed" />
          <LegendItem color={SERIES.secondary} label="Collected" />
        </div>
      }
      isLoading={isLoading}
      isEmpty={!billed && !collected}
      emptyText="No bills or collections this year."
      table={<ChartTable headers={["Month", "Billed", "Collected"]} rows={rows.map((row) => [`${row.label} ${data?.year ?? ""}`, inr(row.billed), inr(row.collected)])} />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2} barCategoryGap="22%">
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis tickFormatter={inrCompact} width={56} {...axisProps} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={(props: TooltipProps<(typeof rows)[number]>) => {
              const row = hovered(props);
              return row ? (
                <ChartTooltipCard
                  title={`${row.label} ${data?.year ?? ""}`}
                  rows={[
                    { label: "Billed", value: inr(row.billed), color: SERIES.primary },
                    { label: "Collected", value: inr(row.collected), color: SERIES.secondary },
                  ]}
                />
              ) : null;
            }}
          />
          <Bar dataKey="billed" name="Billed" fill={SERIES.primary} maxBarSize={16} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="collected" name="Collected" fill={SERIES.secondary} maxBarSize={16} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/** The dashboard's chart grid; follows the page's project + period filters. */
export function DashboardCharts({ charts, isLoading }: { charts?: DashboardChartsResponse; isLoading: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <PipelineChart data={charts?.pipeline} isLoading={isLoading} />
      <FieldTrendChart data={charts?.fieldTrend} isLoading={isLoading} />
      <ExpensesChart data={charts?.expensesByCategory} isLoading={isLoading} />
      <BillingChart data={charts?.billing} isLoading={isLoading} />
    </div>
  );
}
