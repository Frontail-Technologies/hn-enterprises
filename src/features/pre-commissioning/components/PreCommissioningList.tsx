"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { CheckCircleIcon, EyeIcon, HourglassMediumIcon, WarningIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePagination } from "@/lib/hooks/usePagination";
import {
  preCommissioningAssignedOptions,
  preCommissioningProjectOptions,
  preCommissioningRecords,
  preCommissioningStatuses,
} from "../services/pre-commissioning.service";
import { PreCommissioningRecordSheet } from "./PreCommissioningRecordSheet";
import type {
  PreCommissioningRecord,
  PreCommissioningStatus,
} from "../types/pre-commissioning.types";

const initialFilters = {
  search: "",
  project: "all",
  assignedPerson: "all",
  status: "all",
};

export function PreCommissioningList() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredRecords = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return preCommissioningRecords.filter((record) => {
      const matchesSearch =
        !search ||
        record.customerName.toLowerCase().includes(search) ||
        record.bpTrNumber.toLowerCase().includes(search) ||
        record.referenceNo.toLowerCase().includes(search);
      const matchesProject =
        filters.project === "all" || record.projectName === filters.project;
      const matchesAssigned =
        filters.assignedPerson === "all" ||
        record.assignedPerson === filters.assignedPerson;
      const matchesStatus =
        filters.status === "all" || record.status === filters.status;

      return matchesSearch && matchesProject && matchesAssigned && matchesStatus;
    });
  }, [filters]);

  const pagination = usePagination({ items: filteredRecords, pageSize: 8 });

  const columns: ColumnDef<PreCommissioningRecord>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (record) => (
        <Link
          href={`/pre-commissioning/${record.id}`}
          className="font-bold text-foreground hover:text-primary"
        >
          {record.customerName}
        </Link>
      ),
    },
    { key: "bpTrNumber", header: "BP/TR Number" },
    {
      key: "projectSite",
      header: "Project/Site",
      render: (record) => (
        <div>
          <p className="font-semibold text-foreground">{record.projectName}</p>
          <p className="text-xs font-medium text-muted-foreground">{record.siteArea}</p>
        </div>
      ),
    },
    {
      key: "checklist",
      header: "Checklist Completion",
      render: (record) => (
        <div className="min-w-32">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-foreground">
            <span>
              {record.checklistDone}/{record.checklistTotal}
            </span>
            <span>{Math.round((record.checklistDone / record.checklistTotal) * 100)}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${(record.checklistDone / record.checklistTotal) * 100}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    { key: "assignedPerson", header: "Assigned Person" },
    {
      key: "status",
      header: "Status",
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: "updatedDate",
      header: "Updated Date",
      render: (record) => formatDateTime(record.updatedDate),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (record) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="View pre-commissioning">
            <Link
              href={`/pre-commissioning/${record.id}`}
              aria-label="View pre-commissioning"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
          <PreCommissioningRecordSheet record={record} mode="edit" iconOnly />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pre-Commissioning
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground">
            Track post-GC readiness checks before commissioning.
          </p>
        </div>
        <PreCommissioningRecordSheet mode="add" />
      </header>

      <div className="flex flex-wrap gap-2.5">
        <SummaryStat label="Pending" value={countStatus("Pending")} icon={<WarningIcon size={17} />} />
        <SummaryStat label="In Review" value={countStatus("In Review")} icon={<HourglassMediumIcon size={17} />} />
        <SummaryStat label="Approved" value={countStatus("Approved")} icon={<CheckCircleIcon size={17} />} />
      </div>

      <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="space-y-3 p-4">
          <FilterSheetButton
            searchKey="search"
            searchPlaceholder="Search customer, BP/TR or reference..."
            title="Pre-Commissioning Filters"
            description="Filter readiness checks by project, assignee and status."
            values={filters}
            filters={[
              {
                key: "project",
                placeholder: "All Projects",
                options: preCommissioningProjectOptions,
              },
              {
                key: "assignedPerson",
                placeholder: "All Assigned",
                options: preCommissioningAssignedOptions,
              },
              {
                key: "status",
                placeholder: "All Statuses",
                options: preCommissioningStatuses.map((status) => ({
                  label: status,
                  value: status,
                })),
              },
            ]}
            onChange={(key, value) => {
              setFilters((current) => ({ ...current, [key]: value }));
              pagination.setPage(1);
            }}
            onReset={() => {
              setFilters(initialFilters);
              pagination.setPage(1);
            }}
          />

          <DataTable
            data={pagination.paginatedItems}
            columns={columns}
            serialNumberStart={pagination.startItem}
            emptyTitle="No pre-commissioning records found"
            emptyDescription="Try changing filters or check back after GC completion."
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

function SummaryStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex h-24 w-full min-w-32 max-w-44 flex-col justify-between rounded-xl border border-border/70 bg-card p-3 sm:w-40">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold leading-4 text-muted-foreground">{label}</p>
        <span className="rounded-lg bg-primary/10 p-1.5 text-primary">{icon}</span>
      </div>
      <p className="text-xl font-bold leading-tight text-foreground">{value}</p>
    </div>
  );
}

function countStatus(status: PreCommissioningStatus) {
  return preCommissioningRecords.filter((record) => record.status === status).length;
}

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
