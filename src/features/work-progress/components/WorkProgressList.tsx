"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  ClockCounterClockwiseIcon,
  EyeIcon,
  FileImageIcon,
  NotePencilIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
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

const initialFilters = {
  search: "",
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
  const [filters, setFilters] = useState({
    ...initialFilters,
    customerId: initialCustomerId ?? "",
    project: initialProjectId ?? "all",
  });

  const filteredRecords = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return workProgressRecords.filter((record) => {
      const matchesSearch =
        !search ||
        record.customerName.toLowerCase().includes(search) ||
        record.bpTrNumber.toLowerCase().includes(search) ||
        record.projectName.toLowerCase().includes(search);
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
        matchesSearch &&
        matchesProject &&
        matchesCustomer &&
        matchesSite &&
        matchesSupervisor &&
        matchesStage
      );
    });
  }, [filters]);

  const pagination = usePagination({ items: filteredRecords, pageSize: 8 });

  const columns: ColumnDef<WorkProgressRecord>[] = [
    {
      key: "customer",
      header: "Customer / BP No.",
      className: "w-[14%] whitespace-normal",
      render: (record) => (
        <div>
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
      className: "w-[14%] whitespace-normal",
      render: (record) => (
        <div>
          <p className="font-medium text-foreground">{record.siteArea}</p>
          <p className="text-xs text-muted-foreground">{record.projectName}</p>
        </div>
      ),
    },
    {
      key: "stageSummary",
      header: "Stage Summary",
      className: "w-[17%] whitespace-normal",
      render: (record) => (
        <StageWorkflow currentStage={record.currentStage} currentStatus={record.status} />
      ),
    },
    {
      key: "nextRequiredAction",
      header: "Next Required Action",
      className: "w-[16%] whitespace-normal",
      render: (record) => (
        <div>
          <p className="font-semibold text-foreground">{record.nextRequiredAction}</p>
          <p className="text-xs text-muted-foreground">
            Expected: {record.expectedNextStage}
          </p>
        </div>
      ),
    },
    {
      key: "stageDate",
      header: "Stage Date",
      className: "w-[9%] whitespace-normal",
      render: (record) => formatDate(record.stageDate),
    },
    {
      key: "ageDays",
      header: "Delay",
      className: "w-[7%] whitespace-normal",
      render: (record) => (
        <span
          className={cn(
            "font-bold",
            record.ageDays > 5 ? "text-destructive" : "text-primary",
          )}
        >
          {record.ageDays} days
        </span>
      ),
    },
    {
      key: "supervisor",
      header: "Supervisor",
      className: "w-[12%] whitespace-normal",
      render: (record) => (
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
            {getInitials(record.supervisor)}
          </span>
          <span className="min-w-0 font-medium text-foreground">{record.supervisor}</span>
        </div>
      ),
    },
    {
      key: "evidence",
      header: "Evidence",
      className: "w-[6%] whitespace-normal",
      render: (record) => (
        <Link
          href={`/documents?workProgressId=${record.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary"
        >
          <FileImageIcon size={14} className="text-primary" />
          {record.evidenceCount}
        </Link>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[8%]",
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
              href={`/work-progress/${record.id}/history`}
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
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Work Progress</h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Track field stage updates, photos and customer work history.
        </p>
      </header>

      <section className="rounded-xl border border-border/60 bg-card">
        <div className="space-y-3 p-3">
          <FilterSheetButton
            searchKey="search"
            searchPlaceholder="Search customer, BP/TR no..."
            title="Work Progress Filters"
            description="Filter field progress by project, site, supervisor and stage."
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
            variant="default"
            emptyTitle="No work items in this queue"
            emptyDescription="Try another queue view or adjust the filters."
            serialNumberStart={pagination.startItem}
            tableClassName="table-fixed"
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
      </section>
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
    <div className="grid grid-cols-3 gap-1 xl:grid-cols-6">
      {workStages.map((stage, index) => {
        const complete = index < currentIndex;
        const current = index === currentIndex;
        const status = complete ? getCompletedStatus(stage) : current ? currentStatus : "Pending";

        return (
          <span
            key={stage}
            title={`${stage}: ${status}`}
            className={cn(
              "flex size-6 items-center justify-center rounded-full border text-[9px] font-bold",
              current
                ? "border-destructive bg-destructive/10 text-destructive"
                : complete
                  ? "border-status-success/30 bg-status-success-bg text-status-success-fg"
                  : "border-border bg-muted text-muted-foreground",
            )}
          >
            {shortStageLabel(stage)}
          </span>
        );
      })}
    </div>
  );
}

function getCompletedStatus(stage: WorkStage) {
  return stage === "Workable" ? "Workable" : "Completed";
}

function shortStageLabel(stage: WorkStage) {
  if (stage === "Survey") return "45";
  if (stage === "Workable") return "WK";
  if (stage === "Plumbing / GI") return "GI";
  if (stage === "Commissioning") return "CM";
  if (stage === "Conversion") return "CV";
  return "GC";
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function formatDate(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}
