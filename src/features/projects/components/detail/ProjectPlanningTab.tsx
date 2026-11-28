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
import { useDprRecordsQuery } from "@/features/planning/hooks/usePlanning";
import type { ProjectSummary } from "../../types/project.types";

type View = "awaiting" | "sent-back" | "approved" | "recent";

const NO_PLANS = new Map();
const NO_NAMES = new Map<string, string>();

/**
 * The project's daily progress reports: approve or send back what's waiting,
 * and see what was sent back, approved, or submitted lately.
 */
export function ProjectDprTab({ projectId, summary }: { projectId: string; summary?: ProjectSummary }) {
  const [view, setView] = useUrlTab<View>(["awaiting", "sent-back", "approved", "recent"], "awaiting", "dpr");
  const since = useMemo(() => format(subDays(new Date(), 30), "yyyy-MM-dd"), []);

  const params =
    view === "awaiting"
      ? { projectId, status: "submitted" }
      : view === "sent-back"
        ? { projectId, status: "draft" }
        : view === "approved"
          ? { projectId, status: "approved", from: since }
          : { projectId, from: since };
  const { data = [], isLoading, isError, refetch } = useDprRecordsQuery(params);
  const rows = useMemo(
    () => (view === "sent-back" ? data.filter((row) => row.reviewNote) : data).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [data, view],
  );

  const dpr = summary?.dpr;
  const tabs: { id: View; label: string }[] = [
    { id: "awaiting", label: `Awaiting approval${dpr?.awaitingApproval ? ` (${dpr.awaitingApproval})` : ""}` },
    { id: "sent-back", label: `Sent back${dpr?.sentBack ? ` (${dpr.sentBack})` : ""}` },
    { id: "approved", label: "Approved (30 days)" },
    { id: "recent", label: "All (30 days)" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <DashboardStatCard dense tone="warning" label="Awaiting approval" value={formatCompactCount(dpr?.awaitingApproval ?? 0)} icon={HourglassIcon} />
        <DashboardStatCard dense tone="success" label="Approved" value={formatCompactCount(dpr?.approved ?? 0)} icon={CheckCircleIcon} />
        <DashboardStatCard dense tone="danger" label="Sent back" value={formatCompactCount(dpr?.sentBack ?? 0)} icon={ArrowUUpLeftIcon} />
        <DashboardStatCard dense tone="info" label="Submitted this month" value={formatCompactCount(dpr?.submittedThisMonth ?? 0)} icon={ClipboardTextIcon} />
      </div>

      <UnderlineTabs items={tabs} active={view} onChange={(id) => setView(id as View)} />

      <section className="overflow-x-auto rounded-card border border-border bg-card shadow-card">
        {isLoading ? (
          <PageLoading className="min-h-24" />
        ) : isError ? (
          <EmptyState illustration="error" title="Couldn't load DPRs" action={{ label: "Retry", onClick: () => void refetch() }} />
        ) : rows.length ? (
          <DprTable rows={rows} planByKey={NO_PLANS} projectNameById={NO_NAMES} date={rows[0].date} showDate />
        ) : (
          <EmptyState
            illustration={view === "awaiting" ? "allClear" : "records"}
            title={
              view === "awaiting"
                ? "No DPRs waiting for approval"
                : view === "sent-back"
                  ? "No DPRs sent back"
                  : view === "approved"
                    ? "No DPRs approved in the last 30 days"
                    : "No DPRs in the last 30 days"
            }
          />
        )}
      </section>
    </div>
  );
}
