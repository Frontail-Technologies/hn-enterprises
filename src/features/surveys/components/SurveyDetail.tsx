"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  CheckCircleIcon,
  CopyIcon,
  ImageSquareIcon,
  MapPinIcon,
  NotePencilIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { DetailSection } from "@/components/shared/DetailSection";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { LocationPreview } from "@/components/shared/LocationPreview";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  surveyActivity,
  surveyPhotos,
} from "../services/surveys.service";
import type { Survey } from "../types/survey.types";
import { SurveyBreadcrumb } from "./SurveyBreadcrumb";

export function SurveyDetail({ survey }: { survey: Survey }) {
  const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);
  const canApprove = survey.submissionStatus === "Submitted";
  const canEdit = survey.submissionStatus === "Draft" || survey.submissionStatus === "Sent Back";
  const selectedPhoto = surveyPhotos.find((photo) => photo.id === previewPhotoId);
  const accuracyValue = Number(survey.captureAccuracy.replace(/[^\d.]/g, ""));
  const poorAccuracy = Number.isFinite(accuracyValue) && accuracyValue > 10;
  const coordinatesText = `${survey.latitude}, ${survey.longitude}`;

  return (
    <div className="space-y-4">
      <SurveyBreadcrumb
        items={[
          { label: "Surveys", href: "/surveys" },
          { label: survey.surveyId },
        ]}
      />

      <DetailHeader
        title={survey.surveyId}
        badges={
          <>
            <StatusBadge status={survey.workableStatus} />
            <StatusBadge status={survey.submissionStatus} />
          </>
        }
        meta={
          <>
            <span>{survey.customerName} - {survey.projectName} / {survey.siteArea}</span>
            <span>Survey Date: {formatDate(survey.surveyDate)}</span>
          </>
        }
        actions={
          <>
            {canEdit ? (
              <Link
                href={`/surveys/${survey.id}/edit`}
                className={buttonVariants({ variant: "outline", size: "default" })}
              >
                <NotePencilIcon size={15} />
                Edit
              </Link>
            ) : null}
            {canApprove ? (
              <Link
                href={`/surveys/${survey.id}/approval`}
                className={buttonVariants({ variant: "default", size: "default" })}
              >
                <CheckCircleIcon size={15} />
                Review Survey
              </Link>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <main className="space-y-4">
          <OperationalPanel title="Location & Customer Summary">
            <KeyValueGrid
              columns={2}
              items={[
                { label: "Customer", value: survey.customerName },
                { label: "Mobile", value: survey.mobileNumber },
                { label: "BP / TR Number", value: survey.bpTrNumber },
                { label: "Project", value: survey.projectName },
                { label: "Site / Area", value: survey.siteArea },
                { label: "Address", value: survey.fullAddress },
              ]}
            />
          </OperationalPanel>

          <OperationalPanel title="Site Condition Responses">
            <KeyValueGrid
              columns={3}
              items={[
                { label: "House Type", value: survey.houseType },
                { label: "Connection Type", value: survey.connectionType },
                { label: "Site Accessibility", value: <StatusBadge status={survey.siteAccessibility} /> },
                { label: "Meter Placement", value: <StatusBadge status={survey.meterPlacement} /> },
                { label: "Pipeline Route", value: <StatusBadge status={survey.pipelineRoute} /> },
                { label: "Civil Work Required", value: survey.civilWorkRequired },
                { label: "Obstruction Details", value: survey.obstructionDetails },
              ]}
            />
          </OperationalPanel>

          <OperationalPanel title="Workable Assessment">
            <KeyValueGrid
              columns={2}
              items={[
                { label: "Assessment", value: survey.workableStatus },
                { label: "Reason", value: survey.reason || "-" },
                { label: "Recommended Action", value: survey.recommendedAction },
                { label: "Expected Resolution", value: formatDate(survey.expectedResolutionDate) },
              ]}
            />
          </OperationalPanel>

          <OperationalPanel title="Remarks">
            <p className="text-sm font-medium text-muted-foreground">{survey.remarks}</p>
          </OperationalPanel>

          <OperationalPanel title="Photo Gallery">
            <div className="grid gap-3 md:grid-cols-2">
              {surveyPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setPreviewPhotoId(photo.id)}
                  className="overflow-hidden rounded-lg border border-border bg-background text-left transition-colors hover:border-primary/35 hover:bg-accent/35"
                >
                  <div className="flex h-24 items-center justify-center bg-muted/40">
                    <ImageSquareIcon size={28} className="text-primary" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-foreground">{photo.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{photo.caption}</p>
                    <p className="mt-2 truncate text-xs font-semibold text-muted-foreground">
                      {photo.fileName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </OperationalPanel>
        </main>

        <aside className="space-y-3">
          <DetailSection title="Field Capture">
            <div className="mt-3 space-y-2">
              <MetaRow label="Assigned Supervisor" value={survey.supervisor} />
              <MetaRow label="Submitted By" value={survey.submittedBy} />
              <MetaRow label="GPS Coordinates" value={coordinatesText} />
              <MetaRow label="Capture Accuracy" value={survey.captureAccuracy} />
              <MetaRow label="Captured Date/Time" value={formatDateTime(survey.submissionDate)} />
              <MetaRow label="Submission Date" value={formatDateTime(survey.submissionDate)} />
              <MetaRow label="Approval Status" value={survey.submissionStatus} />
            </div>
          </DetailSection>

          <DetailSection title="Map Preview">
            <LocationPreview latitude={survey.latitude} longitude={survey.longitude} className="mt-3" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`https://www.google.com/maps?q=${survey.latitude},${survey.longitude}`}
                target="_blank"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <MapPinIcon size={14} />
                Open in Maps
              </Link>
              <button
                type="button"
                className={buttonVariants({ variant: "outline", size: "sm" })}
                onClick={() => navigator.clipboard?.writeText(coordinatesText)}
              >
                <CopyIcon size={14} />
                Copy Coordinates
              </button>
            </div>
            {poorAccuracy ? (
              <div className="mt-3 flex gap-2 rounded-lg border border-status-warning/30 bg-status-warning-bg px-3 py-2 text-xs font-semibold text-status-warning-fg">
                <WarningCircleIcon size={15} />
                Accuracy is poor. Verify this capture before approval.
              </div>
            ) : null}
          </DetailSection>

          <DetailSection title="Approval Comments">
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {survey.approvalComments || "No approval comments yet."}
            </p>
          </DetailSection>
        </aside>
      </div>

      <OperationalPanel title="Activity / Approval Timeline">
        <div className="relative space-y-3 pl-6 before:absolute before:bottom-4 before:left-2 before:top-4 before:w-px before:bg-border">
          {surveyActivity.map((activity) => (
            <div key={activity.id} className="relative rounded-lg bg-muted/25 p-3">
              <span className="absolute -left-[1.35rem] top-3 h-3 w-3 rounded-full border-2 border-card bg-primary" />
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold text-foreground">{activity.title}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {formatDateTime(activity.dateTime)}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {activity.actor}
              </p>
            </div>
          ))}
        </div>
      </OperationalPanel>

      {selectedPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="font-semibold text-foreground">{selectedPhoto.label}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {selectedPhoto.fileName}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close preview"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                onClick={() => setPreviewPhotoId(null)}
              >
                <XIcon size={16} />
              </button>
            </div>
            <div className="flex h-80 items-center justify-center bg-muted/35">
              <ImageSquareIcon size={56} className="text-primary" />
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-muted-foreground">{selectedPhoto.caption}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OperationalPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <DetailSection title={title}>{children}</DetailSection>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-semibold text-foreground">{value || "-"}</span>
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

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
