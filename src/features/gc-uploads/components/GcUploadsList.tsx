"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  EyeIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePagination } from "@/lib/hooks/usePagination";
import {
  gcProjectOptions,
  gcReviewerOptions,
  gcSiteOptions,
  gcUploadRecords,
  gcUploadStatuses,
} from "../services/gc-uploads.service";
import type { GcUploadRecord } from "../types/gc-uploads.types";

const initialFilters = {
  search: "",
  project: "all",
  site: "all",
  status: "all",
  reviewer: "all",
};

export function GcUploadsList() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredRecords = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return gcUploadRecords.filter((record) => {
      const matchesSearch =
        !search ||
        record.customerName.toLowerCase().includes(search) ||
        record.bpTrNumber.toLowerCase().includes(search) ||
        record.submissionId.toLowerCase().includes(search);
      const matchesProject =
        filters.project === "all" || record.projectId === filters.project;
      const matchesSite = filters.site === "all" || record.siteArea === filters.site;
      const matchesStatus = filters.status === "all" || record.status === filters.status;
      const matchesReviewer =
        filters.reviewer === "all" || record.reviewer === filters.reviewer;

      return (
        matchesSearch &&
        matchesProject &&
        matchesSite &&
        matchesStatus &&
        matchesReviewer
      );
    });
  }, [filters]);

  const pagination = usePagination({ items: filteredRecords, pageSize: 8 });

  const columns: ColumnDef<GcUploadRecord>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (record) => (
        <div>
          <Link
            href={`/gc-uploads/${record.id}`}
            className="font-bold text-foreground hover:text-primary"
          >
            {record.customerName}
          </Link>
          <p className="text-xs font-medium text-muted-foreground">{record.bpTrNumber}</p>
        </div>
      ),
    },
    {
      key: "siteArea",
      header: "Site",
      render: (record) => record.siteArea,
    },
    {
      key: "submittedBy",
      header: "Submitted By",
      render: (record) => (
        <span className="font-medium text-foreground">{record.submittedBy}</span>
      ),
    },
    {
      key: "submittedOn",
      header: "Submitted Date",
      render: (record) => formatDateTime(record.submittedOn),
    },
    {
      key: "status",
      header: "Status",
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: "actions",
      header: "Action",
      className: "w-28",
      render: (record) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="View details">
            <Link
              href={`/gc-uploads/${record.id}`}
              aria-label="View GC upload"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <header>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">GC Uploads</h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground">
            Verify gas connection evidence, checklist completion and reviewer comments.
          </p>
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryStat label="Pending Review" value={countStatus("Pending")} />
            <SummaryStat label="Approved" value={countStatus("Approved")} />
            <SummaryStat label="Sent Back" value={countStatus("Sent Back")} />
          </div>

          <FilterSheetButton
            searchKey="search"
            searchPlaceholder="Search submission, customer, BP/TR..."
            title="GC Upload Filters"
            description="Filter upload submissions by project, site, status and reviewer."
            values={filters}
            filters={[
              { key: "project", placeholder: "All Projects", options: gcProjectOptions },
              {
                key: "site",
                placeholder: "All Sites",
                options: gcSiteOptions.map((site) => ({ label: site, value: site })),
              },
              {
                key: "status",
                placeholder: "All Statuses",
                options: gcUploadStatuses.map((status) => ({
                  label: status,
                  value: status,
                })),
              },
              {
                key: "reviewer",
                placeholder: "All Reviewers",
                options: gcReviewerOptions.map((reviewer) => ({
                  label: reviewer,
                  value: reviewer,
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
            variant="default"
            emptyTitle="No GC uploads found"
            emptyDescription="Try changing filters or review new field submissions."
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
      </section>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-bold leading-none text-foreground">{value}</p>
    </div>
  );
}

function countStatus(status: GcUploadRecord["status"]) {
  return gcUploadRecords.filter((record) => record.status === status).length;
}

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
