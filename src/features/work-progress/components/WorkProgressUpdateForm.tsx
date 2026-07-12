"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  CaretDownIcon,
  FileImageIcon,
  MapPinIcon,
  PlusIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/shared/DatePicker";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import {
  workProgressPhotos,
  workProgressStatuses,
  workStageDetails,
  workStages,
} from "../services/work-progress.service";
import type {
  WorkProgressRecord,
  WorkProgressStatus,
  WorkStage,
} from "../types/work-progress.types";
import { WorkProgressBreadcrumb } from "./WorkProgressBreadcrumb";

const editableStages = workStages.filter(
  (stage) => stage !== "Survey" && stage !== "Workable",
);

export function WorkProgressUpdateForm({ record }: { record: WorkProgressRecord }) {
  const [stage, setStage] = useState<WorkStage>(
    record.currentStage === "Survey" || record.currentStage === "Workable"
      ? record.expectedNextStage
      : record.currentStage,
  );
  const [status, setStatus] = useState<WorkProgressStatus>(
    record.status === "Sent Back" ? "Completed" : record.status,
  );
  const [workDate, setWorkDate] = useState(record.stageDate);
  const [quantity, setQuantity] = useState("18.5 m");
  const [remarks, setRemarks] = useState(
    "Attached clearer GC images and corrected pipe quantity as per site measurement.",
  );
  const [locationOpen, setLocationOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [overrideSequence, setOverrideSequence] = useState(false);
  const [coordinates, setCoordinates] = useState({
    latitude: 26.8951,
    longitude: 75.7684,
  });

  const nextAllowedStage = useMemo(() => {
    let lastCompletedIndex = -1;
    for (let index = workStageDetails.length - 1; index >= 0; index -= 1) {
      const detail = workStageDetails[index];
      if (detail.status === "Completed" || detail.status === "Workable") {
        lastCompletedIndex = index;
        break;
      }
    }
    return workStages[Math.min(lastCompletedIndex + 1, workStages.length - 1)];
  }, []);

  const selectedStageIndex = workStages.indexOf(stage);
  const nextAllowedIndex = workStages.indexOf(nextAllowedStage);
  const needsOverrideReason = overrideSequence || selectedStageIndex > nextAllowedIndex;

  return (
    <form className="space-y-4">
      <WorkProgressBreadcrumb
        items={[
          { label: "Work Progress", href: "/work-progress" },
          { label: record.customerName, href: `/work-progress/${record.id}` },
          { label: "Update Stage" },
        ]}
      />

      <section className="rounded-xl border border-border/60 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Update Stage</h1>
            <p className="mt-1 text-sm font-bold text-primary">
              Resubmit {record.currentStage} Report
            </p>
          </div>
          <Link
            href={`/work-progress/${record.id}`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
        </div>

        <div className="grid gap-4 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <dl className="grid gap-x-8 gap-y-3 md:grid-cols-4">
            {[
              ["Customer", record.customerName],
              ["BP / TR No.", record.bpTrNumber],
              ["Project", record.projectName],
              ["Site", record.siteArea],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-bold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs font-semibold text-muted-foreground">Current Stage</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{record.currentStage}</span>
              <StatusBadge status={record.status} />
            </div>
            <p className="mt-3 text-xs font-semibold text-muted-foreground">
              Expected Next
            </p>
            <p className="text-sm font-bold text-foreground">{record.expectedNextStage}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-card p-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-sm font-bold text-foreground">
            Sent Back Reason by {record.updatedBy} on 12 Feb 2025, 04:30 PM
          </p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Please upload a clearer GC image and correct pipe quantity.
          </p>
        </div>

        <p className="mt-4 text-sm font-bold text-foreground">Update Details</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Work Date *">
            <DatePicker value={workDate} onChange={setWorkDate} />
          </Field>
          <Field label="Quantity (if applicable)">
            <Input value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          </Field>
          <Field label="Stage">
            <Select value={stage} onValueChange={(value) => setStage(value as WorkStage)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {editableStages.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onValueChange={(value) => setStatus(value as WorkProgressStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {workProgressStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="mt-3">
          <Field label="Remarks *">
            <Textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              aria-invalid={needsOverrideReason && !remarks.trim()}
              className="min-h-20"
            />
          </Field>
        </div>

        <div className="mt-3">
          <p className="text-xs font-bold text-foreground">
            Evidence (GC Photos / Documents) *
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {workProgressPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative flex h-20 w-32 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted"
              >
                <FileImageIcon size={24} className="text-primary" />
                <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-background/90 px-1 text-[10px] font-bold text-foreground">
                  {photo.title}
                </span>
                <button
                  type="button"
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground"
                  aria-label="Remove evidence"
                >
                  <XIcon size={12} />
                </button>
              </div>
            ))}
            <label className="flex h-20 w-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary">
              <PlusIcon size={18} />
              Add More
              <span className="mt-1 text-[10px] font-medium">JPG, PNG, PDF</span>
              <Input type="file" multiple accept="image/*,.pdf" className="sr-only" />
            </label>
          </div>
        </div>
      </section>

      <Collapsible
        open={locationOpen}
        onOpenChange={setLocationOpen}
        className="rounded-xl border border-border/60 bg-card"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
            <MapPinIcon size={16} className="text-primary" />
            Location Evidence (Optional)
          </span>
          <CaretDownIcon
            size={16}
            className={cn("text-muted-foreground transition-transform", locationOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-3 border-t border-border/60 p-4 xl:grid-cols-[1fr_320px]">
            <LocationPicker
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
              heightClassName="h-56"
              onChange={setCoordinates}
            />
            <div className="space-y-3">
              <Field label="Latitude">
                <Input value={coordinates.latitude.toFixed(6)} readOnly />
              </Field>
              <Field label="Longitude">
                <Input value={coordinates.longitude.toFixed(6)} readOnly />
              </Field>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible
        open={advancedOpen}
        onOpenChange={setAdvancedOpen}
        className="rounded-xl border border-border/60 bg-card"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
            <WarningCircleIcon size={16} className="text-primary" />
            Advanced / Override
          </span>
          <CaretDownIcon
            size={16}
            className={cn("text-muted-foreground transition-transform", advancedOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border/60 p-4">
            <label className="flex items-start gap-2 text-sm font-bold text-foreground">
              <input
                type="checkbox"
                checked={overrideSequence}
                onChange={(event) => setOverrideSequence(event.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              Admin override sequence
            </label>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Next expected stage is {nextAllowedStage}. Override or skipped-stage updates
              require remarks and create history.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <footer className="sticky bottom-0 z-10 flex justify-end gap-2 border-t border-border bg-background/95 px-1 py-3 backdrop-blur">
        <Link
          href={`/work-progress/${record.id}`}
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          Cancel
        </Link>
        <Button type="button" variant="outline">
          Save Draft
        </Button>
        <Button type="button">Resubmit {record.currentStage}</Button>
      </footer>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-foreground">{label}</Label>
      {children}
    </div>
  );
}
