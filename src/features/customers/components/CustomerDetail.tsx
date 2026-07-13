"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ImageSquareIcon, NotePencilIcon } from "@phosphor-icons/react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/shared/DatePicker";
import { DetailHeader } from "@/components/shared/DetailHeader";
import {
  ImageUploadPreview,
  type ImagePreviewItem,
} from "@/components/shared/ImageUploadPreview";
import { KeyValueGrid, type KeyValueItem } from "@/components/shared/KeyValueGrid";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  billingCompletionFields,
  commissioningConversionFields,
  deriveLmcPipeCurrentStage,
  customerConnectionFields,
  deriveLmcOverallStatus,
  fittingAccessoryFields,
  giMeasurementFields,
  isolationValveFields,
  lmcPipeRecordFields,
  lmcPipelineFields,
  mdpeFittingFields,
  type FieldDefinition,
  type LmcPipeEditableFields,
  type LmcCivilWork,
} from "../services/customers.service";
import type {
  Customer,
  LmcPipeSizeRecord,
  LmcPipelineWork,
  UploadedImage,
} from "../types/customer.types";
import { CustomerInfoLine } from "./CustomerInfoLine";

export function CustomerDetail({ customer }: { customer: Customer }) {
  const searchParams = useSearchParams();
  const connection = customer.customerConnection;
  const activeTab = searchParams.get("tab") ?? "customer";
  const initialPipeId = searchParams.get("pipe");

  return (
    <div className="space-y-4">
      <DetailHeader
        title={connection.customerName}
        badges={
          <>
            <StatusBadge status={connection.connectionType} />
            <StatusBadge status={customer.status} />
          </>
        }
        meta={
          <>
            <CustomerInfoLine label="TR/BP No." value={connection.trBpNo} />
            <CustomerInfoLine label="Mobile" value={connection.mobileNo} />
            <CustomerInfoLine label="Connection" value={connection.connectionType} />
          </>
        }
        actions={
          <Link
            href={`/customers/${customer.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            <NotePencilIcon size={15} />
            Edit
          </Link>
        }
      />

      <Tabs defaultValue={activeTab} className="flex flex-col gap-3">
        <div className="border-b border-border/70">
          <TabsList variant="line" className="flex w-fit max-w-full flex-wrap justify-start gap-4 p-0">
            <CustomerTab value="customer">Customer Details</CustomerTab>
            <CustomerTab value="gi">GI Measurements</CustomerTab>
            <CustomerTab value="isolation">Isolation & Fittings</CustomerTab>
            <CustomerTab value="lmc">LMC Pipeline</CustomerTab>
            <CustomerTab value="mdpe">MDPE Fittings</CustomerTab>
            <CustomerTab value="commissioning">Meter & Commissioning</CustomerTab>
            <CustomerTab value="billing">Billing & Remarks</CustomerTab>
            <CustomerTab value="images">Images / Documents</CustomerTab>
          </TabsList>
        </div>

        <TabsContent value="customer">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <SectionCard title="Customer & Connection Details">
              <KeyValueGrid items={itemsFromFields(customerConnectionFields, connection)} columns={2} />
            </SectionCard>
            <SectionCard title="Project Context">
              <KeyValueGrid
                columns={1}
                items={[
                  { label: "Project", value: customer.projectName },
                  { label: "Site / Area", value: customer.siteArea },
                  { label: "City", value: customer.city },
                  { label: "Created", value: formatDate(customer.createdDate) },
                ]}
              />
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="gi">
          <SectionCard title="GI Installation Measurements">
            <KeyValueGrid items={itemsFromFields(giMeasurementFields, customer.giMeasurements)} columns={3} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="isolation">
          <div className="space-y-4">
            <SectionCard title="Isolation Valves & Regulators">
              <KeyValueGrid items={itemsFromFields(isolationValveFields, customer.valvesRegulators)} columns={3} />
            </SectionCard>
            <SectionCard title="Fittings & Accessories">
              <KeyValueGrid items={itemsFromFields(fittingAccessoryFields, customer.fittingsAccessories)} columns={3} />
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="lmc">
          <LmcPipelineDetail values={customer.lmcPipelineWork} initialPipeId={initialPipeId} />
        </TabsContent>

        <TabsContent value="mdpe">
          <SectionCard title="MDPE Fittings">
            <KeyValueGrid items={itemsFromFields(mdpeFittingFields, customer.mdpeFittings)} columns={3} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="commissioning">
          <SectionCard title="Commissioning & Conversion">
            <KeyValueGrid
              items={itemsFromFields(commissioningConversionFields, customer.commissioningConversion)}
              columns={2}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="billing">
          <SectionCard title="Billing & Completion Status">
            <KeyValueGrid
              items={itemsFromFields(billingCompletionFields, customer.billingCompletion)}
              columns={2}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="images">
          <SectionCard title="Images / Documents">
            <ImageGallery images={customer.media} />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LmcPipelineDetail({
  values: initialValues,
  initialPipeId,
}: {
  values: LmcPipelineWork;
  initialPipeId?: string | null;
}) {
  const [values, setValues] = useState(initialValues);
  const [editingPipeId, setEditingPipeId] = useState<string | null>(initialPipeId ?? null);
  const editingPipe = values.pipeRecords.find((record) => record.id === editingPipeId) ?? null;
  const overallStatus = deriveLmcOverallStatus(values.pipeRecords);
  const pipeInputFields = lmcPipeRecordFields.filter(
    (field) => field.key !== "evidence",
  ) as FieldDefinition<LmcPipeEditableFields>[];

  const updatePipeRecord = (nextRecord: LmcPipeSizeRecord) => {
    setValues((current) => ({
      ...current,
      pipeRecords: current.pipeRecords.map((record) =>
        record.id === nextRecord.id ? nextRecord : record,
      ),
    }));
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
                  <TableCell className="px-3 py-2 text-muted-foreground">{formatDate(record.layingDate)}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{formatDate(record.testingDate)}</TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">{formatDate(record.purgingDate)}</TableCell>
                  <TableCell className="px-3 py-2"><StatusBadge status={deriveLmcPipeCurrentStage(record)} /></TableCell>
                  <TableCell className="px-3 py-2 text-muted-foreground">
                    <EvidencePreview files={record.evidence} />
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
                  Update this pipe sub-record inside the same customer LMC record.
                </SheetDescription>
              </SheetHeader>
              <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-4">
                <SectionFields
                  fields={pipeInputFields}
                  values={pickPipeEditableFields(editingPipe)}
                  onChange={(next) => updatePipeRecord({ ...editingPipe, ...next })}
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
        <KeyValueGrid items={itemsFromFields(lmcPipelineFields, pickCivilFields(values))} columns={3} />
      </SectionCard>
    </div>
  );
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

function SectionFields<T extends Record<string, string | boolean>>({
  fields,
  values,
  onChange,
}: {
  fields: FieldDefinition<T>[];
  values: T;
  onChange: (values: T) => void;
}) {
  return (
    <div className="grid gap-4">
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
      <Field label={field.label}>
        <Textarea value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} rows={3} />
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

  return (
    <Field label={field.label}>
      <Input
        type={field.input === "number" ? "number" : "text"}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function CustomerTab({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="min-h-8 flex-none cursor-pointer justify-start rounded-none px-0 py-1.5 font-medium text-muted-foreground hover:text-foreground"
    >
      {children}
    </TabsTrigger>
  );
}

function itemsFromFields<T extends Record<string, string | boolean>>(
  fields: { key: keyof T; label: string; input?: string }[],
  values: T,
): KeyValueItem[] {
  return fields.map((field) => ({
    label: field.label,
    value: formatValue(values[field.key], field.input),
  }));
}

function formatValue(value: string | boolean, input?: string) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (!value) return "-";
  if (input === "date") return formatDate(value);
  return value;
}

function ImageGallery({ images }: { images: UploadedImage[] }) {
  if (!images.length) {
    return <p className="text-sm text-muted-foreground">No images uploaded.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {images.map((image) => (
        <div key={image.id} className="rounded-lg border border-border/70 bg-background p-2.5">
          <div className="flex h-32 items-center justify-center overflow-hidden rounded-md bg-muted/30">
            {image.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.previewUrl} alt={image.label} className="h-full w-full object-cover" />
            ) : (
              <ImageSquareIcon size={30} className="text-primary" />
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{image.label}</p>
          <p className="text-xs text-muted-foreground">{image.fileName}</p>
          <p className="text-xs text-muted-foreground">{formatDate(image.uploadedOn)}</p>
        </div>
      ))}
    </div>
  );
}

function EvidencePreview({ files }: { files: string }) {
  const images = splitEvidenceFiles(files).filter(isImageFile);

  if (!images.length) return <span>{files && files !== "-" ? files : "-"}</span>;

  return (
    <div className="flex max-w-56 flex-wrap gap-1.5">
      {images.map((fileName) => (
        <span
          key={fileName}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/25 px-1.5 py-1 text-xs text-foreground"
          title={fileName}
        >
          <ImageSquareIcon size={14} className="text-primary" />
          <span className="max-w-24 truncate">{fileName}</span>
        </span>
      ))}
    </div>
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

function formatDate(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}
