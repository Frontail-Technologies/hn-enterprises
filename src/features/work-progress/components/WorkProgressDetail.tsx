import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  ArrowSquareOutIcon,
  ImageSquareIcon,
  NotePencilIcon,
} from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import {
  workProgressHistory,
  workProgressPhotos,
  workStageDetails,
  workStages,
} from "../services/work-progress.service";
import type {
  WorkProgressRecord,
  WorkStageDetail,
} from "../types/work-progress.types";
import { WorkProgressBreadcrumb } from "./WorkProgressBreadcrumb";

export function WorkProgressDetail({ record }: { record: WorkProgressRecord }) {
  const activeIndex = workStages.indexOf(record.currentStage);
  const currentDetail =
    workStageDetails.find((stage) => stage.stage === record.currentStage) ??
    workStageDetails[activeIndex];

  return (
    <div className="space-y-4">
      <WorkProgressBreadcrumb
        items={[
          { label: "Work Progress", href: "/work-progress" },
          { label: record.customerName },
        ]}
      />

      <header className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">{record.customerName}</h1>
              <span className="text-sm font-bold text-muted-foreground">
                {record.bpTrNumber}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {record.projectName} / {record.siteArea}
            </p>
          </div>
          <Link
            href={`/work-progress/${record.id}/update`}
            className={buttonVariants({ variant: "default", size: "default" })}
          >
            <NotePencilIcon size={15} />
            Update Stage
          </Link>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr)_1fr]">
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div>
              <p className="text-sm font-bold text-foreground">Stage Timeline</p>
              <p className="text-xs font-medium text-muted-foreground">
                Survey and Workable are inherited from Surveys.
              </p>
            </div>
          </div>
          <div className="relative mt-3 space-y-3 pl-7 before:absolute before:bottom-4 before:left-2.5 before:top-4 before:w-px before:bg-border">
            {workStageDetails.map((stage, index) => (
              <StageTimelineItem
                key={stage.id}
                stage={stage}
                active={stage.stage === record.currentStage}
                complete={index < activeIndex}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <CurrentWorkPanel record={record} detail={currentDetail} />

          <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="text-sm font-bold text-foreground">Latest Evidence</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {workProgressPhotos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/documents?workProgressId=${record.id}&photoId=${photo.id}`}
                  className="overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-primary/35 hover:bg-accent/35"
                >
                  <div className="flex h-20 items-center justify-center bg-muted/35">
                    <ImageSquareIcon size={25} className="text-primary" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-bold text-foreground">{photo.title}</p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {formatDate(photo.date)}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {photo.fileName}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="text-sm font-bold text-foreground">Remarks</p>
            <div className="mt-3 rounded-lg bg-muted/25 p-3">
              <p className="text-sm text-muted-foreground">{currentDetail.remarks}</p>
              <Link
                href={currentDetail.relatedHref}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                {currentDetail.relatedRecord}
                <ArrowSquareOutIcon size={13} />
              </Link>
            </div>
          </section>
        </div>
      </section>

      <section id="history" className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <p className="text-sm font-bold text-foreground">Stage History</p>
        <div className="mt-3 grid gap-2 lg:grid-cols-3">
          {workProgressHistory.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-background p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-bold text-foreground">{item.title}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {formatDateTime(item.dateTime)}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.remarks}</p>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">{item.actor}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CurrentWorkPanel({
  record,
  detail,
}: {
  record: WorkProgressRecord;
  detail: WorkStageDetail;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">Current Work</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={detail.status} />
            <span className="text-lg font-bold text-foreground">{record.currentStage}</span>
          </div>
        </div>
        <Link
          href={`/work-progress/${record.id}/update`}
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          <NotePencilIcon size={14} />
          Update Stage
        </Link>
      </div>

      <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Assigned User", record.supervisor],
          ["Start Date", formatDate(record.stageDate)],
          ["Next Required Action", record.nextRequiredAction],
          ["Expected Next Stage", record.expectedNextStage],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-muted/25 p-2.5">
            <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-bold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function StageTimelineItem({
  stage,
  active,
  complete,
}: {
  stage: WorkStageDetail;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border p-3",
        active
          ? "border-primary/35 bg-primary/10"
          : "border-border bg-background",
      )}
    >
      <span
        className={cn(
          "absolute -left-[1.62rem] top-3.5 flex size-4 items-center justify-center rounded-full border-2 border-card",
          active
            ? "bg-primary"
            : complete
              ? "bg-primary/70"
              : "bg-muted-foreground/40",
        )}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-foreground">{stage.stage}</p>
          {stage.readOnly ? (
            <p className="text-[11px] font-semibold text-muted-foreground">
              Read-only source
            </p>
          ) : null}
        </div>
        <StatusBadge status={stage.status} />
      </div>
      <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
        <span>{formatDate(stage.completionDate)}</span>
        <span>{stage.updatedBy}</span>
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

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
