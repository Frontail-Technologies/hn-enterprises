"use client";

import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { ArrowUUpLeftIcon, CheckCircleIcon, ClipboardTextIcon, HourglassIcon } from "@phosphor-icons/react";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoading } from "@/components/shared/PageLoading";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { useUrlTab } from "@/hooks/useUrlTab";
import { formatCompactCount } from "@/lib/format";
import { DprTable } from "@/features/planning/components/DprTable";
import { PlanningTable } from "@/features/planning/components/PlanningTable";
import { useDprByPlanDates, useDprRecordsQuery, useSitePlansQuery } from "@/features/planning/hooks/usePlanning";
import type { ProjectSummary } from "../../types/project.types";

type View = "awaiting" | "sent-back" | "approved" | "dprs";

const NO_PLANS = new Map();
const NO_NAMES = new Map<string, string>();

const EMPTY_TITLE: Record<View, string> = {
  awaiting: "No plans waiting for approval",
  "sent-back": "No plans sent back",
  approved: "No plans approved in the last 30 days",
  dprs: "No DPRs in the last 30 days",
};

/**
 * The project's plans and daily progress reports: approve or send back
 * submitted plans, see what was sent back or approved, and the latest DPRs.
 */
export function ProjectPlanningTab({ projectId, summary }: { projectId: string; summary?: ProjectSummary }) {
  const [view, setView] = useUrlTab<View>(["awaiting", "sent-back", "approved", "dprs"], "awaiting", "planning");
  const since = useMemo(() => format(subDays(new Date(), 30), "yyyy-MM-dd"), []);
  const isDprView = view === "dprs";

  const planParams =
    view === "awaiting"
      ? { projectId, status: "submitted" }
      : view === "sent-back"
        ? { projectId, status: "sent_back" }
        : { projectId, status: "approved", from: since };
  const plansQuery = useSitePlansQuery(planParams, { enabled: !isDprView });
  const dprsQuery = useDprRecordsQuery({ projectId, from: since }, { enabled: isDprView });
  const active = isDprView ? dprsQuery : plansQuery;

  const plans = useMemo(() => [...(plansQuery.data ?? [])].sort((a, b) => b.date.localeCompare(a.date)), [plansQuery.data]);
  const dprs = useMemo(() => [...(dprsQuery.data ?? [])].sort((a, b) => b.date.localeCompare(a.date)), [dprsQuery.data]);
  const dprByKey = useDprByPlanDates(plans, { projectId }, !isDprView);

  const counts = summary?.dpr.plans;
  const tabs: { id: View; label: string }[] = [
    { id: "awaiting", label: `Awaiting approval${counts?.awaitingApproval ? ` (${counts.awaitingApproval})` : ""}` },
    { id: "sent-back", label: `Sent back${counts?.sentBack ? ` (${counts.sentBack})` : ""}` },
    { id: "approved", label: "Approved plans (30 days)" },
    { id: "dprs", label: "DPRs (30 days)" },
  ];
  const hasRows = isDprView ? dprs.length > 0 : plans.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <DashboardStatCard dense tone="warning" label="Plans awaiting approval" value={formatCompactCount(counts?.awaitingApproval ?? 0)} icon={HourglassIcon} />
        <DashboardStatCard dense tone="success" label="Approved plans" value={formatCompactCount(counts?.approved ?? 0)} icon={CheckCircleIcon} />
        <DashboardStatCard dense tone="danger" label="Sent back" value={formatCompactCount(counts?.sentBack ?? 0)} icon={ArrowUUpLeftIcon} />
        <DashboardStatCard dense tone="info" label="DPRs submitted this month" value={formatCompactCount(summary?.dpr.submittedThisMonth ?? 0)} icon={ClipboardTextIcon} />
      </div>

      <UnderlineTabs items={tabs} active={view} onChange={(id) => setView(id as View)} />

      <section className="overflow-x-auto rounded-card border border-border bg-card shadow-card">
        {active.isLoading ? (
          <PageLoading className="min-h-24" />
        ) : active.isError ? (
          <EmptyState
            illustration="error"
            title={isDprView ? "Couldn't load DPRs" : "Couldn't load plans"}
            action={{ label: "Retry", onClick: () => void active.refetch() }}
          />
        ) : !hasRows ? (
          <EmptyState illustration={view === "awaiting" ? "allClear" : "records"} title={EMPTY_TITLE[view]} />
        ) : isDprView ? (
          <DprTable rows={dprs} planByKey={NO_PLANS} projectNameById={NO_NAMES} date={dprs[0].date} showDate />
        ) : (
          <PlanningTable rows={plans} dprByKey={dprByKey} projectNameById={NO_NAMES} showDate />
        )}
      </section>
    </div>
  );
}
