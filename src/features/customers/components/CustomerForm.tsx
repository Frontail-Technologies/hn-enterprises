"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageSquareIcon } from "@phosphor-icons/react";
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
import { DocumentCategoryUploadPanel } from "@/components/shared/DocumentCategoryUploadPanel";
import {
  ImageUploadPreview,
  type ImagePreviewItem,
} from "@/components/shared/ImageUploadPreview";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  billingCompletionFields,
  customerDocumentCategories,
  deriveLmcPipeCurrentStage,
  commissioningConversionFields,
  customerConnectionFields,
  customerStatusOptions,
  deriveLmcOverallStatus,
  emptyBillingCompletion,
  emptyCommissioningConversion,
  emptyCustomerConnection,
  emptyLmcPipelineWork,
  emptyMdpeFittings,
  fittingAccessoryFields,
  giMeasurementFields,
  isolationValveFields,
  lmcPipeRecordFields,
  lmcPipelineFields,
  mdpeFittingFields,
  projectOptions,
  siteOptionsByProject,
  type FieldDefinition,
  type LmcCivilWork,
  type LmcPipeEditableFields,
} from "../services/customers.service";
import type {
  Customer,
  CustomerDocument,
  CustomerFormValues,
  LmcPipeSizeRecord,
  LmcPipelineWork,
} from "../types/customer.types";

const defaultValues: CustomerFormValues = {
  status: "Draft",
  projectId: "",
  projectName: "",
  siteArea: "",
  city: "",
  customerConnection: emptyCustomerConnection,
  giMeasurements: {
    tfToRegulator: "",
    inlet: "",
    outlet: "",
    totalGiPipeHalfInch: "",
    giPipeThreeQuarterInch: "",
    giPipeOneInch: "",
    giPipeOneAndHalfInch: "",
    giPipeTwoInch: "",
  },
  valvesRegulators: {
    isolationValveHalfInch: "",
    isolationValveThreeQuarterInch: "",
    isolationValveOneInch: "",
    isolationValveOneAndHalfInch: "",
    isolationValveTwoInch: "",
    applianceValveHalfInch: "",
    regulator6BarTo100Mbar: "",
    regulator6BarTo21Mbar: "",
    regulator100MbarTo21Mbar: "",
    warningPlate: "",
  },
  fittingsAccessories: {
    clampHalfInch: "",
    clamp3InchToHalfInch: "",
    elbowHalfInch: "",
    mfElbowHalfInch: "",
    socketHalfInch: "",
    teeHalfInch: "",
    nipple2Inch: "",
    nipple3Inch: "",
    nipple4Inch: "",
    reducerElbowThreeQuarterToHalfInch: "",
    threeQuarterInchTo3Inch: "",
    unionHalfInch: "",
    plugHalfInch: "",
    fittingsOneAndHalfInchQuantity: "",
    fittingsTwoInchQuantity: "",
    extraGiAbove10Metres: "",
  },
  lmcPipelineWork: emptyLmcPipelineWork,
  mdpeFittings: emptyMdpeFittings,
  commissioningConversion: emptyCommissioningConversion,
  billingCompletion: emptyBillingCompletion,
  media: [],
  documents: [],
};

interface CustomerFormProps {
  mode: "create" | "edit";
  customer?: Customer;
}

