"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  ArrowsClockwiseIcon,
  FileImageIcon,
  FileTextIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  gcChecklistItems,
  gcEvidenceItems,
} from "../services/gc-uploads.service";
import type { GcChecklistItem, GcUploadRecord } from "../types/gc-uploads.types";
import { GcInfoLine } from "./GcInfoLine";
import { GcUploadsBreadcrumb } from "./GcUploadsBreadcrumb";

const checklistStatusOptions = [
  "Approved",
  "In Review",
  "Pending",
  "Sent Back",
  "Rejected",
  "Missing",
];

export function GcUploadEdit({ record }: { record: GcUploadRecord }) {
  return (
    <div className="space-y-4">
      <GcUploadsBreadcrumb
        items={[
          { label: "GC Uploads", href: "/gc-uploads" },
          { label: record.submissionId, href: `/gc-uploads/${record.id}` },
          { label: "Edit GC" },
        ]}
      />

      <header className="sticky top-0 z-20 rounded-xl border border-border/60 bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/85">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Edit GC
              </h1>
              <StatusBadge status={record.status} />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
              <GcInfoLine label="Submission" value={record.submissionId} />
              <GcInfoLine label="Customer" value={record.customerName} />
              <GcInfoLine label="Site" value={record.siteArea} />
            </div>
          </div>
          <Link
            href={`/gc-uploads/${record.id}`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <main className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Uploaded Evidence</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  Replace images or upload corrected GC evidence.
                </p>
              </div>
              <EvidenceUploadSheet />
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {gcEvidenceItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/60 bg-background p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                      {item.type === "PDF" ? (
                        <FileTextIcon size={22} />
                      ) : (
                        <FileImageIcon size={22} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <GcInfoLine
                        label="File"
                        value={item.fileName}
                        className="truncate leading-5"
                        valueClassName="font-medium"
                      />
                      <GcInfoLine
                        label="Uploaded"
                        value={formatDateTime(item.uploadedOn)}
                        className="leading-5"
                      />
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <EvidenceUploadSheet
                      triggerLabel="Replace"
                      title={`Replace ${item.title}`}
                    >
                      <ArrowsClockwiseIcon size={14} />
                    </EvidenceUploadSheet>
                    <Button type="button" variant="ghost" size="sm">
                      <TrashIcon size={14} />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>

        <aside className="xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:self-start">
          <div className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
            <div className="border-b border-border/60 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Edit Controls</p>
              <p className="text-xs font-medium text-muted-foreground">
                Checklist, remarks and change tracking.
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Checklist Details</p>
            <div className="mt-3 space-y-2">
              {gcChecklistItems.map((item) => (
                <ChecklistStatusRow key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <label className="text-sm font-medium text-foreground">Remarks</label>
            <Textarea
              defaultValue={record.remarks}
              className="mt-2 min-h-32"
              placeholder="Update GC remarks"
            />
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Change History</p>
            <div className="mt-2 space-y-2">
              <HistoryLine
                label="Evidence replaced"
                value="Demo Admin · 14 Feb 2025, 05:05 PM"
              />
              <HistoryLine
                label="Checklist updated"
                value="Amit Rathore · 14 Feb 2025, 04:30 PM"
              />
            </div>
          </section>

            </div>

            <div className="border-t border-border/60 bg-card p-3">
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/gc-uploads/${record.id}`}
                className={buttonVariants({ variant: "outline", size: "default" })}
              >
                Cancel
              </Link>
              <Button type="button">Save GC Changes</Button>
            </div>
          </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function EvidenceUploadSheet({
  triggerLabel = "Upload Evidence",
  title = "Upload Evidence",
  children,
}: {
  triggerLabel?: string;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button type="button" variant="outline" size="sm" />
        }
      >
        {children ?? <UploadSimpleIcon size={14} />}
        {triggerLabel}
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Add or replace the file used as GC upload evidence.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <UploadSimpleIcon size={24} />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              Drop evidence file here
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Supports JPG, PNG, PDF and DOC files.
            </p>
            <Button type="button" variant="outline" className="mt-4">
              <UploadSimpleIcon size={15} />
              Choose File
            </Button>
          </div>

          <div className="rounded-lg border border-border/70 bg-background p-3">
            <p className="text-sm font-semibold text-foreground">Evidence Details</p>
            <div className="mt-2 grid gap-2">
              <input
                className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm outline-none focus:border-primary/60"
                placeholder="Evidence title"
              />
              <Textarea placeholder="Remarks" className="min-h-20" />
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button type="button">Save Evidence</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ChecklistStatusRow({ item }: { item: GcChecklistItem }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
          <GcInfoLine
            label="Type"
            value={`${item.type} ${item.required ? "- Required" : "- Optional"}`}
            className="leading-5"
            valueClassName="font-medium"
          />
        </div>
        <Select defaultValue={item.status}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-40">
            {checklistStatusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        defaultValue={item.remarks}
        className="mt-2 min-h-16"
        placeholder="Checklist remarks"
      />
    </div>
  );
}

function HistoryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/30 px-2.5 py-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="text-xs font-medium text-muted-foreground">{value}</p>
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
