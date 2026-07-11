"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { CaretDownIcon, MapPinIcon, WarningCircleIcon } from "@phosphor-icons/react";
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
  const [status, setStatus] = useState<WorkProgressStatus>(record.status);
  const [workDate, setWorkDate] = useState(record.stageDate);
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
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
  const isSequenceOverride = selectedStageIndex > nextAllowedIndex;
  const needsOverrideReason = overrideSequence || isSequenceOverride;

  return (
    <form className="space-y-4">
      <WorkProgressBreadcrumb
        items={[
          { label: "Work Progress", href: "/work-progress" },
          { label: record.customerName, href: `/work-progress/${record.id}` },
          { label: "Update Stage" },
        ]}
      />

      <header className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Update Stage</h1>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {record.customerName} / {record.bpTrNumber}
            </p>
          </div>
          <Link
            href={`/work-progress/${record.id}`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
        </div>
      </header>

      <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
          <div>
            <p className="text-sm font-bold text-foreground">Customer / Project Summary</p>
            <dl className="mt-3 grid gap-x-6 gap-y-2 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Customer", record.customerName],
                ["BP / TR", record.bpTrNumber],
                ["Project", record.projectName],
                ["Site", record.siteArea],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-bold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs font-bold text-muted-foreground">Current Stage</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={record.status} />
              <span className="text-base font-bold text-foreground">
                {record.currentStage}
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              Expected next: <span className="text-foreground">{record.expectedNextStage}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
          <div>
            <p className="text-sm font-bold text-foreground">Stage Update</p>
            <p className="text-xs font-medium text-muted-foreground">
              Survey and Workable remain read-only from the Survey module.
            </p>
          </div>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
            Selected: {stage}
          </span>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
          <Field label="Work Date">
            <DatePicker value={workDate} onChange={setWorkDate} />
          </Field>
          <Field label="Quantity if applicable">
            <Input
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="e.g. 18.5 m"
            />
          </Field>
        </div>

        <div className="mt-3">
          <Field label="Stage Remarks">
            <Textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder={
                needsOverrideReason
                  ? "Mandatory reason for sequence override"
                  : "Add field remarks for this stage"
              }
              aria-invalid={needsOverrideReason && !remarks.trim()}
              className="min-h-20"
            />
          </Field>
        </div>

        <div className="mt-3">
          <Field label="Evidence">
            <Input type="file" multiple accept="image/*,.pdf" />
          </Field>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Attach stage evidence only. Customer master data is not changed by this update.
          </p>
        </div>
      </section>

      <Collapsible
        open={locationOpen}
        onOpenChange={setLocationOpen}
        className="rounded-xl border border-border bg-card shadow-sm"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
            <MapPinIcon size={16} className="text-primary" />
            Optional Location
          </span>
          <CaretDownIcon
            size={16}
            className={cn("text-muted-foreground transition-transform", locationOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-3 border-t border-border p-3 xl:grid-cols-[1fr_320px]">
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
        className="rounded-xl border border-border bg-card shadow-sm"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
            <WarningCircleIcon size={16} className="text-primary" />
            Advanced
          </span>
          <CaretDownIcon
            size={16}
            className={cn("text-muted-foreground transition-transform", advancedOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border p-3">
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
              Next expected stage is {nextAllowedStage}. Enable only after field verification.
              Override or skipped-stage updates require remarks and create history.
            </p>
            {needsOverrideReason ? (
              <p className="mt-2 text-xs font-bold text-primary">
                Stage remarks are mandatory before submitting.
              </p>
            ) : null}
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
        <Button type="button">Submit Update</Button>
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
