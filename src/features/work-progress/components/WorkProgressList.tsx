"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  ClockCounterClockwiseIcon,
  EyeIcon,
  ImagesSquareIcon,
  NotePencilIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { cn } from "@/lib/utils";
import {
  workProgressProjectOptions,
  workProgressRecords,
  workProgressSiteOptions,
  workProgressSupervisorOptions,
  workStages,
} from "../services/work-progress.service";
import type { WorkProgressRecord, WorkStage } from "../types/work-progress.types";

const queueViews = ["Needs Action", "In Progress", "Recently Completed"] as const;
type QueueView = (typeof queueViews)[number];

const initialFilters = {
  customerId: "",
  project: "all",
  site: "all",
  supervisor: "all",
  stage: "all",
};

interface WorkProgressListProps {
  initialProjectId?: string;
  initialCustomerId?: string;
}

export function WorkProgressList({
  initialProjectId,
  initialCustomerId,
}: WorkProgressListProps = {}) {
  const [activeView, setActiveView] = useState<QueueView>("Needs Action");
  const [filters, setFilters] = useState({
    ...initialFilters,
    customerId: initialCustomerId ?? "",
    project: initialProjectId ?? "all",
  });

  const filteredRecords = useMemo(() => {
    return workProgressRecords.filter((record) => {
      const matchesView = getRecordView(record) === activeView;
      const matchesProject =
        filters.project === "all" || record.projectId === filters.project;
      const matchesCustomer =
        !filters.customerId || record.customerId === filters.customerId;
      const matchesSite = filters.site === "all" || record.siteArea === filters.site;
      const matchesSupervisor =
        filters.supervisor === "all" || record.supervisor === filters.supervisor;
      const matchesStage =
        filters.stage === "all" || record.currentStage === filters.stage;

      return (
        matchesView &&
        matchesProject &&
        matchesCustomer &&
        matchesSite &&
        matchesSupervisor &&
        matchesStage
      );
    });
  }, [activeView, filters]);

  const viewCounts = useMemo(
    () =>
      queueViews.reduce(
        (counts, view) => ({
          ...counts,
          [view]: workProgressRecords.filter((record) => getRecordView(record) === view)
            .length,
        }),
        {} as Record<QueueView, number>,
      ),
    [],
  );

  const pagination = usePagination({ items: filteredRecords, pageSize: 8 });

  const columns: ColumnDef<WorkProgressRecord>[] = [
    {
      key: "customer",
      header: "Customer / BP No.",
      render: (record) => (
        <div className="min-w-44">
          <Link
            href={`/work-progress/${record.id}`}
            className="font-bold text-foreground hover:text-primary"
          >
            {record.customerName}
          </Link>
          <p className="text-xs font-semibold text-muted-foreground">{record.bpTrNumber}</p>
        </div>
      ),
    },
    {
      key: "site",
      header: "Site",
      render: (record) => (
        <div className="min-w-44">
          <p className="font-medium text-foreground">{record.siteArea}</p>
          <p className="text-xs text-muted-foreground">{record.projectName}</p>
        </div>
      ),
    },
    {
      key: "stageSummary",
      header: "Stage Summary",
      className: "min-w-[28rem]",
      render: (record) => (
        <StageWorkflow currentStage={record.currentStage} currentStatus={record.status} />
      ),
    },
    {
      key: "nextRequiredAction",
      header: "Next Required Action",
      render: (record) => (
        <div className="min-w-44">
          <p className="font-bold text-foreground">{record.nextRequiredAction}</p>
          <p className="text-xs text-muted-foreground">
            Expected: {record.expectedNextStage}
          </p>
        </div>
      ),
    },
    {
      key: "stageDate",
      header: "Stage Date",
      render: (record) => formatDate(record.stageDate),
    },
    {
      key: "ageDays",
      header: "Delay / Age",
      render: (record) => (
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-xs font-bold",
            record.ageDays > 5
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {record.ageDays} days
        </span>
      ),
    },
    { key: "supervisor", header: "Supervisor" },
    {
      key: "evidence",
      header: "Evidence",
      render: (record) => (
        <Link
          href={`/documents?workProgressId=${record.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1 text-xs font-bold text-foreground hover:border-primary/35 hover:text-primary"
        >
          <ImagesSquareIcon size={14} />
          {record.evidenceCount}
        </Link>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (record) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="View">
            <Link
              href={`/work-progress/${record.id}`}
              aria-label="View progress"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="Update Stage">
            <Link
              href={`/work-progress/${record.id}/update`}
              aria-label="Update stage"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <NotePencilIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="View History">
            <Link
              href={`/work-progress/${record.id}#history`}
              aria-label="View history"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <ClockCounterClockwiseIcon size={15} />
            </Link>
          </ActionTooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Work Progress"
        subtitle="Queue field work by stage, action needed, evidence and ageing."
      />

      <div className="space-y-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {queueViews.map((view) => {
            const active = activeView === view;
            return (
              <button
                key={view}
                type="button"
                onClick={() => {
                  setActiveView(view);
                  pagination.setPage(1);
                }}
                className={cn(
                  "inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition-colors",
                  active
                    ? "border-primary/35 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {view}
                <span className="rounded-full bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {viewCounts[view]}
                </span>
              </button>
            );
          })}
        </div>

        <FilterBar
          values={filters}
          filters={[
            { key: "project", placeholder: "All Projects", options: workProgressProjectOptions },
            {
              key: "site",
              placeholder: "All Sites",
              options: workProgressSiteOptions.map((site) => ({ label: site, value: site })),
            },
            {
              key: "supervisor",
              placeholder: "All Supervisors",
              options: workProgressSupervisorOptions.map((supervisor) => ({
                label: supervisor,
                value: supervisor,
              })),
            },
            {
              key: "stage",
              placeholder: "All Stages",
              options: workStages.map((stage) => ({ label: stage, value: stage })),
            },
          ]}
          onChange={(key, value) => {
            setFilters((current) => ({ ...current, [key]: value }));
            pagination.setPage(1);
          }}
          onReset={() => {
            setFilters({
              ...initialFilters,
              customerId: initialCustomerId ?? "",
              project: initialProjectId ?? "all",
            });
            pagination.setPage(1);
          }}
        />

        <DataTable
          data={pagination.paginatedItems}
          columns={columns}
          variant="striped"
          emptyTitle="No work items in this queue"
          emptyDescription="Try another queue view or adjust the filters."
          serialNumberStart={pagination.startItem}
        />

        <Pagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          totalItems={pagination.totalItems}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          onPageChange={pagination.setPage}
        />
      </div>
    </div>
  );
}

function StageWorkflow({
  currentStage,
  currentStatus,
}: {
  currentStage: WorkStage;
  currentStatus: string;
}) {
  const currentIndex = workStages.indexOf(currentStage);

  return (
    <div className="grid min-w-[27rem] grid-cols-6 gap-1.5">
      {workStages.map((stage, index) => {
        const complete = index < currentIndex;
        const current = index === currentIndex;
        const status = complete ? getCompletedStatus(stage) : current ? currentStatus : "Pending";

        return (
          <div
            key={stage}
            title={`${stage}: ${status}`}
            className={cn(
              "rounded-lg border px-2 py-1.5",
              current
                ? "border-primary/35 bg-primary/10"
                : complete
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-muted/35",
            )}
          >
            <p
              className={cn(
                "truncate text-[11px] font-bold",
                current || complete ? "text-primary" : "text-muted-foreground",
              )}
            >
              {shortStageLabel(stage)}
            </p>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-muted-foreground">
              {status}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function getCompletedStatus(stage: WorkStage) {
  return stage === "Workable" ? "Workable" : "Completed";
}

function shortStageLabel(stage: WorkStage) {
  if (stage === "Plumbing / GI") return "GI";
  if (stage === "Commissioning") return "Comm.";
  return stage;
}

function getRecordView(record: WorkProgressRecord): QueueView {
  if (record.status === "Completed") return "Recently Completed";
  if (record.status === "In Progress") return "In Progress";
  return "Needs Action";
}

function formatDate(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}
