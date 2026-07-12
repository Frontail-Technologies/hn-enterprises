"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  CalendarPlusIcon,
  CameraIcon,
  CheckCircleIcon,
  WarningIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePagination } from "@/lib/hooks/usePagination";
import {
  planningProjectOptions,
  planningRecords,
  planningSupervisorOptions,
  type PlanningRecord,
} from "../services/planning.service";

const initialFilters = {
  search: "",
  project: "all",
  supervisor: "all",
};

export function PlanningPage() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredRecords = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return planningRecords.filter((record) => {
      const matchesSearch =
        !search ||
        record.activity.toLowerCase().includes(search) ||
        record.siteArea.toLowerCase().includes(search) ||
        record.supervisor.toLowerCase().includes(search);
      const matchesProject =
        filters.project === "all" || record.projectName === filters.project;
      const matchesSupervisor =
        filters.supervisor === "all" ||
        record.supervisor === filters.supervisor;
      return matchesSearch && matchesProject && matchesSupervisor;
    });
  }, [filters]);

  const pagination = usePagination({ items: filteredRecords, pageSize: 8 });

  const columns: ColumnDef<PlanningRecord>[] = [
    {
      key: "date",
      header: "Date",
      render: (record) => formatDate(record.date),
    },
    {
      key: "activitySection",
      header: "Activity / Section",
      render: (record) => (
        <div>
          <p className="font-semibold text-foreground">{record.activity}</p>
          <p className="text-xs font-medium text-muted-foreground">
            {record.siteArea}
          </p>
        </div>
      ),
    },
    { key: "plannedQty", header: "Planned Qty" },
    { key: "completedQty", header: "Completed Qty" },
    { key: "supervisor", header: "Supervisor" },
    {
      key: "status",
      header: "Status",
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: "delayReason",
      header: "Delay Reason + Photos",
      render: (record) => (
        <div>
          <p className="font-medium text-foreground">
            {record.delayReason || "-"}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <CameraIcon size={13} />
            {record.photoCount} photos
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Planning & DPR
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground">
            Plan supervisor work, capture daily progress and track delays with
            photos.
          </p>
        </div>
        <PlanSheet />
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric
          icon={<CalendarPlusIcon size={18} />}
          label="Planned Work"
          value="62"
          helper="Today"
        />
        <Metric
          icon={<CheckCircleIcon size={18} />}
          label="Completed"
          value="50"
          helper="Today"
        />
        <Metric
          icon={<WarningIcon size={18} />}
          label="Delayed"
          value="12"
          helper="Need follow-up"
        />
        <Metric
          icon={<ClockIcon size={18} />}
          label="Completion"
          value="80%"
          helper="Planned vs completed"
        />
      </section>

      <nav className="flex flex-wrap gap-2">
        <PlanningLink href="/planning/supervisor" label="Supervisor Planning" />
        <PlanningLink href="/planning/dpr" label="Daily Progress Report" />
        <PlanningLink
          href="/planning/planned-vs-completed"
          label="Planned vs Completed"
        />
        <PlanningLink href="/planning/delays" label="Delay Reason + Photos" />
      </nav>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="rounded-xl border border-border/70 bg-card p-4">
          <FilterSheetButton
            searchKey="search"
            searchPlaceholder="Search activity, site or supervisor..."
            values={filters}
            filters={[
              {
                key: "project",
                placeholder: "All Projects",
                options: planningProjectOptions,
              },
              {
                key: "supervisor",
                placeholder: "All Supervisors",
                options: planningSupervisorOptions,
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
          <div className="mt-3">
            <DataTable
              data={pagination.paginatedItems}
              columns={columns}
              serialNumberStart={pagination.startItem}
              emptyTitle="No planning records found"
            />
          </div>
          <Pagination
            className="mt-3"
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={pagination.totalItems}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            onPageChange={pagination.setPage}
          />
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-bold text-foreground">
              Daily Progress Report
            </p>
            <div className="mt-3 space-y-2">
              {planningRecords.slice(0, 3).map((record) => (
                <div
                  key={record.id}
                  className="rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <p className="text-sm font-bold text-foreground">
                    {record.activity}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {record.completedQty} of {record.plannedQty} ·{" "}
                    {record.supervisor}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-bold text-foreground">
              Planned vs Completed
            </p>
            <div className="mt-3 space-y-3">
              <ProgressRow label="GI Installation" value={82} />
              <ProgressRow label="GC Corrections" value={67} />
              <ProgressRow label="Pressure Testing" value={100} />
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

export function PlanningSubPage({
  type,
}: {
  type: "supervisor" | "dpr" | "planned-vs-completed" | "delays";
}) {
  const config = {
    supervisor: {
      title: "Supervisor Planning",
      subtitle: "Plan site activities and supervisor-level daily targets.",
    },
    dpr: {
      title: "Daily Progress Report",
      subtitle: "Review submitted daily progress and field output.",
    },
    "planned-vs-completed": {
      title: "Planned vs Completed Work",
      subtitle: "Compare planned quantity with completed field work.",
    },
    delays: {
      title: "Delay Reason + Photos",
      subtitle: "Track delayed activities with reasons and supporting photos.",
    },
  }[type];

  const rows =
    type === "delays"
      ? planningRecords.filter((record) => record.status === "Delayed")
      : planningRecords;

  const columns: ColumnDef<PlanningRecord>[] = [
    {
      key: "date",
      header: "Date",
      render: (record) => formatDate(record.date),
    },
    {
      key: "project",
      header: "Project / Site",
      render: (record) => (
        <div>
          <p className="font-semibold text-foreground">{record.projectName}</p>
          <p className="text-xs font-medium text-muted-foreground">
            {record.siteArea}
          </p>
        </div>
      ),
    },
    { key: "activity", header: "Activity" },
    { key: "plannedQty", header: "Planned Qty" },
    { key: "completedQty", header: "Completed Qty" },
    { key: "supervisor", header: "Supervisor" },
    {
      key: "status",
      header: "Status",
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: "delayReason",
      header: "Delay / Photos",
      render: (record) => `${record.delayReason} · ${record.photoCount} photos`,
    },
  ];

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Link href="/planning" className="hover:text-primary">
          Planning & DPR
        </Link>
        <span>/</span>
        <span className="font-semibold text-foreground">{config.title}</span>
      </nav>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {config.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {config.subtitle}
          </p>
        </div>
        <PlanSheet />
      </header>
      <section className="rounded-xl border border-border/70 bg-card p-4">
        <DataTable
          data={rows}
          columns={columns}
          emptyTitle="No planning records found"
        />
      </section>
    </div>
  );
}

function PlanSheet() {
  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" />}>
        <CalendarPlusIcon size={15} />
        Create Plan
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-lg">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Supervisor Planning</SheetTitle>
          <SheetDescription>
            Create a compact plan and expected DPR target.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Date" defaultValue="2025-02-18" />
            <Field label="Supervisor" defaultValue="Amit Rathore" />
            <Field label="Project" defaultValue="Shyam Nagar CGD Project" />
            <Field label="Site" defaultValue="Shyam Nagar Block A" />
            <Field label="Activity" defaultValue="GI installation" />
            <Field label="Planned Quantity" defaultValue="34 customers" />
          </div>
          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-foreground">
              Delay Reason / Notes
            </span>
            <Textarea
              className="min-h-28"
              placeholder="Add expected constraints or delay reason"
            />
          </label>
          <Field label="Photos" type="file" />
        </div>
        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <SheetClose render={<Button type="button" />}>Save Plan</SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PlanningLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm font-bold text-foreground hover:bg-muted/35 hover:text-primary"
    >
      {label}
    </Link>
  );
}

function Metric({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4">
      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{helper}</p>
      </div>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">{value}%</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-foreground">{label}</span>
      <Input
        type={type}
        defaultValue={type === "file" ? undefined : defaultValue}
        className="h-9"
      />
    </label>
  );
}

function formatDate(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}
