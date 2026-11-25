"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarCheckIcon,
  ClipboardTextIcon,
  DownloadSimpleIcon,
  HourglassIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CompactStatGrid } from "@/components/shared/CompactStatGrid";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { DatePicker } from "@/components/shared/DatePicker";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoading } from "@/components/shared/PageLoading";
import { PageShell } from "@/components/shared/PageShell";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { formatCompactCount } from "@/lib/format";
import { useDownloadDprPlanningSummary } from "@/features/exports/hooks/useExports";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { useRosterQuery } from "@/features/management/hooks/useAttendance";
import { useDprRecordsQuery, useSitePlansQuery } from "../hooks/usePlanning";
import {
  buildDprByKey,
  buildPlanByKey,
  buildPlanningEntryRows,
  buildPlanningSummary,
  buildSupervisorGroups,
} from "../model/planning-entry.rules";
import { SupervisorOverviewTable } from "./SupervisorOverviewTable";
import { PlanningTable } from "./PlanningTable";
import { DprTable } from "./DprTable";
import { projectOption } from "@/features/projects/utils/project-option";
import { useUrlTab } from "@/hooks/useUrlTab";

type ViewTab = "overview" | "planning" | "dpr";

const TABS: Array<{ id: ViewTab; label: string }> = [
  { id: "overview", label: "Supervisor Overview" },
  { id: "planning", label: "Planning" },
  { id: "dpr", label: "DPR" },
];

export function PlanningEntryPage() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [projectId, setProjectId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [activeTab, setActiveTab] = useUrlTab<ViewTab>(["overview", "planning", "dpr"], "overview");
  const [expandedSupervisors, setExpandedSupervisors] = useState<Set<string>>(new Set());

  const { data: projects = [] } = useProjectsQuery();
  const { data: supervisors = [] } = useRosterQuery("supervisor");
  const projectNameById = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);

  const queryParams = useMemo(
    () => ({ date, projectId: projectId || undefined, supervisorId: supervisorId || undefined }),
    [date, projectId, supervisorId],
  );

  const sitePlansQuery = useSitePlansQuery(queryParams);
  const dprRecordsQuery = useDprRecordsQuery(queryParams);
  const sitePlans = useMemo(() => sitePlansQuery.data ?? [], [sitePlansQuery.data]);
  const dprRecords = useMemo(() => dprRecordsQuery.data ?? [], [dprRecordsQuery.data]);
  const isLoading = sitePlansQuery.isLoading || dprRecordsQuery.isLoading;
  const isError = sitePlansQuery.isError || dprRecordsQuery.isError;

  const downloadSummary = useDownloadDprPlanningSummary();

  const rows = useMemo(() => buildPlanningEntryRows(sitePlans, dprRecords), [sitePlans, dprRecords]);
  const summary = useMemo(() => buildPlanningSummary(rows), [rows]);
  const supervisorGroups = useMemo(() => buildSupervisorGroups(rows), [rows]);
  const dprByKey = useMemo(() => buildDprByKey(dprRecords), [dprRecords]);
  const planByKey = useMemo(() => buildPlanByKey(sitePlans), [sitePlans]);

  function toggleSupervisor(id: string) {
    setExpandedSupervisors((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function goToDate(nextDate: string) {
    setDate(nextDate);
  }

  const isEmpty = !isLoading && !isError && rows.length === 0;

  return (
    <PageShell
      title="DPR / Planning"
      description="Planned work and daily progress reports by supervisor for one day."
      actions={
        <>
          <DatePicker value={date} onChange={goToDate} className="h-8 w-full sm:w-44" />

          <div className="grid grid-cols-2 gap-2 sm:contents [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
            <SearchableSelect
              value={projectId || "all"}
              onValueChange={(value) => setProjectId(value === "all" ? "" : value)}
              options={[{ value: "all", label: "All projects" }, ...projects.map(projectOption)]}
              placeholder="All projects"
              searchPlaceholder="Search projects..."
              className="h-8 w-full text-[13px] sm:w-48"
            />
            <SearchableSelect
              value={supervisorId || "all"}
              onValueChange={(value) => setSupervisorId(value === "all" ? "" : value)}
              options={[{ value: "all", label: "All supervisors" }, ...supervisors.map((sup) => ({ value: sup.id, label: sup.name }))]}
              placeholder="All supervisors"
              searchPlaceholder="Search supervisors..."
              className="h-8 w-full text-[13px] sm:w-44"
            />

            <Button
              type="button"
              variant="outline"
              size="compact"
              disabled={downloadSummary.isPending}
              onClick={() =>
                void downloadSummary.mutateAsync({ date, projectId: projectId || undefined, supervisorId: supervisorId || undefined })
              }
            >
              <DownloadSimpleIcon size={12} />
              {downloadSummary.isPending ? "Exporting..." : "Export"}
            </Button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        <CompactStatGrid columns={4}>
          <DashboardStatCard label="Planned Work" value={formatCompactCount(summary.plannedWork)} icon={ClipboardTextIcon} tone="info" dense />
          <DashboardStatCard label="DPR Submitted" value={formatCompactCount(summary.dprSubmitted)} icon={CalendarCheckIcon} tone="success" dense />
          <DashboardStatCard label="Pending" value={formatCompactCount(summary.pending)} icon={HourglassIcon} tone="warning" dense />
          <DashboardStatCard label="Supervisors" value={formatCompactCount(summary.supervisorsCount)} icon={UsersThreeIcon} tone="primary" dense />
        </CompactStatGrid>

        <UnderlineTabs items={TABS} active={activeTab} onChange={(id) => setActiveTab(id as ViewTab)} />

        <section className="overflow-hidden rounded-card border border-border bg-card shadow-card">
          {isLoading ? (
            <PageLoading className="min-h-24" />
          ) : isError ? (
            <EmptyState
              illustration="error"
              title="Couldn't load planning data for this date"
              description="Check your connection and try again."
              action={{
                label: "Retry",
                onClick: () => {
                  void sitePlansQuery.refetch();
                  void dprRecordsQuery.refetch();
                },
              }}
            />
          ) : isEmpty ? (
            <EmptyState
              illustration="calendar"
              title={`No planning or DPR records for ${format(parseISO(date), "dd MMM yyyy")}`}
              description={projectId || supervisorId ? "Try another day or clear the project / supervisor filter." : "Pick another day to see its plans and reports."}
            />
          ) : activeTab === "overview" ? (
            <SupervisorOverviewTable
              groups={supervisorGroups}
              expanded={expandedSupervisors}
              onToggle={toggleSupervisor}
              date={date}
            />
          ) : activeTab === "planning" ? (
            <PlanningTable rows={sitePlans} dprByKey={dprByKey} projectNameById={projectNameById} date={date} />
          ) : (
            <DprTable rows={dprRecords} planByKey={planByKey} projectNameById={projectNameById} date={date} />
          )}
        </section>
      </div>
    </PageShell>
  );
}
