"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  CaretRightIcon,
  CheckCircleIcon,
  FileImageIcon,
  FileTextIcon,
  NotePencilIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
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
  PreCommissioningEvidence,
  PreCommissioningRecord,
} from "../types/pre-commissioning.types";
import { PreCommissioningRecordSheet } from "./PreCommissioningRecordSheet";

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
      render: (item) => (
        <span className="text-sm font-medium text-muted-foreground">
          {item.remarks || "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
      render: (item) => <ChecklistItemSheet item={item} />,
    },
  ];

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Link href="/pre-commissioning" className="hover:text-primary">
          Pre-Commissioning
        </Link>
        <CaretRightIcon size={12} />
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
              Section: {record.locationSection} · Updated {formatDateTime(record.updatedDate)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PreCommissioningRecordSheet record={record} mode="edit" />
            <StatusUpdateSheet record={record} />
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading
              title="Pre-Commissioning Task"
              description="Only readiness details required to complete this report."
            />
            <KeyValueGrid
              rows={[
                ["Report", record.referenceNo],
                ["Section", record.locationSection],
                ["Pipe Lengths", record.pipeLengths],
                ["Valve Chambers", record.valveChambers],
                ["Status", <StatusBadge key="status" status={record.status} />],
                ["Evidence", `${record.evidenceCount ?? preCommissioningEvidence.length} files`],
              ]}
            />
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading
              title="Checklist Items"
              description="Safety and installation readiness validations."
            />
            <div className="mt-3">
              <DataTable
                data={preCommissioningChecklist}
                columns={checklistColumns}
                showSerialNumber={false}
                emptyTitle="No checklist items"
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-border/60 bg-card p-4">
              <SectionHeading title="Purging Details" />
              <div className="mt-3 space-y-1.5">
                <InfoLine label="Date" value={formatDateTime(record.purgingDate)} />
                <InfoLine label="Pressure" value={record.purgingPressure} />
                <InfoLine label="Duration" value={record.purgingDuration} />
                <InfoLine
                  label="Remarks"
                  value={record.purgingRemarks}
                  valueClassName="font-medium"
                />
              </div>
            </section>

            <section className="rounded-xl border border-border/60 bg-card p-4">
              <SectionHeading title="Safety / Installation Verification" />
              <div className="mt-3 space-y-1.5">
                <InfoLine
                  label="Safety"
                  value={record.safetyVerification}
                  valueClassName="font-medium"
                />
                <InfoLine
                  label="Installation"
                  value={record.installationVerification}
                  valueClassName="font-medium"
                />
              </div>
            </section>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Field Observations" />
            <div className="mt-3 space-y-2">
              <InfoLine
                label="Observation"
                value={record.fieldObservation}
                valueClassName="font-medium"
              />
              <InfoLine
                label="Remarks"
                value={record.remarks}
                valueClassName="font-medium"
              />
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionHeading
                title="Evidence List"
                description="Single source for uploaded pre-commissioning files."
              />
              <EvidenceUploadSheet />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {preCommissioningEvidence.map((item) => (
                <EvidenceCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Task Status" />
            <div className="mt-3 space-y-1.5">
              <InfoLine label="Checklist" value={`${record.checklistDone}/${record.checklistTotal}`} />
              <InfoLine label="Evidence" value={`${record.evidenceCount ?? preCommissioningEvidence.length} files`} />
              <InfoLine label="Status" value={<StatusBadge status={record.status} />} />
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <SectionHeading title="Update History" />
            <div className="mt-3 space-y-2">
              {preCommissioningHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
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

function EvidenceCard({ item }: { item: PreCommissioningEvidence }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-primary">
          {item.type === "PDF" ? <FileTextIcon size={22} /> : <FileImageIcon size={22} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{item.title}</p>
          <InfoLine label="File" value={item.fileName} className="truncate leading-5" />
          <InfoLine label="Uploaded" value={formatDateTime(item.uploadedOn)} className="leading-5" />
          <InfoLine label="By" value={item.uploadedBy} className="leading-5" />
        </div>
        <StatusBadge status={item.status} />
      </div>
      {item.remarks ? (
        <p className="mt-2 border-t border-border/50 pt-2 text-xs font-medium text-muted-foreground">
          {item.remarks}
        </p>
      ) : null}
    </div>
  );
}

function EvidenceUploadSheet() {
  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" variant="outline" size="sm" />}>
        <UploadSimpleIcon size={14} />
        Upload Evidence
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Upload Evidence</SheetTitle>
          <SheetDescription>
            Add one pre-commissioning evidence file with review context.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-foreground">Type</span>
            <Select defaultValue="Image">
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Image", "PDF", "Document"].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-foreground">File</span>
            <Input type="file" className="h-9" />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-foreground">Status</span>
            <Select defaultValue="Pending">
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {preCommissioningStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-foreground">Remarks</span>
            <Textarea className="min-h-28" placeholder="Evidence remarks" />
          </label>
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <SheetClose render={<Button type="button" />}>Save Evidence</SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ChecklistItemSheet({ item }: { item: PreCommissioningChecklistItem }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Update ${item.label}`}
            title="Update checklist item"
          />
        }
      >
        <NotePencilIcon size={15} />
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Update Checklist Item</SheetTitle>
          <SheetDescription>{item.label}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <div className="rounded-lg border border-border/70 bg-background p-3">
            <InfoLine label="Category" value={item.category} />
            <InfoLine label="Required" value={item.required ? "Yes" : "Optional"} />
          </div>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-foreground">Status</span>
            <Select defaultValue={item.status}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {preCommissioningStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-foreground">Remarks</span>
            <Textarea defaultValue={item.remarks} className="min-h-28" />
          </label>
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <SheetClose render={<Button type="button" />}>Save Item</SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-foreground">New Status</span>
            <Select defaultValue={record.status}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {preCommissioningStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold text-foreground">Remarks</span>
            <Textarea
              defaultValue={record.remarks}
              className="min-h-28"
              placeholder="Add status update remarks"
            />
          </label>
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <SheetClose render={<Button type="button" />}>Save Status</SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-foreground">{title}</p>
      {description ? (
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function KeyValueGrid({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="grid gap-x-6 gap-y-1.5 md:grid-cols-2 xl:grid-cols-4">
      {rows.map(([label, value]) => (
        <InfoLine key={label} label={label} value={value} />
      ))}
    </div>
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
    <div className={`grid grid-cols-[6.75rem_minmax(0,1fr)] items-start gap-2 ${className ?? ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>
      <span className={`min-w-0 text-sm font-semibold text-foreground ${valueClassName ?? ""}`}>
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
