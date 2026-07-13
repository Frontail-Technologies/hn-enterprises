"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  UserCircleGearIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { LocationPreview } from "@/components/shared/LocationPreview";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  surveys,
  workableStatusOptions,
} from "../services/surveys.service";
import type { Survey } from "../types/survey.types";
import { SurveyBreadcrumb } from "./SurveyBreadcrumb";

const steps = [
  "Customer & Location",
  "Site Conditions",
  "Workable Assessment",
  "Photos & Documents",
  "Review & Submit",
];

export function SurveyForm({ mode, survey }: { mode: "create" | "edit"; survey?: Survey }) {
  const isEdit = mode === "edit";
  const values = survey ?? surveys[0];
  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));
  const [coordinates, setCoordinates] = useState({
    latitude: values.latitude,
    longitude: values.longitude,
  });
  const [formData, setFormData] = useState({
    houseType: values.houseType,
    connectionType: values.connectionType,
    siteAccessibility: values.siteAccessibility,
    meterPlacement: values.meterPlacement,
    pipelineRoute: values.pipelineRoute,
    civilWorkRequired: values.civilWorkRequired,
    obstructionDetails: values.obstructionDetails,
    notes: values.notes,
    workableStatus: values.workableStatus,
    reason: values.reason,
    recommendedAction: values.recommendedAction,
    expectedResolutionDate: values.expectedResolutionDate,
    remarks: values.remarks,
  });
  const [photoCaptions, setPhotoCaptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    setVisitedSteps((current) => new Set([...current, nextStep]));
  };

  const updateFormData = (key: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  return (
    <div>
      <SurveyBreadcrumb
        items={[
          { label: "Surveys", href: "/surveys" },
          ...(isEdit && survey
            ? [
                { label: survey.surveyId, href: `/surveys/${survey.id}` },
                { label: "Edit" },
              ]
            : [{ label: "New Survey" }]),
        ]}
      />

      <PageHeader
        title={isEdit ? "Edit Survey" : "New Survey"}
        subtitle="Capture site conditions, workable assessment, field photos, and approval-ready remarks."
      />

      <div className="grid gap-4 xl:grid-cols-[230px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-2 shadow-sm">
          <div className="space-y-1">
            {steps.map((label, index) => {
              const active = index === step;
              const complete = visitedSteps.has(index) && index !== step;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    active
                      ? "border border-primary/35 bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-[11px]">
                    {complete ? <CheckCircleIcon size={13} /> : index + 1}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <form className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{steps[step]}</p>
            <p className="text-xs font-medium text-muted-foreground">
              Step {step + 1} of {steps.length}
            </p>
          </div>

          <div className="p-4">
            {step === 0 ? (
              <CustomerLocationStep
                values={values}
                coordinates={coordinates}
                onCoordinatesChange={(nextCoordinates) => {
                  setCoordinates(nextCoordinates);
                  setDirty(true);
                }}
              />
            ) : null}
            {step === 1 ? (
              <SiteConditionsStep formData={formData} onChange={updateFormData} />
            ) : null}
            {step === 2 ? (
              <WorkableAssessmentStep
                formData={formData}
                onChange={updateFormData}
              />
            ) : null}
            {step === 3 ? (
              <PhotosDocumentsStep
                captions={photoCaptions}
                onCaptionChange={(key, value) => {
                  setPhotoCaptions((current) => ({ ...current, [key]: value }));
                  setDirty(true);
                }}
              />
            ) : null}
            {step === 4 ? (
              <ReviewStep values={values} formData={formData} coordinates={coordinates} />
            ) : null}
          </div>

          <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
            <div className="flex gap-2">
              <Link
                href={isEdit && survey ? `/surveys/${survey.id}` : "/surveys"}
                className={buttonVariants({ variant: "outline", size: "default" })}
              >
                Cancel
              </Link>
              <Button type="button" variant="outline">
                Save Draft
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={step === 0}
                onClick={() => goToStep(Math.max(0, step - 1))}
              >
                <CaretLeftIcon size={15} />
                Previous
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => goToStep(Math.min(steps.length - 1, step + 1))}
                >
                  Next
                  <CaretRightIcon size={15} />
                </Button>
              ) : (
                <Button type="button">Submit Survey</Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerLocationStep({
  values,
  coordinates,
  onCoordinatesChange,
}: {
  values: Survey;
  coordinates: { latitude: number; longitude: number };
  onCoordinatesChange: (coordinates: { latitude: number; longitude: number }) => void;
}) {
  return (
      <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-muted/15 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Customer Summary</p>
              <p className="text-xs font-medium text-muted-foreground">
                Read-only customer master data. Survey saves will not update this record.
              </p>
            </div>
            <UserCircleGearIcon size={20} className="text-primary" />
          </div>
          <dl className="mt-3 grid gap-x-5 gap-y-2 md:grid-cols-2">
            {[
              ["Customer Name", values.customerName],
              ["Mobile Number", values.mobileNumber],
              ["BP / TR Number", values.bpTrNumber],
              ["Project", values.projectName],
              ["Site / Area", values.siteArea],
              ["Full Address", values.fullAddress],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                <dd className="text-sm font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/customers/${values.customerId}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Open Customer Record
            </Link>
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <WarningCircleIcon size={14} />
              Request Customer Correction
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Field label="GPS Location">
          <div className="grid grid-cols-2 gap-2">
            <Input value={coordinates.latitude} readOnly />
            <Input value={coordinates.longitude} readOnly />
          </div>
        </Field>
        <LocationPicker
          latitude={coordinates.latitude}
          longitude={coordinates.longitude}
          heightClassName="h-56"
          onChange={onCoordinatesChange}
        />
        <Link
          href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
          target="_blank"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View on Map
        </Link>
      </div>
    </div>
  );
}

function SiteConditionsStep({
  formData,
  onChange,
}: {
  formData: {
    houseType: string;
    connectionType: string;
    siteAccessibility: string;
    meterPlacement: string;
    pipelineRoute: string;
    civilWorkRequired: string;
    obstructionDetails: string;
    notes: string;
  };
  onChange: (key: keyof SurveyFormState, value: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Field label="House Type">
        <Input
          value={formData.houseType}
          onChange={(event) => onChange("houseType", event.target.value)}
        />
      </Field>
      <Field label="Connection Type">
        <Input
          value={formData.connectionType}
          onChange={(event) => onChange("connectionType", event.target.value)}
        />
      </Field>
      <Field label="Site Accessibility">
        <StatusSelect
          value={formData.siteAccessibility}
          onChange={(value) => onChange("siteAccessibility", value)}
        />
      </Field>
      <Field label="Meter Placement Possibility">
        <StatusSelect
          value={formData.meterPlacement}
          onChange={(value) => onChange("meterPlacement", value)}
        />
      </Field>
      <Field label="Pipeline Route Availability">
        <StatusSelect
          value={formData.pipelineRoute}
          onChange={(value) => onChange("pipelineRoute", value)}
        />
      </Field>
      <Field label="Civil Work Required">
        <Select
          value={formData.civilWorkRequired}
          onValueChange={(value) => onChange("civilWorkRequired", value ?? "No")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {["Yes", "No"].map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Obstruction Details" className="md:col-span-2 xl:col-span-3">
        <Textarea
          value={formData.obstructionDetails}
          rows={3}
          onChange={(event) => onChange("obstructionDetails", event.target.value)}
        />
      </Field>
      <Field label="Notes" className="md:col-span-2 xl:col-span-3">
        <Textarea
          value={formData.notes}
          rows={3}
          onChange={(event) => onChange("notes", event.target.value)}
        />
      </Field>
    </div>
  );
}

function WorkableAssessmentStep({
  formData,
  onChange,
}: {
  formData: SurveyFormState;
  onChange: (key: keyof SurveyFormState, value: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Workable Assessment">
        <Select
          value={formData.workableStatus}
          onValueChange={(value) => onChange("workableStatus", value ?? "Workable")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select workable status" />
          </SelectTrigger>
          <SelectContent>
            {workableStatusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Expected Resolution Date">
        <DatePicker
          value={formData.expectedResolutionDate}
          onChange={(value) => onChange("expectedResolutionDate", value)}
        />
      </Field>
      <Field label="Reason" className="md:col-span-2">
        <Textarea
          value={formData.reason}
          rows={3}
          onChange={(event) => onChange("reason", event.target.value)}
        />
      </Field>
      <Field label="Recommended Action" className="md:col-span-2">
        <Textarea
          value={formData.recommendedAction}
          rows={3}
          onChange={(event) => onChange("recommendedAction", event.target.value)}
        />
      </Field>
      <Field label="Survey Remarks" className="md:col-span-2">
        <Textarea
          value={formData.remarks}
          rows={3}
          onChange={(event) => onChange("remarks", event.target.value)}
        />
      </Field>
    </div>
  );
}

function PhotosDocumentsStep({
  captions,
  onCaptionChange,
}: {
  captions: Record<string, string>;
  onCaptionChange: (key: string, value: string) => void;
}) {
  const photoFields = [
    "Site front photo",
    "Meter location photo",
    "Pipeline route photo",
    "Obstruction photo",
    "Other files",
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {photoFields.map((field) => (
        <div key={field} className="rounded-lg border border-border bg-muted/15 p-3">
          <Field label={field}>
            <Input type="file" />
          </Field>
          <Field label="Caption" className="mt-3">
            <Input
              value={captions[field] ?? ""}
              placeholder="Add caption"
              onChange={(event) => onCaptionChange(field, event.target.value)}
            />
          </Field>
        </div>
      ))}
    </div>
  );
}

function ReviewStep({
  values,
  formData,
  coordinates,
}: {
  values: Survey;
  formData: SurveyFormState;
  coordinates: { latitude: number; longitude: number };
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-lg border border-border p-3">
        <p className="text-sm font-semibold text-foreground">Review Summary</p>
        <dl className="mt-3 grid gap-2 md:grid-cols-2">
          {[
            ["Customer", values.customerName],
            ["BP / TR Number", values.bpTrNumber],
            ["Project", values.projectName],
            ["Site / Area", values.siteArea],
            ["Workable", formData.workableStatus],
            ["Expected Resolution", formData.expectedResolutionDate || "-"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
              <dd className="text-sm font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <LocationPreview latitude={coordinates.latitude} longitude={coordinates.longitude} />
    </div>
  );
}

type SurveyFormState = {
  houseType: string;
  connectionType: string;
  siteAccessibility: string;
  meterPlacement: string;
  pipelineRoute: string;
  civilWorkRequired: string;
  obstructionDetails: string;
  notes: string;
  workableStatus: string;
  reason: string;
  recommendedAction: string;
  expectedResolutionDate: string;
  remarks: string;
};

function StatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={(nextValue) => onChange(nextValue ?? value)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {["Workable", "Partially Workable", "Not Workable", "Approved", "Rejected"].map(
          (status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}
