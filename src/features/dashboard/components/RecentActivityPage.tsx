"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { ListTable, useListState, type ListColumn, type ListFilter } from "@/components/shared/list";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { useRecentActivityQuery } from "@/features/dashboard/queries/useRecentActivityQuery";
import type { RecentActivityRow } from "@/features/dashboard/services/recent-activity.api";
import {
  activityActorLabel,
  activityCustomerLabel,
  activityRowClass,
  activityTypeLabel,
} from "@/features/dashboard/services/recent-activity.presentation";
import { exportRowsToExcel, type ExportColumn } from "@/lib/export-excel";

// The server sorts; "Order" replaces the old Newest/Oldest select (no value = newest).
const filters: ListFilter[] = [
  {
    id: "order",
    label: "Order",
    quick: true,
    options: [
      { value: "newest", label: "Newest first" },
      { value: "oldest", label: "Oldest first" },
    ],
  },
];

export function RecentActivityPage() {
  const list = useListState({ pageSize: 50, storageKey: "recent-activity" });
  const sort = list.filters.order === "oldest" ? "oldest" : "newest";

  const { data: result, isLoading, isError, refetch } = useRecentActivityQuery({
    page: list.page,
    limit: list.pageSize,
    search: list.debouncedSearch || undefined,
    sort,
  });
  const rows = useMemo(() => result?.data ?? [], [result]);
  const total = result?.pagination?.total ?? rows.length;

  return (
    <PageShell title="Recent Activity" description="Field updates, DPRs, payments and admin changes across all projects." fillHeight>
      <ListTable
        fillHeight
        itemLabel="activity"
        rows={rows}
        total={total}
        columns={activityColumns}
        state={list}
        filters={filters}
        searchPlaceholder="Search activity, actor, customer..."
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        getRowClassName={activityRowClass}
        enableFullView
        empty={{ illustration: "checklist", title: "No activity found" }}
        actions={
          <Button
            type="button"
            variant="outline"
            size="compact"
            disabled={rows.length === 0}
            onClick={() => void exportRowsToExcel("recent-activity.xlsx", activityExportColumns, rows)}
          >
            <DownloadSimpleIcon size={14} />
            Export Excel
          </Button>
        }
      />
    </PageShell>
  );
}

// Every column keeps its Excel-style filter (page-local, as before).
const activityColumns: ListColumn<RecentActivityRow>[] = [
  { id: "occurredAt", header: "Date / time", width: 170, pin: true, hideable: false, columnFilter: true, value: (row) => formatActivityDate(row.occurredAt) },
  { id: "title", header: "Activity", width: 240, isTitle: true, hideable: false, columnFilter: true, value: (row) => row.title },
  { id: "type", header: "Type", width: 110, columnFilter: true, value: (row) => activityTypeLabel(row.type) },
  { id: "actor", header: "Actor", width: 200, columnFilter: true, value: (row) => activityActorLabel(row) },
  { id: "customer", header: "Customer", width: 220, columnFilter: true, value: (row) => activityCustomerLabel(row) },
  { id: "project", header: "Project", width: 180, columnFilter: true, value: (row) => row.project?.name || "—" },
  { id: "description", header: "Description", width: 380, grow: true, columnFilter: true, value: (row) => row.description },
];

// Export keeps the previous columns/labels (current page, as before).
const activityExportColumns: ExportColumn<RecentActivityRow>[] = [
  { label: "Date / Time", getValue: (row) => formatActivityDate(row.occurredAt) },
  { label: "Activity", getValue: (row) => row.title },
  { label: "Type", getValue: (row) => activityTypeLabel(row.type) },
  { label: "Actor", getValue: (row) => activityActorLabel(row) },
  { label: "Customer", getValue: (row) => activityCustomerLabel(row) },
  { label: "Project", getValue: (row) => row.project?.name || "—" },
  { label: "Description", getValue: (row) => row.description },
];

function formatActivityDate(occurredAt: string) {
  const date = new Date(occurredAt.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return occurredAt || "—";
  return format(date, "dd MMM yyyy, hh:mm a");
}
