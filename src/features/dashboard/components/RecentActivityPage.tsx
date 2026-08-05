"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { DownloadSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { PageShell } from "@/components/shared/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  buildActivities,
  getActivityRows,
  type ActivityFilters,
  type DashboardActivity,
} from "@/features/dashboard/services/activity.service";
import { usePaymentsQuery } from "@/features/commercial/hooks/usePayments";
import { useDprRecordsQuery } from "@/features/planning/hooks/usePlanning";
import { useWorkProgressListQuery } from "@/features/work-progress/hooks/useWorkProgress";
import { useAuditLogsQuery } from "@/features/management/hooks/useAuditLogs";
import { exportRowsToExcel } from "@/lib/export-excel";

const initialFilters: ActivityFilters = {
  search: "",
  sort: "newest",
};

export function RecentActivityPage() {
  const [filters, setFilters] = useState<ActivityFilters>(initialFilters);
  const { data: workProgress = [], isLoading: workProgressLoading } = useWorkProgressListQuery({ limit: 100 });
  const { data: dprRecords = [], isLoading: dprLoading } = useDprRecordsQuery({});
  const { data: payments = [], isLoading: paymentsLoading } = usePaymentsQuery();
  const { data: auditLogs = [], isLoading: auditLogsLoading } = useAuditLogsQuery();
  const isLoading = workProgressLoading || dprLoading || paymentsLoading || auditLogsLoading;
  const activities = useMemo(
    () => buildActivities({ workProgress, dprRecords, payments, auditLogs }),
    [workProgress, dprRecords, payments, auditLogs],
  );
  const rows = useMemo(() => getActivityRows(activities, filters), [activities, filters]);

  return (
    <PageShell
      title="Recent Activity"
      actions={
        <button
          type="button"
          className={buttonVariants({ variant: "outline", size: "default" })}
          onClick={() => void exportRowsToExcel("recent-activity.xlsx", activityColumns, rows)}
        >
          <DownloadSimpleIcon size={15} />
          Export Excel
        </button>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0">
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={15}
            />
            <Input
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Search activity, actor, supervisor..."
              className="h-8 w-80 max-w-full pl-9"
            />
          </div>

          <Select
            value={filters.sort}
            onValueChange={(value) =>
              setFilters((current) => ({ ...current, sort: value ?? "newest" }))
            }
          >
            <SelectTrigger className="h-8 w-40">
              <span className="truncate text-left">
                {filters.sort === "oldest" ? "Oldest First" : "Newest First"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ExcelDataGrid
          columns={activityColumns}
          rows={rows}
          emptyTitle="No activity found"
          isLoading={isLoading}
          getRowClassName={(row) => {
            if (row.type === "Work") return "bg-status-info/10 hover:bg-status-info/20";
            if (row.type === "Survey") return "bg-status-purple/10 hover:bg-status-purple/20";
            if (row.type === "DPR") return "bg-status-warning/10 hover:bg-status-warning/20";
            if (row.type === "Billing") return "bg-status-success/10 hover:bg-status-success/20";
            return undefined;
          }}
          maxHeightClassName="h-[calc(100vh-170px)]"
        />
      </div>
    </PageShell>
  );
}

const activityColumns: ExcelColumn<DashboardActivity>[] = [
  {
    key: "dateTime",
    label: "Date / Time",
    width: 160,
    sticky: true,
    getValue: (row) => formatActivityDate(row.dateTime),
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
    width: 130,
    getValue: (row) => row.type,
  },
  {
    key: "actor",
    label: "Actor",
    width: 150,
    getValue: (row) => row.actor,
  },
  {
    key: "supervisor",
    label: "Supervisor",
    width: 170,
    getValue: (row) => row.supervisor,
  },
  {
    key: "project",
    label: "Project",
    width: 240,
    getValue: (row) => row.project,
  },
  {
    key: "site",
    label: "Site / Area",
    width: 190,
    getValue: (row) => row.site,
  },
  {
    key: "relatedRecord",
    label: "Related Record",
    width: 170,
    getValue: (row) => row.relatedRecord,
  },
  {
    key: "description",
    label: "Description",
    width: 360,
    getValue: (row) => row.description,
  },
];

function formatActivityDate(dateTime: string) {
  const date = new Date(dateTime.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return dateTime || "-";
  return format(date, "dd MMM yyyy, hh:mm a");
}
