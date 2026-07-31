"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageSquareIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import {
  ImageUploadPreview,
  type ImagePreviewItem,
} from "@/components/shared/ImageUploadPreview";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProjectSitesQuery, useProjectsQuery } from "@/features/projects/hooks/useProjects";
import {
  billingCompletionFields,
  deriveLmcPipeCurrentStage,
  commissioningConversionFields,
  customerConnectionFields,
  customerStatusOptions,
  defaultCustomerFormValues,
  deriveLmcOverallStatus,
  emptyCustomerSurvey,
  fittingAccessoryFields,
  giMeasurementFields,
  isolationValveFields,
  lmcPipeRecordFields,
  lmcPipelineFields,
  mdpeFittingFields,
  surveyApprovalStatusOptions,
  surveyConditionStatusOptions,
  surveyWorkableStatusOptions,
  type FieldDefinition,
  type LmcCivilWork,
  type LmcPipeEditableFields,
} from "../services/customers.service";
import { useCreateCustomer, useCustomerQuery, useUpdateCustomer } from "../hooks/useCustomers";
import { customersApi } from "../services/customers.service";
import { CustomerEvidencePanel, CustomerReportsPanel } from "./CustomerEvidenceReports";
import type {
  CustomerFormValues,
  CustomerSurvey,
  CustomerSurveyPhoto,
  LmcPipeSizeRecord,
  LmcPipelineWork,
} from "../types/customer.types";

interface CustomerFormProps {
  mode: "create" | "edit";
  customerId?: string;
}

export function CustomerForm({ mode, customerId }: CustomerFormProps) {
  const isEdit = mode === "edit";
  const { data: customer, isLoading } = useCustomerQuery(customerId ?? "");

  if (isEdit && isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading customer...</p>;
  }

  return (
    <CustomerFormFields
      key={customer?.id ?? "create"}
      mode={mode}
      customerId={customerId}
      initialValues={customer ?? defaultCustomerFormValues}
    />
  );
}

