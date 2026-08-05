"use client";

import { useState } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import {
  DownloadSimpleIcon,
  EyeIcon,
  FilePdfIcon,
  ImageSquareIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DatePicker } from "@/components/shared/DatePicker";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { FormField } from "@/components/shared/FormField";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { resolveFileUrl } from "@/lib/upload";
import { useDeleteCustomerDocument } from "../hooks/useCustomers";
import {
  ImageUploadPreview,
  type ImagePreviewItem,
} from "@/components/shared/ImageUploadPreview";
import {
  reportTemplates,
  resolveReportTemplateDataFromCustomer,
} from "@/features/report-templates/services/report-templates.service";
import type {
  ReportTemplateDefinition,
  ReportTemplateId,
} from "@/features/report-templates/types/report-template.types";
import { ReportPdfDocument } from "@/features/report-templates/components/pdf/ReportPdfDocument";
import type {
  Customer,
  CustomerDocument,
  CustomerSurvey,
  LmcPipelineWork,
} from "../types/customer.types";

export function CustomerEvidencePanel({
  survey,
  lmcPipelineWork,
  documents,
  editable = false,
  onDocumentsChange,
  customerId,
}: {
  survey?: CustomerSurvey;
  lmcPipelineWork: LmcPipelineWork;
  documents: CustomerDocument[];
  editable?: boolean;
  onDocumentsChange?: (documents: CustomerDocument[]) => void;
  customerId?: string;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const deleteDocumentMutation = useDeleteCustomerDocument(customerId ?? "");
  const handleDeleteDocument = customerId
    ? (documentId: string) => deleteDocumentMutation.mutate(documentId)
    : undefined;

  const surveyPhotos = (survey?.evidence ?? []).map((photo) => ({
    id: photo.id,
    title: photo.label,
    caption: photo.caption,
    fileName: photo.fileName,
    fileUrl: photo.fileUrl,
    status: survey?.approvalStatus ?? "Submitted",
    uploadedOn: survey?.surveyDate ?? "",
  }));

  const lmcEvidence = [
    ...lmcPipelineWork.pipeRecords.flatMap((pipe) =>
      pipe.evidence.map((file) => ({
        id: file.id,
        title: `${pipe.pipeSize} Evidence`,
        caption: pipe.remarks || pipe.jointFittingDetails || "Pipe evidence",
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        status: pipe.purgingStatus,
        uploadedOn: pipe.purgingDate || pipe.testingDate || pipe.layingDate,
      })),
    ),
    ...documents
      .filter((document) => document.category === "LMC / Site Evidence")
      .map(documentToEvidence),
  ];

  const meterPhotos = documents
    .filter((document) => document.category === "Meter Photo")
    .map(documentToEvidence);

  const customerPhotos = documents
    .filter((document) => document.category === "Customer Photo")
    .map(documentToEvidence);

  const giEvidence = documents
    .filter((document) => document.category === "GI Evidence")
    .map(documentToEvidence);

  const gcEvidence = documents
    .filter((document) => document.category === "GC Evidence")
    .map(documentToEvidence);

  const paymentReceipts = documents
    .filter((document) => document.category === "Payment Receipt")
    .map(documentToEvidence);

  const otherPhotos = documents
    .filter((document) => document.category === "Other")
    .map(documentToEvidence);

  const pdfDocuments = documents
    .filter((document) => !isImageFile(document.fileName))
    .map(documentToEvidence);

  return (
    <div className="space-y-3">
      {editable && onDocumentsChange ? (
        <CustomerEvidenceUpload
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          documents={documents}
          onDocumentsChange={onDocumentsChange}
          customerId={customerId}
        />
      ) : null}
      <MediaSection title="Survey Photos" items={surveyPhotos} onDelete={handleDeleteDocument} />
      <MediaSection title="LMC Evidence" items={lmcEvidence} onDelete={handleDeleteDocument} />
      <MediaSection title="GI Evidence" items={giEvidence} onDelete={handleDeleteDocument} />
      <MediaSection title="GC Evidence" items={gcEvidence} onDelete={handleDeleteDocument} />
      <MediaSection title="Meter Photo" items={meterPhotos} onDelete={handleDeleteDocument} />
      <MediaSection title="Customer Photos" items={customerPhotos} onDelete={handleDeleteDocument} />
      <MediaSection title="Payment Receipts" items={paymentReceipts} onDelete={handleDeleteDocument} />
      <MediaSection title="Other Photos" items={otherPhotos} onDelete={handleDeleteDocument} />
      <UploadedPdfSection items={pdfDocuments} onDelete={handleDeleteDocument} />
    </div>
  );
}

const customerEvidenceCategories = [
  "Survey Photo",
  "Customer Photo",
  "Meter Photo",
  "GI Evidence",
  "GC Evidence",
  "LMC / Site Evidence",
  "Payment Receipt",
  "Other",
] as const;

function CustomerEvidenceUpload({
  open,
  onOpenChange,
  documents,
  onDocumentsChange,
  customerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: CustomerDocument[];
  onDocumentsChange: (documents: CustomerDocument[]) => void;
  customerId?: string;
}) {
  const [category, setCategory] = useState<string>("LMC / Site Evidence");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [evidenceDate, setEvidenceDate] = useState("");
  const [images, setImages] = useState<ImagePreviewItem[]>([]);
  const [remarks, setRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const resetForm = () => {
    setCategory("LMC / Site Evidence");
    setReferenceNumber("");
    setEvidenceDate("");
    setImages([]);
    setRemarks("");
    setSaveError("");
  };

  const saveEvidence = async () => {
    if (!images.length) return;
    setSaveError("");
    setIsSaving(true);
    try {
      // Files are embedded directly in the record-save request (see
      // CustomerForm.handleSave) instead of uploaded here - this just stages
      // the picked files locally.
      const today = new Date().toISOString().slice(0, 10);
      const newDocuments: CustomerDocument[] = images.map((image, index) => ({
        id: `cust-evidence-${Date.now()}-${index}`,
        type: category,
        referenceNumber,
        category,
        issueDate: evidenceDate,
        expiryDate: "",
        amount: "",
        fileName: image.fileName,
        fileUrl: image.fileUrl,
        file: image.file,
        remarks,
        uploadedOn: evidenceDate || today,
        uploadedBy: "Demo Admin",
        status: "Submitted",
      }));

      onDocumentsChange([...documents, ...newDocuments]);
      resetForm();
      onOpenChange(false);
    } catch {
      setSaveError("Some files failed to upload. Please retry or remove them before saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard
      title="Upload Evidence"
      action={
        <Button type="button" size="sm" onClick={() => onOpenChange(true)}>
          <UploadSimpleIcon size={15} />
          Upload Evidence
        </Button>
      }
      className="p-3"
    >
      <p className="text-sm text-muted-foreground">
        Add customer photos, site evidence, meter photos, receipts, or supporting files.
      </p>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="!w-[min(32rem,calc(100vw-1rem))] !max-w-none gap-0 border-l-0 shadow-none">
          <SheetHeader className="border-b border-border/70 px-5 py-4">
            <SheetTitle>Upload Evidence</SheetTitle>
            <SheetDescription>
              Keep this simple: select category, attach photos, add reference/date if needed.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <FormField label="Category">
              <Select value={category} onValueChange={(value) => setCategory(value ?? "Other")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {customerEvidenceCategories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Report / Reference No.">
              <Input
                value={referenceNumber}
                onChange={(event) => setReferenceNumber(event.target.value)}
                placeholder="Optional"
              />
            </FormField>
            <FormField label="Evidence Date">
              <DatePicker value={evidenceDate} onChange={setEvidenceDate} className="w-full" />
            </FormField>
            <FormField label="Photos">
              <ImageUploadPreview images={images} onChange={setImages} module="customers" recordId={customerId} />
            </FormField>
            <FormField label="Remarks">
              <Textarea
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                rows={3}
                placeholder="Optional notes"
              />
            </FormField>
            {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
          </div>
          <SheetFooter className="flex-row justify-end border-t border-border/70 px-5 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void saveEvidence()} disabled={!images.length || isSaving}>
              {isSaving ? "Saving..." : "Save Evidence"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </SectionCard>
  );
}

export function CustomerReportsPanel({
  customerId,
  customer,
}: {
  customerId?: string;
  customer?: Customer;
}) {
  const [activeTemplate, setActiveTemplate] = useState<ReportTemplateDefinition | null>(null);
  const reports = reportTemplates.map((template) => ({
    ...template,
    reportNo: getCustomerReportNo(template.id, customer),
    status: getCustomerReportStatus(template.id, customer),
  }));

  return (
    <SectionCard title="Generated Reports">
      {!customerId ? (
        <p className="text-sm text-muted-foreground">
          Save the customer first to generate reports from templates.
        </p>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-sm border border-border/70 bg-background">
          {reports.map((template) => (
            <div
              key={template.id}
              className="grid gap-3 px-3 py-3 md:grid-cols-[1fr_150px_130px_auto] md:items-center"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <FilePdfIcon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {template.title}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Report No.: </span>
                <span className="font-medium text-foreground">{template.reportNo}</span>
              </div>
              <StatusBadge status={template.status} />
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setActiveTemplate(template)}
                >
                  Generate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {customer ? (
        <CustomerReportPreviewSheet
          template={activeTemplate}
          customer={customer}
          onClose={() => setActiveTemplate(null)}
        />
      ) : null}
    </SectionCard>
  );
}

function CustomerReportPreviewSheet({
  template,
  customer,
  onClose,
}: {
  template: ReportTemplateDefinition | null;
  customer: Customer;
  onClose: () => void;
}) {
  const open = Boolean(template);

  if (!template) {
    return null;
  }

  const data = resolveReportTemplateDataFromCustomer(template.id, customer);
  const document = <ReportPdfDocument templateId={template.id} data={data} />;

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent className="!w-[min(76rem,calc(100vw-1rem))] !max-w-none gap-0 border-l-0 shadow-none">
        <SheetHeader className="border-b border-border/70 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div>
              <SheetTitle>{template.title}</SheetTitle>
              <SheetDescription>
                Preview generated from current data for {customer.customerConnection.customerName}.
              </SheetDescription>
            </div>
            <PDFDownloadLink
              document={document}
              fileName={`${template.id}-${customer.customerConnection.trBpNo || customer.id}.pdf`}
              className="app-primary-action inline-flex h-9 items-center gap-2 rounded-sm bg-primary px-3 text-sm font-medium text-white"
            >
              {({ loading }) => (
                <>
                  <DownloadSimpleIcon size={15} />
                  {loading ? "Preparing..." : "Download PDF"}
                </>
              )}
            </PDFDownloadLink>
          </div>
        </SheetHeader>
        <div className="flex-1 bg-muted/40 p-4">
          <div className="h-full min-h-[620px] overflow-hidden rounded-sm border border-border bg-background">
            <PDFViewer width="100%" height="100%" showToolbar>
              {document}
            </PDFViewer>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

type EvidenceItem = {
  id: string;
  title: string;
  caption: string;
  fileName: string;
  fileUrl?: string;
  // Only present for items backed by a real customer_documents row - that's
  // the only evidence source with a delete endpoint today. Survey Photos and
  // native LMC pipe evidence live in jsonb columns instead and are removed
  // via their own edit tabs (Survey / LMC Pipe editor), not from here.
  documentId?: string;
  status: string;
  uploadedOn: string;
};

function MediaSection({
  title,
  items,
  onDelete,
}: {
  title: string;
  items: EvidenceItem[];
  onDelete?: (documentId: string) => void;
}) {
  const uploadedOn = items.find((item) => item.uploadedOn)?.uploadedOn;
  const [previewItem, setPreviewItem] = useState<EvidenceItem | null>(null);

  return (
    <SectionCard title={`${title} (${items.length})`} className="p-3">
      {!items.length ? (
        <p className="text-sm text-muted-foreground">No files uploaded.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {items.map((item) => {
              const href = resolveFileUrl(item.fileUrl);
              const isImage = href && isImageFile(item.fileName);
              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={isImage ? () => setPreviewItem(item) : undefined}
                    disabled={!isImage}
                    className={cn(
                      "flex h-24 w-32 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted/25 text-primary",
                      isImage && "cursor-pointer",
                    )}
                    title={item.fileName}
                  >
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={href} alt={item.fileName} className="h-full w-full object-cover" />
                    ) : isImageFile(item.fileName) ? (
                      <ImageSquareIcon size={30} />
                    ) : (
                      <FilePdfIcon size={30} />
                    )}
                  </button>
                  {item.documentId && onDelete ? (
                    <ActionTooltip label="Delete">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(item.documentId!);
                        }}
                        aria-label={`Delete ${item.fileName}`}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </ActionTooltip>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Uploaded on {formatDisplayDate(uploadedOn)}
            </p>
            <StatusBadge status="Uploaded" />
          </div>
        </div>
      )}

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle className="truncate">{previewItem?.fileName}</DialogTitle>
          {previewItem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveFileUrl(previewItem.fileUrl)}
              alt={previewItem.fileName}
              className="max-h-[70vh] w-full rounded-md object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}

function UploadedPdfSection({
  items,
  onDelete,
}: {
  items: EvidenceItem[];
  onDelete?: (documentId: string) => void;
}) {
  return (
    <SectionCard title={`Uploaded PDFs (${items.length})`}>
      {!items.length ? (
        <p className="text-sm text-muted-foreground">No PDFs uploaded.</p>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-sm border border-border/70 bg-background">
          {items.map((item) => {
            const href = resolveFileUrl(item.fileUrl);
            return (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <FilePdfIcon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.fileName}</p>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {formatDisplayDate(item.uploadedOn)}
                </span>
                <StatusBadge status={item.status} />
                <div className="flex items-center gap-1">
                  <ActionTooltip label="Preview">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), !href && "pointer-events-none opacity-50")}
                      aria-label={`Preview ${item.title}`}
                    >
                      <EyeIcon size={15} />
                    </a>
                  </ActionTooltip>
                  <ActionTooltip label="Download">
                    <a
                      href={href}
                      download={item.fileName}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), !href && "pointer-events-none opacity-50")}
                      aria-label={`Download ${item.title}`}
                    >
                      <DownloadSimpleIcon size={15} />
                    </a>
                  </ActionTooltip>
                  {item.documentId && onDelete ? (
                    <ActionTooltip label="Delete">
                      <button
                        type="button"
                        onClick={() => onDelete(item.documentId!)}
                        aria-label={`Delete ${item.title}`}
                        className={buttonVariants({ variant: "ghost", size: "icon-sm", className: "text-destructive hover:text-destructive" })}
                      >
                        <TrashIcon size={15} />
                      </button>
                    </ActionTooltip>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function documentToEvidence(document: CustomerDocument): EvidenceItem {
  return {
    id: document.id,
    title: document.type || document.category,
    caption: document.remarks || `Uploaded on ${document.uploadedOn || "-"}`,
    fileName: document.fileName,
    fileUrl: document.fileUrl,
    documentId: document.id,
    status: document.status,
    uploadedOn: document.uploadedOn || document.issueDate,
  };
}

function getCustomerReportNo(templateId: ReportTemplateId, customer?: Customer) {
  if (!customer) return "-";
  const connection = customer.customerConnection;

  if (templateId === "gc-report") return connection.reportNoGc || "-";
  if (templateId === "conversion-report") return connection.reportNoConversion || "-";
  if (templateId === "png-connection-job-card") return connection.reportNoConversion || connection.reportNoGi || "-";
  return connection.reportNoGi || "-";
}

function getCustomerReportStatus(templateId: ReportTemplateId, customer?: Customer) {
  if (!customer) return "Pending";

  if (templateId === "jmr-customer-consent") {
    return customer.billingCompletion.jmrDone ? "Completed" : "Pending";
  }
  if (templateId === "gc-report") {
    return customer.billingCompletion.gcBillDone ? "Completed" : "In Review";
  }
  if (templateId === "conversion-report") {
    return customer.billingCompletion.conversionBillDone ? "Completed" : "Pending";
  }
  if (templateId === "testing-report-mdpe-line" || templateId === "pressure-observation-chart") {
    return customer.lmcPipelineWork.pipeRecords.some((pipe) => pipe.testingStatus === "Testing Completed")
      ? "Completed"
      : "Pending";
  }
  if (templateId === "pre-commissioning-report") {
    return customer.lmcPipelineWork.pipeRecords.some((pipe) => pipe.purgingStatus === "Purging Completed")
      ? "Completed"
      : "Pending";
  }

  return customer.status;
}

function isImageFile(fileName: string) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(fileName);
}

function formatDisplayDate(value?: string) {
  if (!value) return "-";
  const [date] = value.split(" ");
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
}
