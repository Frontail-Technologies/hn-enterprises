"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { axisProps, ChartCard, ChartTable, ChartTooltipCard, gridProps, inrCompact, LegendItem, SERIES } from "@/features/dashboard/components/charts/chart-kit";
import { billTrendsApi, type BillingReportData } from "../../services/bill-trends.service";
import { money } from "../../utils/format";

type TooltipProps<T> = { active?: boolean; payload?: readonly { payload?: T }[] };
const hovered = <T,>(props: TooltipProps<T>) => (props.active ? props.payload?.[0]?.payload : undefined);
const monthLabel = (month: string) => format(parseISO(`${month}-01`), "MMM yy");

/**
 * On the Billing page: billed vs received over the last 12 months and how
 * old the pending amounts are (the parts the stat cards don't show).
 */
export function BillingTrends({ projectId }: { projectId?: string }) {
  const from = format(startOfMonth(subMonths(new Date(), 11)), "yyyy-MM-dd");
  const to = format(new Date(), "yyyy-MM-dd");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["bills", "trends", { from, to, projectId: projectId ?? "" }],
    queryFn: () => billTrendsApi.get({ from, to, projectId }),
  });

  // Older backend without the endpoint: just leave the charts out.
  if (isError) return null;
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-card" />
        <Skeleton className="h-72 rounded-card" />
      </div>
    );
  }
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <MonthsChart months={data.months} />
      <AgeingChart ageing={data.ageing} />
    </div>
  );
}

function MonthsChart({ months }: { months: BillingReportData["months"] }) {
  const rows = months.map((row) => ({ ...row, label: monthLabel(row.month) }));
  const isEmpty = rows.every((row) => !row.billed && !row.received);
  return (
    <ChartCard
      title="Billed vs received"
      description="Last 12 months · billed on bill date, received on payment date"
      isLoading={false}
      isEmpty={isEmpty}
      emptyText="Nothing billed or received in the last 12 months."
      aside={
        <div className="hidden items-center gap-3 sm:flex">
          <LegendItem color={SERIES.primary} label="Billed" />
          <LegendItem color={SERIES.secondary} label="Received" />
        </div>
      }
      table={<ChartTable headers={["Month", "Billed", "Received"]} rows={rows.map((row) => [row.label, money(row.billed), money(row.received)])} />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="24%">
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} width={64} tickFormatter={(value: number) => inrCompact(value)} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={(props: TooltipProps<(typeof rows)[number]>) => {
              const row = hovered(props);
              return row ? (
                <ChartTooltipCard
                  title={row.label}
                  rows={[
                    { label: "Billed", value: money(row.billed), color: SERIES.primary },
                    { label: "Received", value: money(row.received), color: SERIES.secondary },
                  ]}
                />
              ) : null;
            }}
          />
          <Bar dataKey="billed" fill={SERIES.primary} maxBarSize={28} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="received" fill={SERIES.secondary} maxBarSize={28} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function AgeingChart({ ageing }: { ageing: BillingReportData["ageing"] }) {
  const total = ageing.reduce((sum, row) => sum + row.amount, 0);
  return (
    <ChartCard
      title="Pending by age"
      description="Days past the due date (bill date when there is no due date), as of today"
      isLoading={false}
      isEmpty={total <= 0}
      emptyText="Nothing pending on these bills."
      table={<ChartTable headers={["Age", "Bills", "Pending"]} rows={ageing.map((row) => [row.label, row.bills, money(row.amount)])} />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={ageing} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} width={64} tickFormatter={(value: number) => inrCompact(value)} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={(props: TooltipProps<(typeof ageing)[number]>) => {
              const row = hovered(props);
              return row ? (
                <ChartTooltipCard
                  title={row.label}
                  rows={[
                    { label: "Pending", value: money(row.amount), color: SERIES.secondary },
                    { label: "Bills", value: String(row.bills), muted: true },
                  ]}
                />
              ) : null;
            }}
          />
          <Bar dataKey="amount" fill={SERIES.secondary} maxBarSize={40} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