export function CustomerForm({ mode, customer }: CustomerFormProps) {
  const isEdit = mode === "edit";
  const initialValues = customer ? toFormValues(customer) : defaultValues;
  const [values, setValues] = useState<CustomerFormValues>(initialValues);
  const siteOptions = siteOptionsByProject[values.projectId] ?? [];

  return (
    <div>
      <PageHeader title={isEdit ? "Edit Customer" : "Create Customer"} />

      <form className="pb-28">
        <Tabs defaultValue="customer" className="flex flex-col gap-3">
          <div className="border-b border-border/70">
            <TabsList variant="line" className="flex w-full max-w-full justify-start gap-6 overflow-x-auto p-0">
              <FormTab value="customer">Customer Details</FormTab>
              <FormTab value="gi">GI Measurements</FormTab>
              <FormTab value="isolation">Isolation & Fittings</FormTab>
              <FormTab value="lmc">LMC Pipeline</FormTab>
              <FormTab value="mdpe">MDPE Fittings</FormTab>
              <FormTab value="commissioning">Meter & Commissioning</FormTab>
              <FormTab value="billing">Billing & Remarks</FormTab>
              <FormTab value="images">Images / Documents</FormTab>
            </TabsList>
          </div>

          <TabsContent value="customer">
            <SectionCard title="Customer & Connection Details">
              <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Project">
                  <Select
                    value={values.projectId || undefined}
                    onValueChange={(projectId) => {
                      const project = projectOptions.find((item) => item.value === projectId);
                      setValues((current) => ({
                        ...current,
                        projectId: projectId ?? "",
                        projectName: project?.label ?? "",
                        siteArea: siteOptionsByProject[projectId ?? ""]?.[0] ?? "",
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
                </Field>
                <Field label="Site / Area">
                  <Select
                    value={values.siteArea || undefined}
                    onValueChange={(siteArea) => setValues((current) => ({ ...current, siteArea: siteArea ?? "" }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select site / area" />
                    </SelectTrigger>
                    <SelectContent>
                      {siteOptions.map((site) => (
                        <SelectItem key={site} value={site}>
                          {site}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <TextField label="City" value={values.city} onChange={(city) => setValues((current) => ({ ...current, city }))} />
                <Field label="Customer Status">
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
                </Field>
              </div>
              <SectionFields
                fields={customerConnectionFields}
                values={values.customerConnection}
                onChange={(next) => setValues((current) => ({ ...current, customerConnection: next }))}
              />
            </SectionCard>
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
            <div className="space-y-4">
              <SectionCard title="Isolation Valves & Regulators">
                <SectionFields
                  fields={isolationValveFields}
                  values={values.valvesRegulators}
                  onChange={(next) => setValues((current) => ({ ...current, valvesRegulators: next }))}
                />
              </SectionCard>
              <SectionCard title="Fittings & Accessories">
                <SectionFields
                  fields={fittingAccessoryFields}
                  values={values.fittingsAccessories}
                  onChange={(next) => setValues((current) => ({ ...current, fittingsAccessories: next }))}
                />
              </SectionCard>
            </div>
          </TabsContent>

          <TabsContent value="lmc">
            <LmcPipelineEditor
              values={values.lmcPipelineWork}
              onChange={(next) => setValues((current) => ({ ...current, lmcPipelineWork: next }))}
            />
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
            <DocumentCategoryUploadPanel<CustomerDocument>
              categories={customerDocumentCategories}
              documents={values.documents}
              description="Choose a document category to upload customer photos, reports, receipts or LMC evidence."
              onChange={(documents) =>
                setValues((current) => ({ ...current, documents }))
              }
            />
          </TabsContent>
        </Tabs>

        <div className="fixed inset-x-3 bottom-3 z-50 flex justify-end gap-2 rounded-lg border border-border bg-card/95 p-2 backdrop-blur sm:inset-x-auto sm:right-5">
          <Link
            href={isEdit && customer ? `/customers/${customer.id}` : "/customers"}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            Cancel
          </Link>
          {!isEdit ? <Button type="button" variant="outline">Save Draft</Button> : null}
          <Button type="button">{isEdit ? "Save Changes" : "Save Customer"}</Button>
        </div>
      </form>
    </div>
  );
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
                  <Field label="Evidence Images">
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
                  </Field>
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

      <SectionCard title="Civil / Surface Work">
        <SectionFields
          fields={lmcPipelineFields}
          values={pickCivilFields(values)}
          onChange={(next) => onChange({ ...values, ...next })}
        />
      </SectionCard>
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
      <Field label={field.label} className="md:col-span-2 xl:col-span-3">
        <Textarea
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          disabled={field.readOnly}
        />
      </Field>
    );
  }

  if (field.input === "date") {
    return (
      <Field label={field.label}>
        <DatePicker value={String(value ?? "")} onChange={onChange} className="w-full min-w-0" />
      </Field>
    );
  }

  if (field.input === "select") {
    return (
      <Field label={field.label}>
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
      </Field>
    );
  }

  if (field.input === "boolean") {
    return (
      <Field label={field.label}>
        <Select value={value ? "Yes" : "No"} onValueChange={(next) => onChange(next === "Yes")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
          </SelectContent>
        </Select>
      </Field>
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
    <Field label={label}>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
    </Field>
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

function toFormValues(customer: Customer): CustomerFormValues {
  const values = { ...customer } as Partial<Customer>;
  delete values.id;
  delete values.createdDate;
  return values as CustomerFormValues;
}
