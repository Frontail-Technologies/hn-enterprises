"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  CameraIcon,
  CheckCircleIcon,
  EyeIcon,
  FileTextIcon,
  GaugeIcon,
  NotePencilIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { FilterSheetButton } from "@/components/shared/FilterSheetButton";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePagination } from "@/lib/hooks/usePagination";
import {
  getPressureTestById,
  pressureEvidence,
  pressureHistory,
  pressureProjectOptions,
  pressureReadings,
  pressureStatuses,
  pressureSupervisorOptions,
  pressureTests,
} from "../services/testing-pressure.service";
import type {
  PressureEvidence,
  PressureReading,
  PressureTestRecord,
} from "../types/testing-pressure.types";

const initialFilters = {
  search: "",
  project: "all",
  supervisor: "all",
  status: "all",
};

export function TestingPressureList() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredRecords = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return pressureTests.filter((record) => {
      const matchesSearch =
        !search ||
        record.customerName.toLowerCase().includes(search) ||
        record.bpTrNumber.toLowerCase().includes(search) ||
        record.testNo.toLowerCase().includes(search);
      const matchesProject = filters.project === "all" || record.projectName === filters.project;
      const matchesSupervisor = filters.supervisor === "all" || record.supervisor === filters.supervisor;
      const matchesStatus = filters.status === "all" || record.status === filters.status;
      return matchesSearch && matchesProject && matchesSupervisor && matchesStatus;
    });
  }, [filters]);

  const pagination = usePagination({ items: filteredRecords, pageSize: 8 });

  const columns: ColumnDef<PressureTestRecord>[] = [
    {
      key: "customer",
      header: "Test / Reference",
      render: (record) => (
        <div>
          <Link href={`/pressure-observation/${record.id}`} className="font-bold text-foreground hover:text-primary">
            {record.testNo}
          </Link>
          <p className="text-xs font-medium text-muted-foreground">{record.bpTrNumber}</p>
        </div>
      ),
    },
    {
      key: "projectSite",
      header: "Section",
      render: (record) => (
        <div>
          <p className="font-semibold text-foreground">{record.siteArea}</p>
          <p className="text-xs font-medium text-muted-foreground">{record.testType}</p>
        </div>
      ),
    },
    { key: "testType", header: "Test Type" },
    {
      key: "testDate",
      header: "Test Date",
      render: (record) => formatDateTime(record.testDate),
    },
    {
      key: "result",
      header: "Result",
      render: (record) => <ResultBadge result={record.result} />,
    },
    {
      key: "status",
      header: "Status",
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-36",
      render: (record) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="View test">
            <Link href={`/pressure-observation/${record.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <EyeIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="Add readings">
            <Link href={`/pressure-observation/${record.id}/readings/new`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <PlusIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="Edit readings">
            <Link href={`/pressure-observation/${record.id}/readings/edit`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <NotePencilIcon size={15} />
            </Link>
          </ActionTooltip>
          <ActionTooltip label="Result and evidence">
            <Link href={`/pressure-observation/${record.id}/result`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <UploadSimpleIcon size={15} />
            </Link>
          </ActionTooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Testing / Pressure Observation</h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground">
            Record field pressure readings, test results and supporting evidence.
          </p>
        </div>
        <Link href="/pressure-observation/tp-001/readings/new" className={buttonVariants({ variant: "default" })}>
          <PlusIcon size={15} />
          Add Readings
        </Link>
      </header>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <FilterSheetButton
            searchKey="search"
            searchPlaceholder="Search customer, BP/TR or test no..."
            title="Pressure Test Filters"
            description="Filter pressure observations by project, supervisor and status."
            values={filters}
            filters={[
              { key: "project", placeholder: "All Projects", options: pressureProjectOptions },
              { key: "supervisor", placeholder: "All Supervisors", options: pressureSupervisorOptions },
              { key: "status", placeholder: "All Statuses", options: pressureStatuses.map((status) => ({ label: status, value: status })) },
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
              emptyTitle="No pressure tests found"
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
        </div>

        <aside className="space-y-3">
          <CompactSummary icon={<GaugeIcon size={18} />} label="In Review" value={countStatus("In Review")} />
          <CompactSummary icon={<CheckCircleIcon size={18} />} label="Approved" value={countStatus("Approved")} />
          <CompactSummary icon={<CameraIcon size={18} />} label="Evidence Files" value={pressureEvidence.length} />
        </aside>
      </section>
    </div>
  );
}

export function TestingPressureDetail({ id }: { id: string }) {
  const record = getPressureTestById(id);
  const readingColumns: ColumnDef<PressureReading>[] = [
    { key: "time", header: "Time" },
    { key: "pressure", header: "Pressure" },
    { key: "temperature", header: "Temperature" },
    { key: "observation", header: "Observation" },
    { key: "recordedBy", header: "Recorded By" },
  ];

  return (
    <div className="space-y-4">
      <ModuleBreadcrumb items={[["Testing / Pressure", "/pressure-observation"], [record.testNo]]} />
      <header className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{record.testNo}</h1>
              <ResultBadge result={record.result} />
              <StatusBadge status={record.status} />
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Pressure readings, observation result and evidence for this test.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/pressure-observation/${record.id}/readings/edit`} className={buttonVariants({ variant: "outline" })}>
              <NotePencilIcon size={15} />
              Edit Readings
            </Link>
            <Link href={`/pressure-observation/${record.id}/result`} className={buttonVariants({ variant: "default" })}>
              <UploadSimpleIcon size={15} />
              Result + Evidence
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Test Setup" description="Task data needed to review the pressure result." />
            <KeyValueGrid
              rows={[
                ["Test No.", record.testNo],
                ["Type", record.testType],
                ["Test Date", formatDateTime(record.testDate)],
                ["Range", record.pressureRange],
                ["Pressure Drop", record.pressureDrop],
                ["Duration", record.duration],
                ["Result", <ResultBadge key="result" result={record.result} />],
                ["Status", <StatusBadge key="status" status={record.status} />],
              ]}
            />
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Readings" description="Observation values captured during the test window." />
            <div className="mt-3">
              <DataTable data={pressureReadings} columns={readingColumns} emptyTitle="No readings captured" />
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Result Remarks" />
            <p className="mt-3 text-sm font-medium text-foreground">{record.remarks}</p>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Evidence" />
            <div className="mt-3 space-y-2">
              {pressureEvidence.map((item) => (
                <EvidenceRow key={item.id} item={item} />
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="History" />
            <div className="mt-3 space-y-2">
              {pressureHistory.map((item) => (
                <div key={item.id} className="rounded-lg border border-border/60 bg-background px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{item.action}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <InfoLine label="By" value={item.actor} />
                  <InfoLine label="Date" value={formatDateTime(item.dateTime)} />
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{item.remarks}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

export function PressureReadingForm({ id, mode }: { id: string; mode: "add" | "edit" }) {
  const record = getPressureTestById(id);
  const title = mode === "edit" ? "Edit Readings" : "Add Readings";

  return (
    <div className="space-y-4">
      <ModuleBreadcrumb items={[["Testing / Pressure", "/pressure-observation"], [record.testNo, `/pressure-observation/${record.id}`], [title]]} />
      <header className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-xs font-medium text-muted-foreground">
              Capture readings without editing customer or project master data.
            </p>
          </div>
          <Link href={`/pressure-observation/${record.id}`} className={buttonVariants({ variant: "outline" })}>
            Cancel
          </Link>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form className="rounded-xl border border-border/60 bg-card p-4">
          <SectionHeading title="Reading Details" />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Field label="Work Date" defaultValue={record.testDate} />
            <Field label="Test Pressure" defaultValue={mode === "edit" ? "108 mbar" : ""} />
            <Field label="Duration" defaultValue={record.duration} />
            <Field label="Observation Time" defaultValue={mode === "edit" ? "10:45 AM" : ""} />
          </div>
          <label className="mt-3 grid gap-1.5">
            <span className="text-xs font-bold text-foreground">Remarks</span>
            <Textarea defaultValue={mode === "edit" ? record.remarks : ""} className="min-h-28" />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <Link href={`/pressure-observation/${record.id}`} className={buttonVariants({ variant: "outline" })}>
              Cancel
            </Link>
            <Button type="button">{mode === "edit" ? "Save Readings" : "Add Readings"}</Button>
          </div>
        </form>

        <aside className="rounded-xl border border-border/60 bg-card p-4">
          <SectionHeading title="Test Reference" />
          <div className="mt-3 space-y-1.5">
            <InfoLine label="Test No." value={record.testNo} />
            <InfoLine label="Type" value={record.testType} />
            <InfoLine label="Expected Range" value={record.pressureRange} />
            <InfoLine label="Pressure Drop" value={record.pressureDrop} />
          </div>
        </aside>
      </section>
    </div>
  );
}

export function PressureResultUpload({ id }: { id: string }) {
  const record = getPressureTestById(id);

  return (
    <div className="space-y-4">
      <ModuleBreadcrumb items={[["Testing / Pressure", "/pressure-observation"], [record.testNo, `/pressure-observation/${record.id}`], ["Result + Evidence"]]} />
      <header className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Result + Evidence Upload</h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Submit final result, pressure document and field photos.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="rounded-xl border border-border/60 bg-card p-4">
          <SectionHeading title="Result" />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-foreground">Result</span>
              <Select defaultValue={record.result}>
                <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Passed", "Failed", "Pending"].map((result) => (
                    <SelectItem key={result} value={result}>{result}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <Field label="Final Pressure" defaultValue="108 mbar" />
            <Field label="Observation PDF" type="file" />
            <Field label="Gauge Photo" type="file" />
          </div>
          <label className="mt-3 grid gap-1.5">
            <span className="text-xs font-bold text-foreground">Reviewer / Field Remarks</span>
            <Textarea defaultValue={record.remarks} className="min-h-28" />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <Link href={`/pressure-observation/${record.id}`} className={buttonVariants({ variant: "outline" })}>Cancel</Link>
            <Button type="button">Save Result</Button>
          </div>
        </main>
        <aside className="rounded-xl border border-border/60 bg-card p-4">
          <SectionHeading title="Existing Evidence" />
          <div className="mt-3 space-y-2">
            {pressureEvidence.map((item) => <EvidenceRow key={item.id} item={item} />)}
          </div>
        </aside>
      </section>
    </div>
  );
}

function CompactSummary({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
      <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function EvidenceRow({ item }: { item: PressureEvidence }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-primary">{item.type === "PDF" ? <FileTextIcon size={16} /> : <CameraIcon size={16} />}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{item.title}</p>
          <InfoLine label="File" value={item.fileName} />
          <InfoLine label="Uploaded" value={formatDateTime(item.uploadedOn)} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold text-foreground">{label}</span>
      <Input type={type} defaultValue={type === "file" ? undefined : defaultValue} className="h-9" />
    </label>
  );
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-foreground">{title}</p>
      {description ? <p className="mt-0.5 text-xs font-medium text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function KeyValueGrid({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="mt-3 grid gap-x-6 gap-y-1.5 md:grid-cols-2 xl:grid-cols-4">
      {rows.map(([label, value]) => <InfoLine key={label} label={label} value={value} />)}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>
      <span className="min-w-0 text-sm font-semibold text-foreground">{value || "-"}</span>
    </div>
  );
}

function ResultBadge({ result }: { result: PressureTestRecord["result"] }) {
  const className =
    result === "Passed"
      ? "bg-status-success-bg text-status-success-fg border-status-success/20"
      : result === "Failed"
        ? "bg-destructive/10 text-destructive border-destructive/20"
        : "bg-status-warning-bg text-status-warning-fg border-status-warning/20";

  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${className}`}>{result}</span>;
}

function ModuleBreadcrumb({ items }: { items: ([string] | [string, string])[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {items.map(([label, href], index) => (
        <span key={`${label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 ? <span className="text-muted-foreground/70">/</span> : null}
          {href ? <Link href={href} className="hover:text-primary">{label}</Link> : <span className="font-semibold text-foreground">{label}</span>}
        </span>
      ))}
    </nav>
  );
}

function countStatus(status: PressureTestRecord["status"]) {
  return pressureTests.filter((record) => record.status === status).length;
}

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
