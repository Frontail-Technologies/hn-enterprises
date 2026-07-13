"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { EyeIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { CountTabs } from "@/components/shared/CountTabs";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageShell } from "@/components/shared/PageShell";
import { TablePanel } from "@/components/shared/TablePanel";
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
            className="font-semibold text-foreground hover:text-primary"
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
    <PageShell
      title="GC Uploads"
      subtitle="Verify gas connection evidence, checklist completion and reviewer comments."
    >
      <CountTabs
        items={[
          {
            label: "Pending Review",
            value: countStatus("Pending"),
            active: filters.status === "Pending",
            onClick: () => {
              setFilters((current) => ({ ...current, status: "Pending" }));
              pagination.setPage(1);
            },
          },
          {
            label: "Approved",
            value: countStatus("Approved"),
            active: filters.status === "Approved",
            onClick: () => {
              setFilters((current) => ({ ...current, status: "Approved" }));
              pagination.setPage(1);
            },
          },
          {
            label: "Sent Back",
            value: countStatus("Sent Back"),
            active: filters.status === "Sent Back",
            onClick: () => {
              setFilters((current) => ({ ...current, status: "Sent Back" }));
              pagination.setPage(1);
            },
          },
        ]}
      />

      <TablePanel
        title="Verification Queue"
        subtitle="Evidence submissions awaiting validation and approval."
        toolbar={
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
        }
        pagination={
          <Pagination
            compact
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={pagination.totalItems}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            onPageChange={pagination.setPage}
          />
        }
      >

          <DataTable
            data={pagination.paginatedItems}
            columns={columns}
            variant="default"
            emptyTitle="No GC uploads found"
            emptyDescription="Try changing filters or review new field submissions."
            serialNumberStart={pagination.startItem}
            stickyHeader
            stickyLastColumn
            containerClassName="rounded-none border-0"
          />
      </TablePanel>
    </PageShell>
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
