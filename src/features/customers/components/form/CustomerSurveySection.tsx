"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { ImageUploadPreview } from "@/components/shared/ImageUploadPreview";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TextField } from "../shared-fields/SectionFields";
import {
  surveyApprovalStatusOptions,
  surveyConditionStatusOptions,
  surveyWorkableStatusOptions,
} from "../../config/customer-options";
import { emptyCustomerSurvey } from "../../model/customer.defaults";
import { imagesToSurveyPhotos, surveyPhotosToImages } from "../../mappers/evidence.mapper";
import type { CustomerFormValues, CustomerSurvey } from "../../types/customer.types";

/**
 * Survey tab (§5 of the Checkpoint B brief), extracted out of
 * `CustomerForm`. Reads/writes `survey` through RHF context via a single
 * `Controller`, same as every other section. Photo mapping helpers moved to
 * `mappers/evidence.mapper.ts` since they're pure and shared with the LMC
 * evidence conversions.
 */
export function CustomerSurveySection({
  customerId,
  requiredFields,
}: {
  customerId?: string;
  requiredFields?: string[];
}) {
  const { control } = useFormContext<CustomerFormValues>();

  return (
    <Controller
      control={control}
      name="survey"
      render={({ field }) => (
        <CustomerSurveyEditor
          survey={field.value ?? emptyCustomerSurvey}
          onChange={field.onChange}
          customerId={customerId}
          requiredFields={requiredFields}
        />
      )}
    />
  );
}

function CustomerSurveyEditor({
  survey,
  onChange,
  customerId,
  requiredFields,
}: {
  survey: CustomerSurvey;
  onChange: (survey: CustomerSurvey) => void;
  customerId?: string;
  requiredFields?: string[];
}) {
  const update = <K extends keyof CustomerSurvey>(key: K, value: CustomerSurvey[K]) => {
    onChange({ ...survey, [key]: value });
  };
  const isRequired = (key: string) => requiredFields?.includes(key) ?? false;

  return (
    <div className="space-y-4">
      <SectionCard
        title="Survey"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={survey.workableStatus} />
            <StatusBadge status={survey.approvalStatus} />
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextField label="Survey ID" value={survey.surveyId} onChange={(value) => update("surveyId", value)} />
          <FormField label="Survey Date" required={isRequired("surveyDate")}>
            <DatePicker value={survey.surveyDate} onChange={(value) => update("surveyDate", value)} className="w-full" />
          </FormField>
          <TextField label="Assigned Surveyor" value={survey.assignedSurveyor} onChange={(value) => update("assignedSurveyor", value)} />
          <FormField label="Approval Status">
            <CustomerSelect
              value={survey.approvalStatus}
              options={surveyApprovalStatusOptions}
              placeholder="Select approval status"
              onChange={(value) => update("approvalStatus", value as CustomerSurvey["approvalStatus"])}
            />
          </FormField>
          <TextField label="Submitted By" value={survey.submittedBy} onChange={(value) => update("submittedBy", value)} />
          <FormField label="Submission Date / Time">
            <DatePicker value={survey.submissionDate} onChange={(value) => update("submissionDate", value)} className="w-full" />
          </FormField>
          <TextField label="Latitude" type="number" value={String(survey.latitude || "")} onChange={(value) => update("latitude", Number(value) || 0)} />
          <TextField label="Longitude" type="number" value={String(survey.longitude || "")} onChange={(value) => update("longitude", Number(value) || 0)} />
          <TextField label="Capture Accuracy" value={survey.captureAccuracy} onChange={(value) => update("captureAccuracy", value)} />
        </div>
      </SectionCard>

      <SectionCard title={isRequired("workableStatus") ? "Workable Status *" : "Workable Status"}>
        <div className="grid gap-3 md:grid-cols-3">
          {surveyWorkableStatusOptions.map((status) => (
            <button
              key={status}
              type="button"
              className={`rounded-sm border px-3 py-3 text-left transition ${
                survey.workableStatus === status
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
              onClick={() => update("workableStatus", status)}
            >
              <span className="block text-sm font-semibold">{status}</span>
              <span className="mt-1 block text-xs text-muted-foreground">Survey assessment</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Site Conditions">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FormField label="Site Accessibility">
            <CustomerSelect
              value={survey.siteAccessibility}
              options={surveyConditionStatusOptions}
              placeholder="Select site accessibility"
              onChange={(value) => update("siteAccessibility", value as CustomerSurvey["siteAccessibility"])}
            />
          </FormField>
          <FormField label="Meter Placement">
            <CustomerSelect
              value={survey.meterPlacement}
              options={surveyConditionStatusOptions}
              placeholder="Select meter placement"
              onChange={(value) => update("meterPlacement", value as CustomerSurvey["meterPlacement"])}
            />
          </FormField>
          <FormField label="Pipeline Route">
            <CustomerSelect
              value={survey.pipelineRoute}
              options={surveyConditionStatusOptions}
              placeholder="Select pipeline route"
              onChange={(value) => update("pipelineRoute", value as CustomerSurvey["pipelineRoute"])}
            />
          </FormField>
          <FormField label="Civil Work Required">
            <CustomerSelect
              value={survey.civilWorkRequired || "No"}
              options={["Yes", "No"]}
              placeholder="Select civil work"
              onChange={(value) => update("civilWorkRequired", value)}
            />
          </FormField>
          <FormField label="Expected Resolution Date">
            <DatePicker value={survey.expectedResolutionDate} onChange={(value) => update("expectedResolutionDate", value)} className="w-full" />
          </FormField>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField label="Initial Measurements">
            <Textarea value={survey.initialMeasurements} onChange={(event) => update("initialMeasurements", event.target.value)} rows={3} />
          </FormField>
          <FormField label="Obstacles / Remarks">
            <Textarea value={survey.obstaclesRemarks} onChange={(event) => update("obstaclesRemarks", event.target.value)} rows={3} />
          </FormField>
          <FormField label="Reason">
            <Textarea value={survey.reason} onChange={(event) => update("reason", event.target.value)} rows={3} />
          </FormField>
          <FormField label="Recommended Action">
            <Textarea value={survey.recommendedAction} onChange={(event) => update("recommendedAction", event.target.value)} rows={3} />
          </FormField>
          <FormField label="Survey Notes">
            <Textarea value={survey.notes} onChange={(event) => update("notes", event.target.value)} rows={3} />
          </FormField>
          <FormField label="Approval Comments">
            <Textarea value={survey.approvalComments} onChange={(event) => update("approvalComments", event.target.value)} rows={3} />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Survey Photos">
        <ImageUploadPreview
          images={surveyPhotosToImages(survey.evidence)}
          onChange={(images) => update("evidence", imagesToSurveyPhotos(images))}
          module="customers"
          recordId={customerId}
        />
      </SectionCard>
    </div>
  );
}

function CustomerSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: readonly string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value || undefined} onValueChange={(next) => onChange(next ?? "")}>
      <SelectTrigger className="w-full min-w-0">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
