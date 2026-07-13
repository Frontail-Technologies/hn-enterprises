"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { surveyRevisions } from "../services/surveys.service";
import type { Survey } from "../types/survey.types";
import { SurveyBreadcrumb } from "./SurveyBreadcrumb";

export function SurveyApproval({ survey }: { survey: Survey }) {
  const [decision, setDecision] = useState<"Approve" | "Reject" | "Send Back">("Approve");
  const remarksRequired = decision === "Reject" || decision === "Send Back";
  const showRemarks = true;

  return (
    <div>
      <SurveyBreadcrumb
        items={[
          { label: "Surveys", href: "/surveys" },
          { label: survey.surveyId, href: `/surveys/${survey.id}` },
          { label: "Approval" },
        ]}
      />

      <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">Survey Approval</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {survey.surveyId} - {survey.customerName}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={survey.workableStatus} />
            <StatusBadge status={survey.submissionStatus} />
          </div>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_340px]">
        <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Decision</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["Approve", "Reject", "Send Back"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDecision(item)}
                className={`h-8 rounded-lg border px-3 text-sm font-semibold ${
                  decision === item
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/40"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {remarksRequired ? (
            <Alert className="mt-3 border-status-warning/30 bg-status-warning-bg">
              <AlertTitle>Remarks required</AlertTitle>
              <AlertDescription>
                Add a clear reason before rejecting or sending this survey back.
              </AlertDescription>
            </Alert>
          ) : null}

          {showRemarks ? (
            <div className="mt-3">
              <Label className="mb-1.5 block text-xs font-medium text-foreground">
                {remarksRequired ? "Remarks (required)" : "Approval Remarks (optional)"}
              </Label>
              <Textarea
                rows={3}
                className="min-h-16"
                placeholder={
                  remarksRequired
                    ? "Reason is mandatory for this action"
                    : "Optional approval comments"
                }
              />
            </div>
          ) : null}

          <div className="mt-3 flex justify-end gap-2">
            <Link
              href={`/surveys/${survey.id}`}
              className={buttonVariants({ variant: "outline", size: "default" })}
            >
              Cancel
            </Link>
            <Button type="button">{decision}</Button>
          </div>
        </section>

        <aside className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Previous Revisions</p>
          <div className="mt-2 space-y-2">
            {surveyRevisions.map((revision) => (
              <div key={revision.id} className="rounded-lg border border-border bg-muted/20 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {revision.revisionNumber}
                  </p>
                  <StatusBadge status={revision.status} />
                </div>
                <div className="mt-2 grid gap-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Submitted by {revision.submittedBy}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatDate(revision.date)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{revision.notes}</p>
                <Link
                  href={`/surveys/${survey.id}?revision=${revision.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View Revision
                </Link>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
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
