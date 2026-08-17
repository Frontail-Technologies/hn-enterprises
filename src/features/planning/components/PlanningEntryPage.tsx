"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { addDays, format, isToday, parseISO, subDays } from "date-fns";
import {
  ArrowSquareOutIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/shared/DatePicker";
import { PageShell } from "@/components/shared/PageShell";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnderlineTabs } from "@/components/shared/UnderlineTabs";
import { cn } from "@/lib/utils";
import { useDownloadDprPlanningSummary } from "@/features/exports/hooks/useExports";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { useRosterQuery } from "@/features/management/hooks/useAttendance";
import { useDprRecordsQuery, useSitePlansQuery } from "../hooks/usePlanning";
import type { DprRecord, DprTask, PlanTask, PlanningEntryRow, SitePlan } from "../types/planning.types";

type ViewTab = "overview" | "planning" | "dpr";

const TABS: Array<{ id: ViewTab; label: string }> = [
  { id: "overview", label: "Supervisor Overview" },
  { id: "planning", label: "Planning" },
  { id: "dpr", label: "DPR" },
];

const DPR_DONE_STATUSES = new Set(["Submitted", "Approved"]);

function isDprDone(status: PlanningEntryRow["dprStatus"]) {
  return DPR_DONE_STATUSES.has(status);
}

function taskSummary(tasks: PlanTask[]) {
  return tasks
    .filter((task) => task.qty.trim())
    .map((task) => `${task.label} (${task.qty})`)
    .join(", ");
}

function dprWorkSummary(tasks: DprTask[]) {
  return tasks
    .filter((task) => task.completedQty.trim())
    .map((task) => `${task.label} (${task.completedQty})`)
    .join(", ");
}

function customerLabel(name: string, trBpNo: string) {
  return trBpNo ? `${trBpNo} — ${name}` : name || "—";
}

// Done/Partial/Pending aren't part of the shared StatusBadge palette (they're
// derived, not a real record status), so this is a small local pill using the
// same visual language instead of stretching StatusBadge's status list.
function OverviewStatusPill({ status }: { status: "Done" | "Partial" | "Pending" }) {
  const classes =
    status === "Done"
      ? "bg-status-success-bg text-status-success-fg border-status-success/20"
      : status === "Partial"
        ? "bg-status-warning-bg text-status-warning-fg border-status-warning/20"
        : "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", classes)}>
      {status}
    </span>
  );
}

