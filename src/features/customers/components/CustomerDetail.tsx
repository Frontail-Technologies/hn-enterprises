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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DatePicker } from "@/components/shared/DatePicker";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { DocumentCategoryUploadPanel } from "@/components/shared/DocumentCategoryUploadPanel";
import {
  ImageUploadPreview,
  type ImagePreviewItem,
} from "@/components/shared/ImageUploadPreview";
import { KeyValueGrid, type KeyValueItem } from "@/components/shared/KeyValueGrid";
import { SectionCard } from "@/components/shared/SectionCard";
import { SectionAnchorTabs } from "@/components/shared/SectionAnchorTabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  billingCompletionFields,
  commissioningConversionFields,
  customerActivity,
  customerDocumentCategories,
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
  CustomerDocument,
  CustomerSurvey,
  CustomerSurveyRevision,
  LmcPipeSizeRecord,
  LmcPipelineWork,
} from "../types/customer.types";
import { CustomerInfoLine } from "./CustomerInfoLine";

type CustomerApprovalRow = {
  id: string;
  reference: string;
  module: string;
  submittedBy: string;
  date: string;
  remarks: string;
  status: string;
};

const customerSectionLinks = [
  { href: "#customer-details", label: "Customer Details" },
  { href: "#survey", label: "Survey" },
  { href: "#gi", label: "GI Measurements" },
  { href: "#isolation", label: "Isolation & Fittings" },
  { href: "#lmc", label: "LMC Pipeline" },
  { href: "#mdpe", label: "MDPE Fittings" },
  { href: "#commissioning", label: "Meter & Commissioning" },
  { href: "#billing", label: "Billing & Remarks" },
  { href: "#documents", label: "Images / Documents" },
  { href: "#approvals", label: "Approvals / History" },
];

export function CustomerDetail({ customer }: { customer: Customer }) {
  const searchParams = useSearchParams();
  const connection = customer.customerConnection;
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
            href={`/customers/${customer.id}?mode=edit`}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            <NotePencilIcon size={15} />
            Edit
          </Link>
        }
      />

      <CustomerSectionNav />

      <div className="space-y-4">
        <section id="customer-details" className="scroll-mt-16">
          <SectionCard title="Customer & Connection Details">
            <KeyValueGrid
              items={[
                { label: "Project", value: customer.projectName },
                { label: "Site / Area", value: customer.siteArea },
                { label: "City", value: customer.city },
                { label: "Created", value: formatDate(customer.createdDate) },
                ...itemsFromFields(customerConnectionFields, connection),
              ]}
              columns={3}
            />
          </SectionCard>
        </section>

        <section id="survey" className="scroll-mt-16">
          <CustomerSurveyDetail survey={customer.survey} />
        </section>

        <section id="gi" className="scroll-mt-16">
          <SectionCard title="GI Installation Measurements">
            <KeyValueGrid items={itemsFromFields(giMeasurementFields, customer.giMeasurements)} columns={3} />
          </SectionCard>
        </section>

        <section id="isolation" className="scroll-mt-16">
          <div className="space-y-4">
            <SectionCard title="Isolation Valves & Regulators">
              <KeyValueGrid items={itemsFromFields(isolationValveFields, customer.valvesRegulators)} columns={3} />
            </SectionCard>
            <SectionCard title="Fittings & Accessories">
              <KeyValueGrid items={itemsFromFields(fittingAccessoryFields, customer.fittingsAccessories)} columns={3} />
            </SectionCard>
          </div>
        </section>

        <section id="lmc" className="scroll-mt-16">
          <LmcPipelineDetail values={customer.lmcPipelineWork} initialPipeId={initialPipeId} />
        </section>

        <section id="mdpe" className="scroll-mt-16">
          <SectionCard title="MDPE Fittings">
            <KeyValueGrid items={itemsFromFields(mdpeFittingFields, customer.mdpeFittings)} columns={3} />
          </SectionCard>
        </section>

        <section id="commissioning" className="scroll-mt-16">
          <SectionCard title="Commissioning & Conversion">
            <KeyValueGrid
              items={itemsFromFields(commissioningConversionFields, customer.commissioningConversion)}
              columns={2}
            />
          </SectionCard>
        </section>

        <section id="billing" className="scroll-mt-16">
          <SectionCard title="Billing & Completion Status">
            <KeyValueGrid
              items={itemsFromFields(billingCompletionFields, customer.billingCompletion)}
              columns={2}
            />
          </SectionCard>
        </section>

        <section id="documents" className="scroll-mt-16">
          <DocumentCategoryUploadPanel<CustomerDocument>
            categories={customerDocumentCategories}
            documents={customer.documents}
            description="Customer-owned photos, reports, receipts and LMC evidence."
            readOnly
          />
        </section>

        <section id="approvals" className="scroll-mt-16">
          <CustomerApprovalsHistory customer={customer} />
        </section>
      </div>
    </div>
  );
}

function CustomerSectionNav() {
  return <SectionAnchorTabs items={customerSectionLinks} />;
}