function CustomerFormFields({
  mode,
  customerId,
  initialValues,
}: {
  mode: "create" | "edit";
  customerId?: string;
  initialValues: CustomerFormValues;
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [values, setValues] = useState<CustomerFormValues>(initialValues);
  const { data: projects = [] } = useProjectsQuery();
  const { data: sites = [] } = useProjectSitesQuery(values.projectId);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(customerId ?? "");
  const mutation = isEdit ? updateCustomer : createCustomer;

  const projectOptions = projects.map((project) => ({ value: project.id, label: project.name }));

  const handleSave = async () => {
    if (!values.customerConnection.customerName.trim() || !values.projectId || !values.siteId) return;

    const saved = await mutation.mutateAsync(values);

    const editedPipeRecords = values.lmcPipelineWork.pipeRecords.filter(
      (record) =>
        record.lengthMetres || record.layingDate || record.testingDate || record.purgingDate ||
        record.jointFittingDetails || (record.remarks && record.remarks !== "-") ||
        record.layingStatus !== "Not Started" || record.testingStatus !== "Not Started" || record.purgingStatus !== "Not Started",
    );

    for (const record of editedPipeRecords) {
      await customersApi.upsertLmcPipeRecord(saved.id, record);
    }

    const newDocuments = values.documents.filter((doc) => doc.id.startsWith("cust-evidence-"));
    for (const doc of newDocuments) {
      await customersApi.createDocument(saved.id, doc);
    }

    router.push(`/customers/${saved.id}`);
  };

  return (
    <div>
      <PageHeader title={isEdit ? "Edit Customer" : "Create Customer"} />

      <form
        className="pb-28"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <Tabs defaultValue="customer" className="flex flex-col gap-3">
          <div className="border-b border-border/70">
            <TabsList variant="line" className="flex w-full max-w-full justify-start gap-6 overflow-x-auto p-0">
              <FormTab value="customer">Customer Details</FormTab>
              <FormTab value="survey">Survey</FormTab>
              <FormTab value="gi">GI Measurements</FormTab>
              <FormTab value="isolation">Isolation & Regulators</FormTab>
              <FormTab value="fittings">Fittings & Accessories</FormTab>
              <FormTab value="lmc">LMC Pipeline</FormTab>
              <FormTab value="civil">Civil Work</FormTab>
              <FormTab value="mdpe">MDPE Fittings</FormTab>
              <FormTab value="commissioning">Meter & Commissioning</FormTab>
              <FormTab value="billing">Billing & Remarks</FormTab>
              <FormTab value="images">Images / Evidence</FormTab>
              <FormTab value="reports">Reports</FormTab>
            </TabsList>
          </div>

          <TabsContent value="customer">
            <SectionCard title="Customer & Connection Details">
              <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="Project">
                  <Select
                    value={values.projectId || undefined}
                    onValueChange={(projectId) => {
                      const project = projectOptions.find((item) => item.value === projectId);
                      setValues((current) => ({
                        ...current,
                        projectId: projectId ?? "",
                        projectName: project?.label ?? "",
                        siteId: "",
                        siteArea: "",
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectOptions.map((project) => (
                        <SelectItem key={project.value} value={project.value}>
                          {project.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Site / Area">
                  <Select
                    value={values.siteId || undefined}
                    onValueChange={(siteId) => {
                      const site = sites.find((item) => item.id === siteId);
                      setValues((current) => ({ ...current, siteId: siteId ?? "", siteArea: site?.name ?? "" }));
                    }}
                    disabled={!values.projectId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select site / area" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <TextField label="City" value={values.city} onChange={(city) => setValues((current) => ({ ...current, city }))} />
                <FormField label="Customer Status">
                  <Select value={values.status} onValueChange={(status) => setValues((current) => ({ ...current, status: (status ?? "Draft") as CustomerFormValues["status"] }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customerStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <SectionFields
                fields={customerConnectionFields}
                values={values.customerConnection}
                onChange={(next) => setValues((current) => ({ ...current, customerConnection: next }))}
              />
            </SectionCard>
          </TabsContent>
          <TabsContent value="survey">
            <CustomerSurveyEditor
              survey={values.survey ?? emptyCustomerSurvey}
              onChange={(survey) => setValues((current) => ({ ...current, survey }))}
            />
          </TabsContent>

          <TabsContent value="gi">
            <SectionCard title="GI Installation Measurements">
              <SectionFields
                fields={giMeasurementFields}
                values={values.giMeasurements}
                onChange={(next) => setValues((current) => ({ ...current, giMeasurements: next }))}
              />
            </SectionCard>
          </TabsContent>

          <TabsContent value="isolation">
            <SectionCard title="Isolation Valves & Regulators">
              <SectionFields
                fields={isolationValveFields}
                values={values.valvesRegulators}
                onChange={(next) => setValues((current) => ({ ...current, valvesRegulators: next }))}
              />
            </SectionCard>
          </TabsContent>

          <TabsContent value="fittings">
            <SectionCard title="Fittings & Accessories">
              <SectionFields
                fields={fittingAccessoryFields}
                values={values.fittingsAccessories}
                onChange={(next) => setValues((current) => ({ ...current, fittingsAccessories: next }))}
              />
            </SectionCard>
          </TabsContent>

          <TabsContent value="lmc">
            <LmcPipelineEditor
              values={values.lmcPipelineWork}
              onChange={(next) => setValues((current) => ({ ...current, lmcPipelineWork: next }))}
            />
          </TabsContent>
          <TabsContent value="civil">
            <SectionCard title="Civil / Surface Work">
              <SectionFields
                fields={lmcPipelineFields}
                values={pickCivilFields(values.lmcPipelineWork)}
                onChange={(next) =>
                  setValues((current) => ({
                    ...current,
                    lmcPipelineWork: { ...current.lmcPipelineWork, ...next },
                  }))
                }
              />
            </SectionCard>
          </TabsContent>

          <TabsContent value="mdpe">
            <SectionCard title="MDPE Fittings">
              <SectionFields
                fields={mdpeFittingFields}
                values={values.mdpeFittings}
                onChange={(next) => setValues((current) => ({ ...current, mdpeFittings: next }))}
              />
            </SectionCard>
          </TabsContent>

          <TabsContent value="commissioning">
            <SectionCard title="Commissioning & Conversion">
              <SectionFields
                fields={commissioningConversionFields}
                values={values.commissioningConversion}
                onChange={(next) => setValues((current) => ({ ...current, commissioningConversion: next }))}
              />
            </SectionCard>
          </TabsContent>

          <TabsContent value="billing">
            <SectionCard title="Billing & Completion Status">
              <SectionFields
                fields={billingCompletionFields}
                values={values.billingCompletion}
                onChange={(next) => setValues((current) => ({ ...current, billingCompletion: next }))}
              />
            </SectionCard>
          </TabsContent>

          <TabsContent value="images">
            <CustomerEvidencePanel
              customerId={customerId}
              survey={values.survey}
              lmcPipelineWork={values.lmcPipelineWork}
              documents={values.documents}
              editable
              onDocumentsChange={(documents) =>
                setValues((current) => ({ ...current, documents }))
              }
            />
          </TabsContent>

          <TabsContent value="reports">
            <CustomerReportsPanel customerId={customerId} customer={customerId ? { ...values, id: customerId, createdDate: "" } : undefined} />
          </TabsContent>
        </Tabs>

        {mutation.isError ? (
          <p className="mt-3 text-sm text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Unable to save customer"}
          </p>
        ) : null}

        <div className="fixed inset-x-3 bottom-3 z-50 flex justify-end gap-2 rounded-lg border border-border bg-card/95 p-2 backdrop-blur sm:inset-x-auto sm:right-5">
          <Link
            href={isEdit && customerId ? `/customers/${customerId}` : "/customers"}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Save Customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function CustomerSurveyEditor({
  survey,
  onChange,
}: {
  survey: CustomerSurvey;
  onChange: (survey: CustomerSurvey) => void;
}) {
  const update = <K extends keyof CustomerSurvey>(key: K, value: CustomerSurvey[K]) => {
    onChange({ ...survey, [key]: value });
  };

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
          <FormField label="Survey Date">
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

      <SectionCard title="Workable Status">
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
          images={surveyPhotosToImages(survey.photos)}
          onChange={(images) => update("photos", imagesToSurveyPhotos(images))}
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

function surveyPhotosToImages(photos: CustomerSurveyPhoto[]): ImagePreviewItem[] {
  return photos.map((photo) => ({
    id: photo.id,
    label: photo.label,
    fileName: photo.fileName,
  }));
}

function imagesToSurveyPhotos(images: ImagePreviewItem[]): CustomerSurveyPhoto[] {
  return images.map((image) => ({
    id: image.id,
    label: image.label,
    caption: image.label,
    fileName: image.fileName,
  }));
}
function LmcPipelineEditor({
  values,
  onChange,
}: {
  values: LmcPipelineWork;
  onChange: (values: LmcPipelineWork) => void;
}) {
  const [editingPipeId, setEditingPipeId] = useState<string | null>(null);
  const editingPipe = values.pipeRecords.find((record) => record.id === editingPipeId) ?? null;
  const overallStatus = deriveLmcOverallStatus(values.pipeRecords);
  const pipeInputFields = lmcPipeRecordFields.filter(
    (field) => field.key !== "evidence",
  ) as FieldDefinition<LmcPipeEditableFields>[];

  const updatePipeRecord = (nextRecord: LmcPipeSizeRecord) => {
    onChange({
      ...values,
      pipeRecords: values.pipeRecords.map((record) =>
        record.id === nextRecord.id ? nextRecord : record,
      ),
    });
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Pipe Size Records"
        action={<StatusBadge status={overallStatus} />}
      >
        <div className="overflow-hidden rounded-lg border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-muted/35 hover:bg-muted/35">
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Pipe Size</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Length</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Laying Date</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Testing Date</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Purging Date</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Current Stage</TableHead>
                <TableHead className="h-8 px-3 text-xs font-semibold text-muted-foreground">Evidence</TableHead>
                <TableHead className="h-8 px-3 text-right text-xs font-semibold text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {values.pipeRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer border-border/45 bg-card hover:bg-muted/30"
                  onClick={() => setEditingPipeId(record.id)}
                >
                  <TableCell className="px-3 py-2 font-semibold text-foreground">{record.pipeSize}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{record.lengthMetres || "-"}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{record.layingDate || "-"}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{record.testingDate || "-"}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{record.purgingDate || "-"}</TableCell>
                  <TableCell className="px-3 py-2"><StatusBadge status={deriveLmcPipeCurrentStage(record)} /></TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">
                    <EvidenceSummary files={record.evidence} />
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingPipeId(record.id)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <Sheet open={Boolean(editingPipe)} onOpenChange={(open) => !open && setEditingPipeId(null)}>
        <SheetContent className="!w-[min(56rem,calc(100vw-1rem))] !max-w-none gap-0 overflow-x-hidden border-l-0 shadow-none">
          {editingPipe ? (
            <>
              <SheetHeader className="bg-muted/20 px-5 py-4">
                <SheetTitle>Edit {editingPipe.pipeSize} Pipe</SheetTitle>
                <SheetDescription>
                  Update this pipe sub-record inside the same LMC record.
                </SheetDescription>
              </SheetHeader>
              <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-4">
                <SectionFields
                  fields={pipeInputFields}
                  values={pickPipeEditableFields(editingPipe)}
                  onChange={(next) => updatePipeRecord({ ...editingPipe, ...next })}
                  gridClassName="grid gap-4"
                />
                <div className="mt-4">
                  <FormField label="Evidence Images">
                    <ImageUploadPreview
                      key={editingPipe.id}
                      className="min-w-0"
                      images={evidenceFilesToImages(editingPipe.evidence, editingPipe.pipeSize)}
                      onChange={(images) =>
                        updatePipeRecord({
                          ...editingPipe,
                          evidence: imagesToEvidenceFiles(images),
                        })
                      }
                    />
                  </FormField>
                </div>
              </div>
              <SheetFooter className="bg-card/95 px-5 py-4">
                <Button type="button" onClick={() => setEditingPipeId(null)}>
                  Done
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

    </div>
  );
}

function pickPipeEditableFields(record: LmcPipeSizeRecord): LmcPipeEditableFields {
  return {
    lengthMetres: record.lengthMetres,
    layingDate: record.layingDate,
    testingDate: record.testingDate,
    purgingDate: record.purgingDate,
    layingStatus: record.layingStatus,
    testingStatus: record.testingStatus,
    purgingStatus: record.purgingStatus,
    jointFittingDetails: record.jointFittingDetails,
    remarks: record.remarks,
    evidence: record.evidence,
  };
}

function EvidenceSummary({ files }: { files: string }) {
  const images = evidenceFilesToImages(files, "Evidence");

  if (!images.length) return <span>-</span>;

  return (
    <span className="inline-flex items-center justify-end gap-1.5">
      <ImageSquareIcon size={15} className="text-primary" />
      <span>{images.length} image{images.length > 1 ? "s" : ""}</span>
    </span>
  );
}

function evidenceFilesToImages(files: string, labelPrefix: string): ImagePreviewItem[] {
  return splitEvidenceFiles(files)
    .filter(isImageFile)
    .map((fileName, index) => ({
      id: `${labelPrefix.toLowerCase().replace(/\s+/g, "-")}-${index}-${fileName}`,
      label: fileName.replace(/\.[^.]+$/, ""),
      fileName,
      uploadedOn: "",
    }));
}

function imagesToEvidenceFiles(images: ImagePreviewItem[]) {
  return images.map((image) => image.fileName).join(", ");
}

function splitEvidenceFiles(files: string) {
  return files
    .split(",")
    .map((file) => file.trim())
    .filter((file) => file && file !== "-");
}

function isImageFile(fileName: string) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(fileName);
}

function pickCivilFields(values: LmcPipelineWork): LmcCivilWork {
  return {
    fourMetresUnderGc: values.fourMetresUnderGc,
    fourMetresAboveGc: values.fourMetresAboveGc,
    tfHalfInch: values.tfHalfInch,
    tfOneInch: values.tfOneInch,
    pcc: values.pcc,
    rccNalaCrossing: values.rccNalaCrossing,
    paverBlocks: values.paverBlocks,
    malua: values.malua,
    hardRock: values.hardRock,
  };
}

function FormTab({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="h-10 flex-none cursor-pointer justify-start rounded-none px-0.5 py-0 font-medium"
    >
      {children}
    </TabsTrigger>
  );
}

function SectionFields<T extends Record<string, string | boolean>>({
  fields,
  values,
  onChange,
  gridClassName = "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
}: {
  fields: FieldDefinition<T>[];
  values: T;
  onChange: (values: T) => void;
  gridClassName?: string;
}) {
  return (
    <div className={gridClassName}>
      {fields.map((field) => (
        <MasterField
          key={String(field.key)}
          field={field}
          value={values[field.key]}
          onChange={(value) => onChange({ ...values, [field.key]: value })}
        />
      ))}
    </div>
  );
}

function MasterField<T extends Record<string, string | boolean>>({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition<T>;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}) {
  if (field.input === "textarea") {
    return (
      <FormField label={field.label} className="md:col-span-2 xl:col-span-3">
        <Textarea
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          disabled={field.readOnly}
        />
      </FormField>
    );
  }

  if (field.input === "date") {
    return (
      <FormField label={field.label}>
        <DatePicker value={String(value ?? "")} onChange={onChange} className="w-full min-w-0" />
      </FormField>
    );
  }

  if (field.input === "select") {
    return (
      <FormField label={field.label}>
        <Select value={String(value || "") || undefined} onValueChange={(next) => onChange(next ?? "")}>
          <SelectTrigger className="w-full min-w-0">
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    );
  }

  if (field.input === "boolean") {
    return (
      <FormField label={field.label}>
        <Select value={value ? "Yes" : "No"} onValueChange={(next) => onChange(next === "Yes")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    );
  }

  return (
    <TextField
      label={field.label}
      type={field.input === "number" ? "number" : "text"}
      value={String(value ?? "")}
      onChange={onChange}
      disabled={field.readOnly}
    />
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <FormField label={label}>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
    </FormField>
  );
}