export function PlanningEntryPage() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [projectId, setProjectId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
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
  const sitePlans = sitePlansQuery.data ?? [];
  const dprRecords = dprRecordsQuery.data ?? [];
  const isLoading = sitePlansQuery.isLoading || dprRecordsQuery.isLoading;
  const isError = sitePlansQuery.isError || dprRecordsQuery.isError;

  const downloadSummary = useDownloadDprPlanningSummary();

  const rows = useMemo(() => {
    const map = new Map<string, PlanningEntryRow>();

    sitePlans.forEach((plan) => {
      map.set(`${plan.supervisorId}-${plan.customerId}`, {
        supervisorId: plan.supervisorId,
        supervisorName: plan.supervisorName,
        customerId: plan.customerId,
        customerName: plan.customerName,
        customerTrBpNo: plan.customerTrBpNo,
        projectId: plan.projectId,
        siteId: plan.siteId,
        siteArea: plan.siteLabel,
        planFiled: true,
        planTasks: plan.tasks,
        dprStatus: "Not Filed",
        dprRemarks: "",
      });
    });

    dprRecords.forEach((record) => {
      const key = `${record.supervisorId}-${record.customerId}`;
      const existing = map.get(key);
      if (existing) {
        existing.dprStatus = record.status;
        existing.dprRemarks = record.remarks;
      } else {
        map.set(key, {
          supervisorId: record.supervisorId,
          supervisorName: record.supervisorName,
          customerId: record.customerId,
          customerName: record.customerName,
          customerTrBpNo: record.customerTrBpNo,
          projectId: record.projectId,
          siteId: record.siteId,
          siteArea: record.siteLabel,
          planFiled: false,
          planTasks: [],
          dprStatus: record.status,
          dprRemarks: record.remarks,
        });
      }
    });

    return Array.from(map.values());
  }, [sitePlans, dprRecords]);

  const summary = useMemo(() => {
    const plannedWork = rows.filter((row) => row.planFiled).length;
    const dprSubmitted = rows.filter((row) => isDprDone(row.dprStatus)).length;
    const pending = rows.filter((row) => row.planFiled && !isDprDone(row.dprStatus)).length;
    const supervisorsCount = new Set(rows.map((row) => row.supervisorId)).size;
    return { plannedWork, dprSubmitted, pending, supervisorsCount };
  }, [rows]);

  const supervisorGroups = useMemo(() => {
    const groups = new Map<string, PlanningEntryRow[]>();
    rows.forEach((row) => {
      const current = groups.get(row.supervisorId) ?? [];
      current.push(row);
      groups.set(row.supervisorId, current);
    });

    return Array.from(groups.entries()).map(([id, group]) => {
      const planned = group.filter((row) => row.planFiled);
      const doneAmongPlanned = planned.filter((row) => isDprDone(row.dprStatus)).length;
      const pendingCount = planned.length - doneAmongPlanned;

      let status: "Done" | "Partial" | "Pending";
      if (planned.length === 0) {
        const doneAny = group.filter((row) => isDprDone(row.dprStatus)).length;
        status = doneAny === group.length ? "Done" : doneAny > 0 ? "Partial" : "Pending";
      } else if (pendingCount === 0) {
        status = "Done";
      } else if (doneAmongPlanned > 0) {
        status = "Partial";
      } else {
        status = "Pending";
      }

      return {
        supervisorId: id,
        supervisorName: group[0]?.supervisorName ?? "",
        rows: group,
        planned: planned.length,
        dprDone: doneAmongPlanned,
        pending: pendingCount,
        status,
      };
    });
  }, [rows]);

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

  const dprByKey = useMemo(() => {
    const map = new Map<string, DprRecord>();
    dprRecords.forEach((record) => map.set(`${record.supervisorId}-${record.customerId}`, record));
    return map;
  }, [dprRecords]);

  const planByKey = useMemo(() => {
    const map = new Map<string, SitePlan>();
    sitePlans.forEach((plan) => map.set(`${plan.supervisorId}-${plan.customerId}`, plan));
    return map;
  }, [sitePlans]);

  const isEmpty = !isLoading && !isError && rows.length === 0;

  return (
    <PageShell
      title="DPR / Planning"
      subtitle="Daily planning and field progress tracking."
      actions={
        <button
          type="button"
          className={buttonVariants({ variant: "outline", size: "default" })}
          disabled={downloadSummary.isPending}
          onClick={() => void downloadSummary.mutateAsync({ date, projectId: projectId || undefined, supervisorId: supervisorId || undefined })}
        >
          <DownloadSimpleIcon size={15} />
          {downloadSummary.isPending ? "Exporting..." : "Export Excel"}
        </button>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-card px-3 py-2.5">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Previous day"
              onClick={() => goToDate(format(subDays(parseISO(date), 1), "yyyy-MM-dd"))}
            >
              <CaretLeftIcon size={14} />
            </Button>
            <DatePicker value={date} onChange={goToDate} className="h-8 w-40" />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Next day"
              onClick={() => goToDate(format(addDays(parseISO(date), 1), "yyyy-MM-dd"))}
            >
              <CaretRightIcon size={14} />
            </Button>
            {!isToday(parseISO(date)) ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => goToDate(format(new Date(), "yyyy-MM-dd"))}
              >
                <CalendarBlankIcon size={13} />
                Today
              </Button>
            ) : null}
          </div>

          <SearchableSelect
            value={projectId || ""}
            onValueChange={setProjectId}
            placeholder="All Projects"
            className="h-8 w-48"
            options={[{ value: "", label: "All Projects" }, ...projects.map((project) => ({ value: project.id, label: project.name }))]}
          />
          <SearchableSelect
            value={supervisorId || ""}
            onValueChange={setSupervisorId}
            placeholder="All Supervisors"
            className="h-8 w-48"
            options={[{ value: "", label: "All Supervisors" }, ...supervisors.map((sup) => ({ value: sup.id, label: sup.name }))]}
          />
        </div>

        <SummaryStrip
          plannedWork={summary.plannedWork}
          dprSubmitted={summary.dprSubmitted}
          pending={summary.pending}
          supervisors={summary.supervisorsCount}
        />

        <UnderlineTabs items={TABS} active={activeTab} onChange={(id) => setActiveTab(id as ViewTab)} />

        <section className="overflow-hidden rounded-lg border border-border/70 bg-card">
          {isLoading ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">Loading...</p>
          ) : isError ? (
            <div className="flex items-center justify-between gap-2 px-3 py-6">
              <p className="text-sm text-destructive">Unable to load planning data for this date.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void sitePlansQuery.refetch();
                  void dprRecordsQuery.refetch();
                }}
              >
                Retry
              </Button>
            </div>
          ) : isEmpty ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No planning or DPR records for {format(parseISO(date), "dd MMM yyyy")}.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Try another date.</p>
            </div>
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