function CustomerApprovalsHistory({ customer }: { customer: Customer }) {
  const rows: CustomerApprovalRow[] = [
    customer.survey
      ? {
          id: `${customer.survey.id}-approval`,
          reference: customer.survey.surveyId,
          module: "Survey",
          submittedBy: customer.survey.submittedBy || customer.survey.assignedSurveyor,
          date: customer.survey.submissionDate || customer.survey.surveyDate,
          remarks: customer.survey.approvalComments || customer.survey.notes || "-",
          status: customer.survey.approvalStatus,
        }
      : null,
    ...customer.documents.map((document) => ({
      id: `${document.id}-approval`,
      reference: document.referenceNumber || document.fileName,
      module: document.category,
      submittedBy: document.uploadedBy,
      date: document.uploadedOn,
      remarks: document.remarks || "-",
      status: document.status,
    })),
    {
      id: "billing-approval",
      reference: customer.customerConnection.trBpNo,
      module: "Billing",
      submittedBy: customer.customerConnection.supervisorName || "-",
      date: customer.createdDate,
      remarks: customer.billingCompletion.remark || "-",
      status: customer.billingCompletion.paymentStatus,
    },
  ].filter(Boolean) as CustomerApprovalRow[];

  const columns: ColumnDef<CustomerApprovalRow>[] = [
    { key: "reference", header: "Reference", className: "font-medium" },
    { key: "module", header: "Module" },
    { key: "submittedBy", header: "Submitted By" },
    { key: "date", header: "Date", render: (row) => formatDateTime(row.date) },
    { key: "remarks", header: "Remarks", className: "min-w-64" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Approvals">
        <DataTable columns={columns} data={rows} variant="striped" />
      </SectionCard>

      <SectionCard title="Activity History">
        <div className="relative space-y-3 before:absolute before:left-2.5 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
          {customerActivity.map((activity) => (
            <div key={activity.id} className="relative flex gap-3">
              <span className="mt-1 h-5 w-5 rounded-full border-4 border-background bg-primary" />
              <div className="rounded-lg bg-muted/20 px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {activity.actor} - {formatDateTime(activity.dateTime)} - {activity.relatedRecord}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function CustomerSurveyDetail({ survey }: { survey?: CustomerSurvey }) {
  if (!survey) {
    return (
      <SectionCard
        title="Survey"
        action={
          <Button type="button" variant="outline" size="sm">
            Create Survey
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          No survey record is available for this customer yet.
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">
        <SectionCard
          title="Survey Details"
          action={
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm">
                Edit
              </Button>
              <Button type="button" variant="outline" size="sm">
                Submit
              </Button>
              <Button type="button" size="sm">
                Resubmit
              </Button>
            </div>
          }
        >
          <KeyValueGrid
            columns={3}
            items={[
              { label: "Survey ID", value: survey.surveyId },
              { label: "Survey Date", value: formatDate(survey.surveyDate) },
              { label: "Assigned Surveyor", value: survey.assignedSurveyor },
              { label: "GPS / Location", value: `${survey.latitude}, ${survey.longitude}` },
              { label: "Capture Accuracy", value: survey.captureAccuracy },
              { label: "Workable Status", value: <StatusBadge status={survey.workableStatus} /> },
              { label: "Approval Status", value: <StatusBadge status={survey.approvalStatus} /> },
              { label: "Submitted By", value: survey.submittedBy || "-" },
              { label: "Submitted On", value: formatDateTime(survey.submissionDate) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Initial Measurements">
          <p className="text-sm font-medium text-foreground">{survey.initialMeasurements || "-"}</p>
          <div className="mt-3">
            <KeyValueGrid
              columns={3}
              items={[
                { label: "Site Accessibility", value: <StatusBadge status={survey.siteAccessibility} /> },
                { label: "Meter Placement", value: <StatusBadge status={survey.meterPlacement} /> },
                { label: "Pipeline Route", value: <StatusBadge status={survey.pipelineRoute} /> },
                { label: "Civil Work Required", value: survey.civilWorkRequired },
                { label: "Reason", value: survey.reason || "-" },
                { label: "Expected Resolution", value: formatDate(survey.expectedResolutionDate) },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title="Obstacles / Remarks">
          <KeyValueGrid
            columns={2}
            items={[
              { label: "Obstacles", value: survey.obstaclesRemarks || "-" },
              { label: "Recommended Action", value: survey.recommendedAction || "-" },
              { label: "Survey Notes", value: survey.notes || "-" },
              { label: "Approval Comments", value: survey.approvalComments || "-" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Revision History">
          <SurveyRevisionHistory revisions={survey.revisions} />
        </SectionCard>
    </div>
  );
}

function SurveyRevisionHistory({ revisions }: { revisions: CustomerSurveyRevision[] }) {
  if (!revisions.length) {
    return <p className="text-sm text-muted-foreground">No revisions yet.</p>;
  }

  return (
    <div className="space-y-2">
      {revisions.map((revision) => (
        <div key={revision.id} className="rounded-lg border border-border/70 bg-background px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{revision.revisionNumber}</p>
            <StatusBadge status={revision.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {revision.submittedBy} - {formatDate(revision.date)}
          </p>
          <p className="mt-1 text-xs font-medium text-foreground">{revision.notes}</p>
        </div>
      ))}
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

function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
