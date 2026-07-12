"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  CheckCircleIcon,
  FileImageIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  preCommissioningChecklist,
  preCommissioningEvidence,
  preCommissioningHistory,
  preCommissioningStatuses,
} from "../services/pre-commissioning.service";
import type {
  PreCommissioningChecklistItem,
  PreCommissioningRecord,
} from "../types/pre-commissioning.types";

export function PreCommissioningDetail({
  record,
}: {
  record: PreCommissioningRecord;
}) {
  const checklistColumns: ColumnDef<PreCommissioningChecklistItem>[] = [
    {
      key: "label",
      header: "Check",
      render: (item) => (
        <div>
          <p className="font-bold text-foreground">{item.label}</p>
          <InfoLine label="Category" value={item.category} className="leading-5" />
        </div>
      ),
    },
    {
      key: "required",
      header: "Required",
      render: (item) => (item.required ? "Yes" : "Optional"),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "remarks",
      header: "Remarks",
      render: (item) => <span className="text-sm text-muted-foreground">{item.remarks}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Link href="/pre-commissioning" className="hover:text-primary">
          Pre-Commissioning
        </Link>
        <span>/</span>
        <span className="text-foreground">{record.referenceNo}</span>
      </nav>

      <header className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {record.referenceNo}
              </h1>
              <StatusBadge status={record.status} />
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Pre-commissioning readiness checks and field observations.
            </p>
          </div>
          <StatusUpdateSheet record={record} />
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">Checklist Status</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  Safety and installation readiness items.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                {record.checklistDone}/{record.checklistTotal} complete
              </span>
            </div>
            <div className="mt-3">
              <DataTable
                data={preCommissioningChecklist}
                columns={checklistColumns}
                showSerialNumber={false}
                emptyTitle="No checklist items"
              />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <InfoPanel
              title="Safety Verification"
              items={[
                ["Safety", record.safetyVerification],
                ["Status", record.status],
              ]}
            />
            <InfoPanel
              title="Installation Verification"
              items={[
                ["Installation", record.installationVerification],
                ["Assigned", record.assignedPerson],
              ]}
            />
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-bold text-foreground">Field Observations</p>
            <div className="mt-2 grid gap-2">
              <InfoLine label="Observation" value={record.fieldObservation} />
              <InfoLine label="Remarks" value={record.remarks} />
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">Required Evidence</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  Single source for uploaded readiness files.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm">
                Upload Evidence
              </Button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {preCommissioningEvidence.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/60 bg-background p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                      {item.type === "PDF" ? (
                        <FileTextIcon size={22} />
                      ) : (
                        <FileImageIcon size={22} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {item.title}
                      </p>
                      <InfoLine label="File" value={item.fileName} className="leading-5" />
                      <InfoLine
                        label="Uploaded"
                        value={formatDateTime(item.uploadedOn)}
                        className="leading-5"
                      />
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-bold text-foreground">Readiness Summary</p>
            <div className="mt-2 space-y-1">
              <InfoLine label="Checklist" value={`${record.checklistDone}/${record.checklistTotal}`} />
              <InfoLine label="Assigned" value={record.assignedPerson} />
              <InfoLine label="Updated" value={formatDateTime(record.updatedDate)} />
              <InfoLine label="Status" value={record.status} />
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-bold text-foreground">Update History</p>
            <div className="mt-3 space-y-2">
              {preCommissioningHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{item.action}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <InfoLine label="Actor" value={item.actor} className="mt-1" />
                  <InfoLine label="Date" value={formatDateTime(item.dateTime)} />
                  <InfoLine
                    label="Remarks"
                    value={item.remarks}
                    valueClassName="font-medium"
                  />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function StatusUpdateSheet({ record }: { record: PreCommissioningRecord }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" variant="default" size="default" />}>
        <CheckCircleIcon size={15} />
        Update Status
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Update Status</SheetTitle>
          <SheetDescription>
            Record readiness status and field remarks for {record.referenceNo}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <section className="rounded-lg border border-border/70 bg-background p-3">
            <p className="text-sm font-bold text-foreground">Checklist Summary</p>
            <div className="mt-2 space-y-1">
              <InfoLine label="Completed" value={`${record.checklistDone}/${record.checklistTotal}`} />
              <InfoLine label="Current Status" value={record.status} />
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2">
            {preCommissioningStatuses.map((status) => (
              <Button key={status} type="button" variant="outline">
                {status}
              </Button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Remarks</label>
            <Textarea
              defaultValue={record.remarks}
              className="mt-1 min-h-28"
              placeholder="Add status update remarks"
            />
          </div>
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button type="button">Save Status</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function InfoPanel({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4">
      <p className="text-sm font-bold text-foreground">{title}</p>
      <div className="mt-2 space-y-1">
        {items.map(([label, value]) => (
          <InfoLine key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function InfoLine({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={className}>
      <span className="text-xs font-medium text-muted-foreground">{label}: </span>
      <span className={`text-sm font-semibold text-foreground ${valueClassName ?? ""}`}>
        {value || "-"}
      </span>
    </div>
  );
}

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