function SummaryStrip({
  plannedWork,
  dprSubmitted,
  pending,
  supervisors,
}: {
  plannedWork: number;
  dprSubmitted: number;
  pending: number;
  supervisors: number;
}) {
  const items = [
    { label: "Planned Work", value: plannedWork },
    { label: "DPR Submitted", value: dprSubmitted },
    { label: "Pending", value: pending },
    { label: "Supervisors", value: supervisors },
  ];

  return (
    <div className="grid grid-cols-2 divide-x divide-border rounded-lg border border-border/70 bg-card sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="px-4 py-2.5">
          <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
          <p className="text-lg font-semibold tabular-nums text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function SupervisorOverviewTable({
  groups,
  expanded,
  onToggle,
  date,
}: {
  groups: Array<{
    supervisorId: string;
    supervisorName: string;
    rows: PlanningEntryRow[];
    planned: number;
    dprDone: number;
    pending: number;
    status: "Done" | "Partial" | "Pending";
  }>;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  date: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="bg-secondary/85 text-xs font-semibold text-muted-foreground">
            <th className="w-8 border border-border/60 px-2 py-2" />
            <th className="border border-border/60 px-3 py-2 text-left">Supervisor</th>
            <th className="border border-border/60 px-3 py-2 text-left">Sites Touched</th>
            <th className="w-24 border border-border/60 px-3 py-2 text-right">Planned</th>
            <th className="w-24 border border-border/60 px-3 py-2 text-right">DPR Done</th>
            <th className="w-24 border border-border/60 px-3 py-2 text-right">Pending</th>
            <th className="w-28 border border-border/60 px-3 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            const isOpen = expanded.has(group.supervisorId);
            return (
              <Fragment key={group.supervisorId}>
                <tr
                  className="cursor-pointer bg-card hover:bg-muted/25"
                  onClick={() => onToggle(group.supervisorId)}
                >
                  <td className="border border-border/55 px-2 py-2 text-center">
                    <CaretDownIcon size={13} className={cn("mx-auto transition-transform text-muted-foreground", isOpen && "rotate-180")} />
                  </td>
                  <td className="border border-border/55 px-3 py-2 font-semibold text-foreground">{group.supervisorName}</td>
                  <td className="border border-border/55 px-3 py-2 text-muted-foreground">{group.rows.length}</td>
                  <td className="border border-border/55 px-3 py-2 text-right tabular-nums">{group.planned}</td>
                  <td className="border border-border/55 px-3 py-2 text-right tabular-nums">{group.dprDone}</td>
                  <td className="border border-border/55 px-3 py-2 text-right tabular-nums">{group.pending}</td>
                  <td className="border border-border/55 px-3 py-2">
                    <OverviewStatusPill status={group.status} />
                  </td>
                </tr>
                {isOpen ? (
                  <tr key={`${group.supervisorId}-detail`}>
                    <td colSpan={7} className="border border-border/55 bg-muted/20 p-0">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="text-[11px] font-semibold text-muted-foreground">
                            <th className="border-b border-border/50 px-3 py-1.5 text-left">Customer / BP</th>
                            <th className="border-b border-border/50 px-3 py-1.5 text-left">Site</th>
                            <th className="border-b border-border/50 px-3 py-1.5 text-left">Planned Work</th>
                            <th className="border-b border-border/50 px-3 py-1.5 text-left">DPR Status</th>
                            <th className="border-b border-border/50 px-3 py-1.5 text-left">Remarks</th>
                            <th className="border-b border-border/50 px-3 py-1.5 text-left">Open</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.rows.map((row) => {
                            const summary = taskSummary(row.planTasks);
                            const linkParams = `supervisorId=${row.supervisorId}&customerId=${row.customerId}&date=${date}`;
                            return (
                              <tr key={row.customerId} className="hover:bg-muted/30">
                                <td className="border-b border-border/40 px-3 py-1.5 font-medium text-foreground">
                                  {customerLabel(row.customerName, row.customerTrBpNo)}
                                </td>
                                <td className="border-b border-border/40 px-3 py-1.5 text-muted-foreground">{row.siteArea || "—"}</td>
                                <td className="max-w-[260px] truncate border-b border-border/40 px-3 py-1.5 text-muted-foreground" title={summary}>
                                  {summary || "—"}
                                </td>
                                <td className="border-b border-border/40 px-3 py-1.5">
                                  <StatusBadge status={row.dprStatus} />
                                </td>
                                <td className="max-w-[220px] truncate border-b border-border/40 px-3 py-1.5 text-muted-foreground" title={row.dprRemarks}>
                                  {row.dprRemarks || "—"}
                                </td>
                                <td className="border-b border-border/40 px-3 py-1.5">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`/planning/plan?${linkParams}`}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                    >
                                      Plan <ArrowSquareOutIcon size={12} />
                                    </Link>
                                    <Link
                                      href={`/planning/dpr?${linkParams}`}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                    >
                                      DPR <ArrowSquareOutIcon size={12} />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlanningTable({
  rows,
  dprByKey,
  projectNameById,
  date,
}: {
  rows: SitePlan[];
  dprByKey: Map<string, DprRecord>;
  projectNameById: Map<string, string>;
  date: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="bg-secondary/85 text-xs font-semibold text-muted-foreground">
            <th className="border border-border/60 px-3 py-2 text-left">Supervisor</th>
            <th className="border border-border/60 px-3 py-2 text-left">Project</th>
            <th className="border border-border/60 px-3 py-2 text-left">Site</th>
            <th className="border border-border/60 px-3 py-2 text-left">Customer / BP</th>
            <th className="border border-border/60 px-3 py-2 text-left">Planned Work</th>
            <th className="w-32 border border-border/60 px-3 py-2 text-left">Status</th>
            <th className="w-16 border border-border/60 px-3 py-2 text-left">Open</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const summary = taskSummary(row.tasks);
            const matchedDpr = dprByKey.get(`${row.supervisorId}-${row.customerId}`);
            const done = matchedDpr && DPR_DONE_STATUSES.has(matchedDpr.status);
            return (
              <tr key={row.id} className="bg-card hover:bg-muted/25">
                <td className="border border-border/55 px-3 py-2 font-medium text-foreground">{row.supervisorName}</td>
                <td className="border border-border/55 px-3 py-2 text-muted-foreground">{projectNameById.get(row.projectId) ?? "—"}</td>
                <td className="border border-border/55 px-3 py-2 text-muted-foreground">{row.siteLabel || "—"}</td>
                <td className="border border-border/55 px-3 py-2 text-foreground">{customerLabel(row.customerName, row.customerTrBpNo)}</td>
                <td className="max-w-[280px] truncate border border-border/55 px-3 py-2 text-muted-foreground" title={summary}>
                  {summary || "—"}
                </td>
                <td className="border border-border/55 px-3 py-2">
                  <StatusBadge status={done ? "Completed" : matchedDpr ? "In Progress" : "Pending"} />
                </td>
                <td className="border border-border/55 px-3 py-2">
                  <Link
                    href={`/planning/plan?supervisorId=${row.supervisorId}&customerId=${row.customerId}&date=${date}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Open <ArrowSquareOutIcon size={12} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DprTable({
  rows,
  planByKey,
  projectNameById,
  date,
}: {
  rows: DprRecord[];
  planByKey: Map<string, SitePlan>;
  projectNameById: Map<string, string>;
  date: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] border-collapse text-sm">
        <thead>
          <tr className="bg-secondary/85 text-xs font-semibold text-muted-foreground">
            <th className="border border-border/60 px-3 py-2 text-left">Supervisor</th>
            <th className="border border-border/60 px-3 py-2 text-left">Project</th>
            <th className="border border-border/60 px-3 py-2 text-left">Site</th>
            <th className="border border-border/60 px-3 py-2 text-left">Customer / BP</th>
            <th className="border border-border/60 px-3 py-2 text-left">Work Done</th>
            <th className="w-24 border border-border/60 px-3 py-2 text-center">Progress</th>
            <th className="w-28 border border-border/60 px-3 py-2 text-left">Status</th>
            <th className="border border-border/60 px-3 py-2 text-left">Remarks</th>
            <th className="w-16 border border-border/60 px-3 py-2 text-left">Open</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const summary = dprWorkSummary(row.tasks);
            const completed = row.tasks.filter((task) => task.completedQty.trim()).length;
            const hasMatchingPlan = planByKey.has(`${row.supervisorId}-${row.customerId}`);
            return (
              <tr key={row.id} className="bg-card hover:bg-muted/25">
                <td className="border border-border/55 px-3 py-2 font-medium text-foreground">{row.supervisorName}</td>
                <td className="border border-border/55 px-3 py-2 text-muted-foreground">{projectNameById.get(row.projectId) ?? "—"}</td>
                <td className="border border-border/55 px-3 py-2 text-muted-foreground">{row.siteLabel || "—"}</td>
                <td className="border border-border/55 px-3 py-2 text-foreground">{customerLabel(row.customerName, row.customerTrBpNo)}</td>
                <td className="max-w-[260px] truncate border border-border/55 px-3 py-2 text-muted-foreground" title={summary}>
                  {summary || "—"}
                </td>
                <td className="border border-border/55 px-3 py-2 text-center tabular-nums text-muted-foreground">
                  {completed}/{row.tasks.length}
                </td>
                <td className="border border-border/55 px-3 py-2">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={row.status} />
                    {!hasMatchingPlan ? <span className="text-[11px] text-muted-foreground">No matching plan</span> : null}
                  </div>
                </td>
                <td className="max-w-[220px] truncate border border-border/55 px-3 py-2 text-muted-foreground" title={row.remarks}>
                  {row.remarks || "—"}
                </td>
                <td className="border border-border/55 px-3 py-2">
                  <Link
                    href={`/planning/dpr?supervisorId=${row.supervisorId}&customerId=${row.customerId}&date=${date}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Open <ArrowSquareOutIcon size={12} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
