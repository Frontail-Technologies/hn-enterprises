import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  FileImageIcon,
  NotePencilIcon,
  PlusIcon,
  UserIcon,
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
          { label: `${record.customerName} (${record.bpTrNumber})` },
        ]}
      />

      <header className="rounded-xl border border-border/60 bg-card px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {record.customerName}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
              <span>{record.bpTrNumber}</span>
              <span>•</span>
              <span>{record.projectName}</span>
              <span>•</span>
              <span>{record.siteArea}</span>
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

      <section className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_18rem]">
        <aside className="rounded-xl border border-border/60 bg-card p-3">
          <p className="text-sm font-bold text-foreground">Stage Progress</p>
          <div className="relative mt-4 space-y-4 pl-7 before:absolute before:bottom-5 before:left-2.5 before:top-4 before:w-px before:bg-border">
            {workStageDetails.map((stage, index) => (
              <StageProgressItem
                key={stage.id}
                stage={stage}
                active={stage.stage === record.currentStage}
                complete={index < activeIndex}
              />
            ))}
          </div>
        </aside>

        <main className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Current Stage</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">
                    {record.currentStage}
                  </h2>
                  <StatusBadge status={currentDetail.status} />
                </div>
              </div>
              <p className="rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs font-bold text-muted-foreground">
                Next: {record.expectedNextStage}
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-bold text-primary">
                {record.status === "Sent Back" ? "Sent Back Reason" : "Next Required Action"}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {record.status === "Sent Back"
                  ? "Please upload a clearer GC image and correct pipe quantity."
                  : record.nextRequiredAction}
              </p>
            </div>

            <dl className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["Updated By", currentDetail.updatedBy],
                ["Updated On", formatDate(currentDetail.completionDate || record.stageDate)],
                ["Next Action", record.nextRequiredAction],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm font-bold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-foreground">Latest Evidence</p>
              <Link
                href={`/documents?workProgressId=${record.id}`}
                className="text-xs font-bold text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {workProgressPhotos.slice(0, 2).map((photo) => (
                <Link
                  key={photo.id}
                  href={`/documents?workProgressId=${record.id}&photoId=${photo.id}`}
                  className="overflow-hidden rounded-lg border border-border/60 bg-muted/40"
                >
                  <div className="flex h-24 items-center justify-center bg-muted">
                    <FileImageIcon size={26} className="text-primary" />
                  </div>
                  <p className="truncate px-2 py-1.5 text-xs font-bold text-foreground">
                    {photo.title}
                  </p>
                </Link>
              ))}
              <Link
                href={`/work-progress/${record.id}/update`}
                className="flex h-full min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary"
              >
                <PlusIcon size={18} />
                Add More
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-bold text-foreground">Remarks</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {currentDetail.remarks}
            </p>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-bold text-foreground">Summary</p>
            <dl className="mt-3 space-y-3">
              {[
                ["Supervisor", record.supervisor],
                ["Mobile", record.mobileNumber],
                ["Last Updated", formatDate(record.lastUpdated)],
                ["Customer Availability", "Yes"],
                ["Site Address", `${record.siteArea}, Jaipur, Rajasthan 302019`],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[1fr_1.2fr] gap-3">
                  <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                  <dd className="text-xs font-bold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-bold text-foreground">Quick Actions</p>
            <div className="mt-3 divide-y divide-border/60">
              {[
                ["View Survey", `/surveys?customerId=${record.customerId}`],
                ["View Customer", `/customers/${record.customerId}`],
                ["View GC Uploads", `/gc-uploads?customerId=${record.customerId}`],
                ["View History", `/work-progress/${record.id}/history`],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-2 py-2 text-sm font-bold text-foreground hover:text-primary"
                >
                  <UserIcon size={14} className="text-primary" />
                  {label}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section id="history" className="rounded-xl border border-border/60 bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-foreground">History Timeline (Latest)</p>
          <Link
            href={`/work-progress/${record.id}/history`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View All History
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {workProgressHistory.map((item) => (
            <div key={item.id} className="relative border-l border-border pl-3">
              <span className="absolute -left-1 top-1.5 size-2 rounded-full bg-primary" />
              <p className="text-sm font-bold text-foreground">{item.title}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{item.actor}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(item.dateTime)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StageProgressItem({
  stage,
  active,
  complete,
}: {
  stage: WorkStageDetail;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className="relative">
      <span
        className={cn(
          "absolute -left-[1.6rem] top-1 flex size-4 items-center justify-center rounded-full border-2 border-card",
          active
            ? "bg-destructive"
            : complete
              ? "bg-status-success"
              : "border border-border bg-background",
        )}
      />
      <div>
        <p className="text-sm font-bold text-foreground">{stage.stage}</p>
        <StatusBadge status={stage.status} className="mt-1" />
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {formatDate(stage.completionDate)}
        </p>
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
