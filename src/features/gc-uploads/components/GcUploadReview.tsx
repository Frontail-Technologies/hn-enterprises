"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  CaretDownIcon,
  CheckCircleIcon,
  FileImageIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import {
  gcChecklistItems,
  gcEvidenceItems,
  gcReviewComments,
} from "../services/gc-uploads.service";
import type { GcUploadRecord } from "../types/gc-uploads.types";
import { GcInfoLine } from "./GcInfoLine";
import { GcUploadsBreadcrumb } from "./GcUploadsBreadcrumb";

const decisions = ["Approve", "Send Back", "Reject"] as const;
type Decision = (typeof decisions)[number];

export function GcUploadReview({ record }: { record: GcUploadRecord }) {
  const [decision, setDecision] = useState<Decision>("Send Back");
  const [comments, setComments] = useState(record.remarks);

  const requiresComment = decision !== "Approve";

  return (
    <div className="space-y-4">
      <GcUploadsBreadcrumb
        items={[
          { label: "GC Uploads", href: "/gc-uploads" },
          { label: record.submissionId, href: `/gc-uploads/${record.id}` },
          { label: "Review" },
        ]}
      />

      <header className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Review GC Upload
              </h1>
              <StatusBadge status={record.status} />
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Validate evidence, add remarks and choose a decision.
            </p>
          </div>
          <Link
            href={`/gc-uploads/${record.id}`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Back to Detail
          </Link>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <main className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">Evidence</p>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                {record.checklistDone}/{record.checklistTotal} checks complete
              </span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {gcEvidenceItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-border/60 bg-background"
                >
                  <div className="flex h-24 items-center justify-center bg-muted/70">
                    {item.type === "PDF" ? (
                      <FileTextIcon size={28} className="text-primary" />
                    ) : (
                      <FileImageIcon size={28} className="text-primary" />
                    )}
                  </div>
                  <div className="p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <GcInfoLine
                      label="File"
                      value={item.fileName}
                      className="mt-1 truncate leading-5"
                      valueClassName="font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Checklist</p>
            <div className="mt-3 divide-y divide-border/60 rounded-lg border border-border/60">
              {gcChecklistItems.map((item) => (
                <div key={item.id} className="grid gap-3 p-3 md:grid-cols-[1fr_120px_1.4fr] md:items-center">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon
                      size={16}
                      className={cn(
                        "mt-0.5",
                        item.status === "Approved"
                          ? "text-status-success-fg"
                          : "text-primary",
                      )}
                    />
                  <div>
                    <p className="font-semibold text-foreground">{item.label}</p>
                    <GcInfoLine
                      label="Type"
                      value={`${item.type} ${item.required ? "- Required" : "- Optional"}`}
                      className="leading-5"
                      valueClassName="font-medium"
                    />
                  </div>
                </div>
                <StatusBadge status={item.status} />
                  <GcInfoLine
                    label="Remarks"
                    value={item.remarks}
                    valueClassName="font-medium"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Current Remarks</p>
            <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
              <GcInfoLine
                label="Reviewer Remarks"
                value={record.remarks}
                valueClassName="font-medium"
              />
            </div>
          </section>

          <Collapsible>
            <section className="rounded-xl border border-border/60 bg-card">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left">
                <span className="text-sm font-semibold text-foreground">Review History</span>
                <CaretDownIcon size={15} className="text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-2 border-t border-border/60 p-3">
                  {gcReviewComments.map((comment) => (
                    <div key={comment.id} className="border-l border-border pl-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground">{comment.actor}</p>
                        <StatusBadge status={comment.status} />
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <GcInfoLine label="Date" value={formatDateTime(comment.dateTime)} />
                        <GcInfoLine
                          label="Comment"
                          value={comment.comment}
                          valueClassName="font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </section>
          </Collapsible>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Review Decision</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {decisions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDecision(item)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-semibold transition-colors",
                    decision === item
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-foreground">
                Reviewer Comments {requiresComment ? "*" : "(optional)"}
              </label>
              <Textarea
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                className="mt-1 min-h-28"
                aria-invalid={requiresComment && !comments.trim()}
              />
              {requiresComment && !comments.trim() ? (
                <p className="mt-1 text-xs font-medium text-destructive">
                  Comments are required for Send Back or Reject.
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button type="button">{decision} Submission</Button>
              <Button type="button" variant="outline">
                Save Review Draft
              </Button>
            </div>
          </section>
        </aside>
      </section>
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
