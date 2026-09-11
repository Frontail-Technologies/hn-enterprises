"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ClockCounterClockwiseIcon, DownloadSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { Pagination } from "@/components/shared/Pagination";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRecentActivityQuery } from "@/features/dashboard/queries/useRecentActivityQuery";
import type { RecentActivityRow } from "@/features/dashboard/services/recent-activity.api";
import {
  activityActorLabel,
  activityCustomerLabel,
  activityRowClass,
  activityTypeLabel,
} from "@/features/dashboard/services/recent-activity.presentation";
import { exportRowsToExcel } from "@/lib/export-excel";

const PAGE_SIZE = 50;

export function RecentActivityPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: result, isLoading } = useRecentActivityQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sort,
  });
  const rows = useMemo(() => result?.data ?? [], [result]);
  const pagination = result?.pagination;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleSortChange(value: "newest" | "oldest") {
    setSort(value);
    setPage(1);
  }

  return (
    <PageShell
      title="Recent Activity"
      icon={ClockCounterClockwiseIcon}
      actions={
        <>
          <div className="relative min-w-0 sm:w-80">
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={15}
            />
            <Input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search activity, actor, customer..."
              className="h-8 w-full max-w-full pl-9 sm:w-80"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:contents">
            <Select value={sort} onValueChange={(value) => handleSortChange((value as "newest" | "oldest") ?? "newest")}>
              <SelectTrigger className="w-full sm:w-40" size="sm">
                <span className="truncate text-left">{sort === "oldest" ? "Oldest First" : "Newest First"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="compact"
              onClick={() => void exportRowsToExcel("recent-activity.xlsx", activityColumns, rows)}
            >
              <DownloadSimpleIcon size={12} />
              Export Excel
            </Button>
          </div>
        </>
      }
      fillHeight
    >
      <ExcelDataGrid
        columns={activityColumns}
        rows={rows}
        emptyTitle="No activity found"
        isLoading={isLoading}
        getRowClassName={activityRowClass}
        fillHeight
        enableFullView
      />
      {pagination && pagination.total > 0 ? (
        <Pagination
          compact
          page={pagination.page}
          pageCount={Math.max(1, pagination.totalPages)}
          totalItems={pagination.total}
          startItem={(pagination.page - 1) * pagination.limit + 1}
          endItem={Math.min(pagination.page * pagination.limit, pagination.total)}
          onPageChange={setPage}
        />
      ) : null}
    </PageShell>
  );
}

const activityColumns: ExcelColumn<RecentActivityRow>[] = [
  {
    key: "occurredAt",
    label: "Date / Time",
    width: 160,
    sticky: true,
    getValue: (row) => formatActivityDate(row.occurredAt),
  },
  {
    key: "title",
    label: "Activity",
    width: 240,
    sticky: true,
    getValue: (row) => row.title,
  },
  {
    key: "type",
    label: "Type",
    width: 110,
    getValue: (row) => activityTypeLabel(row.type),
  },
  {
    key: "actor",
    label: "Actor",
    width: 200,
    getValue: (row) => activityActorLabel(row),
  },
  {
    key: "customer",
    label: "Customer",
    width: 220,
    getValue: (row) => activityCustomerLabel(row),
  },
  {
    key: "project",
    label: "Project",
    width: 180,
    getValue: (row) => row.project?.name || "—",
  },
  {
    key: "description",
    label: "Description",
    width: 380,
    getValue: (row) => row.description,
  },
];

function formatActivityDate(occurredAt: string) {
  const date = new Date(occurredAt.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return occurredAt || "—";
  return format(date, "dd MMM yyyy, hh:mm a");
}
