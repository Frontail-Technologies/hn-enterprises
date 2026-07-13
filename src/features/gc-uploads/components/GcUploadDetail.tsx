"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  CheckCircleIcon,
  FileImageIcon,
  FileTextIcon,
  NotePencilIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  gcChecklistItems,
  gcEvidenceItems,
  gcReviewComments,
} from "../services/gc-uploads.service";
import type { GcChecklistItem, GcUploadRecord } from "../types/gc-uploads.types";
import { GcInfoLine } from "./GcInfoLine";
import { GcUploadsBreadcrumb } from "./GcUploadsBreadcrumb";

export function GcUploadDetail({ record }: { record: GcUploadRecord }) {
  const checklistColumns: ColumnDef<GcChecklistItem>[] = [
    {
      key: "label",
      header: "Checklist Item",
      render: (item) => (
        <div className="min-w-44">
          <p className="font-semibold text-foreground">{item.label}</p>
          <GcInfoLine label="Type" value={item.type} className="leading-5" />
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
      header: "Reviewer Notes",
      render: (item) => <span className="text-sm text-muted-foreground">{item.remarks}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <GcUploadsBreadcrumb
        items={[
          { label: "GC Uploads", href: "/gc-uploads" },
          { label: record.submissionId },
        ]}
      />

      <header className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {record.submissionId}
              </h1>
              <StatusBadge status={record.status} />
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              GC evidence review and uploaded documents.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/gc-uploads/${record.id}/edit`}
              className={buttonVariants({ variant: "outline", size: "default" })}
            >
              <NotePencilIcon size={15} />
              Edit GC
            </Link>
            <ReviewGcSheet record={record} />
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-border/70 bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Evidence Gallery</p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              Field photos and uploaded GC documents for reviewer validation.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {record.fileCount} files
          </span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {gcEvidenceItems.map((item) => (
            <Link
              key={item.id}
              href={`/documents?gcUploadId=${record.id}&evidenceId=${item.id}`}
              className="group overflow-hidden rounded-lg border border-border/60 bg-background"
            >
              <div className="flex h-28 items-center justify-center bg-muted/70">
                {item.type === "PDF" ? (
                  <FileTextIcon size={28} className="text-primary" />
                ) : (
                  <FileImageIcon size={28} className="text-primary" />
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                  {item.title}
                </p>
                <GcInfoLine
                  label="File"
                  value={item.fileName}
                  className="mt-1 truncate leading-5"
                  valueClassName="font-medium"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-border/70 bg-card p-3">
          <p className="text-sm font-semibold text-foreground">Summary</p>
          <KeyValueGrid
            className="mt-2"
            items={[
              { label: "Customer", value: record.customerName },
              { label: "BP/TR Number", value: record.bpTrNumber },
              { label: "Project", value: record.projectName },
              { label: "Site", value: record.siteArea },
              { label: "Submitted By", value: record.submittedBy },
              { label: "Submitted On", value: formatDateTime(record.submittedOn) },
            ]}
          />
        </div>

        <div className="rounded-lg border border-border/70 bg-card p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-sm font-semibold text-foreground">Checklist</p>
            <p className="text-xs font-medium text-muted-foreground">
              {record.checklistDone}/{record.checklistTotal} completed
            </p>
          </div>
          <DataTable
            data={gcChecklistItems}
            columns={checklistColumns}
            showSerialNumber={false}
            emptyTitle="No checklist configured"
            containerClassName="rounded-md"
          />
        </div>
      </section>

      <ActivityHistory />
    </div>
  );
}

function ReviewGcSheet({ record }: { record: GcUploadRecord }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button type="button" variant="default" size="default" />
        }
      >
        <CheckCircleIcon size={15} />
        Review Upload
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Review Upload</SheetTitle>
          <SheetDescription>
            Complete the checklist decision for {record.submissionId}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <section className="rounded-lg border border-border/70 bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">Checklist Summary</p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {record.checklistDone}/{record.checklistTotal}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {gcChecklistItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-foreground">
                    {item.label}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-3 gap-2">
            <Button type="button" variant="outline">Approve</Button>
            <Button type="button" variant="outline">Send Back</Button>
            <Button type="button" variant="outline">Reject</Button>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">
              Reviewer Remarks
            </label>
            <Textarea
              defaultValue={record.remarks}
              className="mt-1 min-h-28"
              placeholder="Add review remarks"
            />
          </div>
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-between gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button type="button">Save Review</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ActivityHistory() {
  return (
    <Collapsible>
      <section className="rounded-xl border border-border/60 bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left">
          <span className="text-sm font-semibold text-foreground">Activity History</span>
          <span className="text-xs font-semibold text-muted-foreground">
            Edits and reviews
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 border-t border-border/60 p-3">
            <ActivityLine
              actor="Demo Admin"
              action="Edit GC saved"
              dateTime="2025-02-14 17:05"
              detail="Checklist and remarks updated."
            />
            {gcReviewComments.map((item) => (
              <ActivityLine
                key={item.id}
                actor={item.actor}
                action={`Review ${item.status}`}
                dateTime={item.dateTime}
                detail={item.comment}
              />
            ))}
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

function ActivityLine({
  actor,
  action,
  dateTime,
  detail,
}: {
  actor: string;
  action: string;
  dateTime: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{action}</p>
        <span className="text-xs font-medium text-muted-foreground">
          {formatDateTime(dateTime)}
        </span>
      </div>
      <GcInfoLine label="Actor" value={actor} className="mt-1" />
      <GcInfoLine label="Details" value={detail} valueClassName="font-medium" />
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
