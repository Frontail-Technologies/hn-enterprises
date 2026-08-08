"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  DownloadSimpleIcon,
  EyeIcon,
  FileArrowUpIcon,
  NotePencilIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ActionButton } from "@/components/shared/ActionButton";
import { resolveFileUrl, uploadFile } from "@/lib/upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useProjectDocumentsQuery,
  useProjectQuery,
  useCreateProjectDocument,
  useDeleteProjectDocument,
} from "@/features/projects/hooks/useProjects";
import { PageLoading } from "@/components/shared/PageLoading";
import type {
  ActivityItem,
  Project,
  ProjectDocument,
} from "../types/project.types";

type TargetValues = Record<string, string>;
type ChangeHistoryItem = {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  user: string;
  date: string;
  reason: string;
};

const documentCategories = [
  { type: "Tender", label: "Tender", numberLabel: "Tender No.", amountLabel: "Contract Amount" },
  { type: "LOA", label: "LOA", numberLabel: "LOA No.", amountLabel: "LOA Amount" },
  { type: "FOA", label: "FOA", numberLabel: "FOA No.", amountLabel: "FOA Amount" },
  { type: "EOI", label: "EOI", numberLabel: "EOI No.", amountLabel: "EOI Amount" },
  { type: "BG", label: "BG", numberLabel: "BG No.", amountLabel: "BG Amount" },
  { type: "RO", label: "RO", numberLabel: "RO No.", amountLabel: "RO Amount" },
  { type: "Statutory", label: "Statutory", numberLabel: "Document No.", amountLabel: "Amount" },
  { type: "Other", label: "Other", numberLabel: "Reference No.", amountLabel: "Amount" },
];

const projectSectionLinks = [
  { value: "overview", label: "Overview" },
  { value: "contract", label: "Contract & Targets" },
  { value: "documents", label: "Documents" },
];

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { data: project, isLoading, isError } = useProjectQuery(projectId);

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !project) {
    return <p className="p-4 text-sm text-destructive">Unable to load this project.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-bold text-foreground">
            {project.name}
          </h1>
          <StatusBadge status={project.status} />
        </div>
        <Link
          href={`/projects/${project.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          <NotePencilIcon size={15} />
          Edit
        </Link>
      </div>

      <Tabs defaultValue="overview" className="gap-4">
        <ProjectSectionNav />
        <TabsContent value="overview">
          <ProjectOverview project={project} />
        </TabsContent>
        <TabsContent value="contract">
          <ContractTargets project={project} />
        </TabsContent>
        <TabsContent value="documents">
          <ProjectDocuments projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectSectionNav() {
  return (
    <div className="sticky top-0 z-40 -mx-1 border-b border-border bg-background px-1 backdrop-blur">
      <TabsList variant="line" className="flex w-max min-w-full justify-start gap-6 overflow-x-auto">
        {projectSectionLinks.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="h-10 flex-none rounded-none px-0.5 py-0 font-medium"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}

function ProjectOverview({ project }: { project: Project }) {
  const summary = [
    ["Client", project.client],
    ["Consultant", project.consultant],
    ["Contractor", project.contractor],
    ["Project Type", project.projectType],
    ["City", project.city],
    ["Start Date", formatDate(project.startDate)],
    ["End Date", formatDate(project.plannedEndDate)],
    ["Contract Value", project.contractValue],
    ["Project Manager", project.assignedManager],
    ["Description", project.description],
  ];

  return (
    <SectionCard title="Project Information">
      <InfoGrid items={summary} />
    </SectionCard>
  );
}

function ContractTargets({ project }: { project: Project }) {
  const [targetValues, setTargetValues] = useState<TargetValues>({
    "Planned Customers": "5,200",
    "Planned Surveys": "5,800",
    "Planned Plumbing/GI": "4,750",
    "Planned GC": "4,200",
    "Planned Commissioning": "3,850",
    "Planned Conversion": "3,600",
    "Planned JMR": "42",
    "20MM": "18.4 KM",
    "32MM": "12.8 KM",
    "63MM": "8.5 KM",
    "90MM": "4.2 KM",
    "125MM": "1.7 KM",
  });
  const [draftTargets, setDraftTargets] = useState<TargetValues>(targetValues);
  const [reason, setReason] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [history, setHistory] = useState<ChangeHistoryItem[]>([
    {
      id: "hist-1",
      field: "Planned Customers",
      oldValue: "5,000",
      newValue: "5,200",
      user: "Demo Admin",
      date: "2025-01-22",
      reason: "Updated after contract reconciliation.",
    },
  ]);
  const details = [
    ["Contract ID", project.code],
    ["Client", project.client],
    ["Consultant", project.consultant],
    ["Contractor", project.contractor],
    ["Contract Value", project.contractValue],
    ["Start Date", formatDate(project.startDate)],
    ["Planned End Date", formatDate(project.plannedEndDate)],
    ["Billing Method", "Milestone Based"],
  ];
  const targetKeys = [
    "Planned Customers",
    "Planned Surveys",
    "Planned Plumbing/GI",
    "Planned GC",
    "Planned Commissioning",
    "Planned Conversion",
    "Planned JMR",
  ];
  const pipeKeys = ["20MM", "32MM", "63MM", "90MM", "125MM"];

  const saveTargets = () => {
    if (!reason.trim()) return;
    const changes = Object.entries(draftTargets)
      .filter(([key, value]) => targetValues[key] !== value)
      .map(([key, value], index) => ({
        id: `hist-${Date.now()}-${index}`,
        field: key,
        oldValue: targetValues[key],
        newValue: value,
        user: "Demo Admin",
        date: format(new Date(), "yyyy-MM-dd"),
        reason,
      }));

    setTargetValues(draftTargets);
    setHistory((current) => [...changes, ...current]);
    setReason("");
    setEditOpen(false);
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Contract Details">
        <InfoGrid items={details} />
      </SectionCard>
      <SectionCard
        title="Operational Targets"
        action={
          <Button
            size="sm"
            onClick={() => {
              setDraftTargets(targetValues);
              setReason("");
              setEditOpen(true);
            }}
          >
            <NotePencilIcon size={14} />
            Edit Targets
          </Button>
        }
      >
        <InfoGrid items={targetKeys.map((key) => [key, targetValues[key]])} />
      </SectionCard>
      <SectionCard title="Pipe-Size Targets">
        <InfoGrid items={pipeKeys.map((key) => [key, targetValues[key]])} />
      </SectionCard>
      {false ? <SectionCard title="Change History">
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-muted/35 px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{item.field}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.date)}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                {item.oldValue} to {item.newValue}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.user} · {item.reason}
              </p>
            </div>
          ))}
        </div>
      </SectionCard> : null}
      <TargetsDialog
        open={editOpen}
        draftTargets={draftTargets}
        reason={reason}
        targetKeys={targetKeys}
        pipeKeys={pipeKeys}
        onDraftChange={setDraftTargets}
        onReasonChange={setReason}
        onOpenChange={setEditOpen}
        onSave={saveTargets}
      />
    </div>
  );
}

function ProjectDocuments({ projectId }: { projectId: string }) {
  const { data: documents = [], isLoading } = useProjectDocumentsQuery(projectId);
  const createDocumentMutation = useCreateProjectDocument(projectId);
  const deleteDocumentMutation = useDeleteProjectDocument(projectId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProjectDocument>(emptyDocument);

  const columns: ColumnDef<ProjectDocument>[] = [
    { key: "type", header: "Type" },
    { key: "documentName", header: "Document Name", className: "min-w-48" },
    { key: "number", header: "No. / Reference", className: "min-w-40" },
    {
      key: "contractDate",
      header: "Contract Date",
      render: (doc) => formatDate(doc.contractDate),
    },
    {
      key: "documentDate",
      header: "Document Date",
      render: (doc) => formatDate(doc.documentDate),
    },
    { key: "amount", header: "Amount" },
    { key: "fileName", header: "File", className: "min-w-52" },
    {
      key: "actions",
      header: "Actions",
      className: "w-64",
      render: (doc) => {
        const href = resolveFileUrl(doc.fileUrl);
        return (
          <div className="flex flex-wrap items-center gap-1">
            <ActionButton label="Preview" icon={<EyeIcon size={13} />} href={href} disabled={!href} />
            <ActionButton
              label="Download"
              icon={<DownloadSimpleIcon size={13} />}
              href={href}
              download={doc.fileName || true}
              disabled={!href}
            />
            <ActionButton
              label="Delete"
              icon={<TrashIcon size={13} />}
              onClick={() => deleteDocumentMutation.mutate(doc.id)}
            />
          </div>
        );
      },
    },
  ];

  const saveDocument = async () => {
    if (!draft.type || !draft.number) return;
    await createDocumentMutation.mutateAsync(draft);
    setDialogOpen(false);
    setEditingId(null);
    setDraft(emptyDocument);
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Document Categories"
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditingId(null);
              setDraft(emptyDocument);
              setDialogOpen(true);
            }}
          >
            <FileArrowUpIcon size={14} />
            Upload Document
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {documentCategories.map((category) => (
            <button
              key={category.type}
              className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-4 text-center text-sm font-semibold text-foreground hover:border-primary hover:bg-primary/5"
              onClick={() => {
                setEditingId(null);
                setDraft({
                  ...emptyDocument,
                  category: category.type,
                  type: category.type,
                  documentName: `${category.label} Document`,
                });
                setDialogOpen(true);
              }}
            >
              <FileArrowUpIcon
                size={20}
                className="mx-auto mb-2 text-primary"
              />
              {category.label}
              <span className="mt-1 block text-xs font-medium text-muted-foreground">
                {
                  documents.filter(
                    (doc) =>
                      doc.category === category.type || doc.type === category.type,
                  ).length
                }{" "}
                uploaded
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Uploaded Documents">
        <DataTable
          columns={columns}
          data={documents}
          variant="striped"
          isLoading={isLoading}
          emptyTitle="No documents uploaded yet"
        />
      </SectionCard>

      <DocumentDialog
        open={dialogOpen}
        title={editingId ? "Edit Document" : "Upload Document"}
        draft={draft}
        setDraft={setDraft}
        onOpenChange={setDialogOpen}
        onSave={saveDocument}
        projectId={projectId}
      />
    </div>
  );
}

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <SectionCard title="Activity">
      <div className="relative space-y-3 before:absolute before:bottom-4 before:left-[5px] before:top-4 before:w-px before:bg-primary/25">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative grid grid-cols-[14px_1fr] gap-3"
          >
            <span className="relative z-10 mt-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/10" />
            <div className="rounded-lg bg-muted/35 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(item.dateTime)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.actor} ·{" "}
                <Link
                  href="#"
                  className="font-semibold text-primary hover:underline"
                >
                  {item.relatedRecord}
                </Link>
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function TargetsDialog({
  open,
  draftTargets,
  reason,
  targetKeys,
  pipeKeys,
  onDraftChange,
  onReasonChange,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  draftTargets: TargetValues;
  reason: string;
  targetKeys: string[];
  pipeKeys: string[];
  onDraftChange: React.Dispatch<React.SetStateAction<TargetValues>>;
  onReasonChange: (reason: string) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-[min(42rem,calc(100vw-1rem))] !max-w-none gap-0 border-l-0 shadow-none">
        <SheetHeader className="border-b border-border/70 px-5 py-4">
          <SheetTitle>Edit Targets</SheetTitle>
          <SheetDescription>
            Changes require a reason and will be recorded in history.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 md:grid-cols-2">
          {[...targetKeys, ...pipeKeys].map((key) => (
            <CompactInput
              key={key}
              label={key}
              value={draftTargets[key] ?? ""}
              onChange={(value) =>
                onDraftChange((current) => ({ ...current, [key]: value }))
              }
            />
          ))}
          <FormField label="Change Reason">
            <Textarea
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Required before saving"
              className="min-h-20"
            />
          </FormField>
          </div>
        </div>
        <SheetFooter className="flex-row justify-end border-t border-border/70 px-5 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!reason.trim()} onClick={onSave}>
            Save Targets
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DocumentDialog({
  open,
  title,
  draft,
  setDraft,
  onOpenChange,
  onSave,
  projectId,
}: {
  open: boolean;
  title: string;
  draft: ProjectDocument;
  setDraft: React.Dispatch<React.SetStateAction<ProjectDocument>>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  projectId: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;
    setDraft((current) => ({ ...current, fileName: file.name, fileUrl: "" }));
    setUploadError("");
    setIsUploading(true);
    try {
      const uploaded = await uploadFile(file, "projects", projectId);
      setDraft((current) => ({ ...current, fileUrl: uploaded.url }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Add contract and statutory document details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Document Type">
            <Select
              value={draft.category}
              onValueChange={(value) => {
                const category = documentCategories.find(
                  (item) => item.type === value,
                );
                setDraft((current) => ({
                  ...current,
                  category: category?.type ?? "Other",
                  type: category?.type ?? "Other",
                  documentName:
                    current.documentName || `${category?.label ?? "Other"} Document`,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentCategories.map((category) => (
                  <SelectItem key={category.type} value={category.type}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <CompactInput
            label="Document Name"
            value={draft.documentName}
            onChange={(value) =>
              setDraft((current) => ({ ...current, documentName: value }))
            }
          />
          <CompactInput
            label="No. / Reference"
            value={draft.number}
            onChange={(value) =>
              setDraft((current) => ({ ...current, number: value }))
            }
          />
          <CompactInput
            label="Amount"
            value={draft.amount}
            onChange={(value) =>
              setDraft((current) => ({ ...current, amount: value }))
            }
          />
          <CompactInput
            label="Contract Date"
            type="date"
            value={draft.contractDate}
            onChange={(value) =>
              setDraft((current) => ({ ...current, contractDate: value }))
            }
          />
          <CompactInput
            label="Document Date"
            type="date"
            value={draft.documentDate}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                documentDate: value,
                issueDate: value,
              }))
            }
          />
          <CompactInput
            label="Expiry Date"
            type="date"
            value={draft.expiryDate}
            onChange={(value) =>
              setDraft((current) => ({ ...current, expiryDate: value }))
            }
          />
          <FormField label="File">
            <Input
              type="file"
              onChange={(event) => void handleFileSelect(event.target.files?.[0])}
            />
            {isUploading ? (
              <p className="mt-1 text-xs text-primary">Uploading {draft.fileName}...</p>
            ) : draft.fileUrl ? (
              <p className="mt-1 text-xs text-muted-foreground">Ready to save: {draft.fileName}</p>
            ) : null}
            {uploadError ? <p className="mt-1 text-xs text-destructive">{uploadError}</p> : null}
          </FormField>
          <FormField label="Remarks">
            <Textarea
              value={draft.remarks}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  remarks: event.target.value,
                }))
              }
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isUploading}>Save Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoGrid({ items }: { items: string[][] }) {
  return (
    <KeyValueGrid
      items={items.map(([label, value]) => ({ label, value }))}
      columns={2}
    />
  );
}



function CompactInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  if (type === "date") {
    return (
      <FormField label={label}>
        <DatePicker value={value} onChange={onChange} />
      </FormField>
    );
  }

  return (
    <FormField label={label}>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}

function formatDate(value: string) {
  if (!value) return "-";
  return format(parseISO(value), "dd MMM yyyy");
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
}

const emptyDocument: ProjectDocument = {
  id: "new",
  type: "Other",
  number: "",
  documentName: "",
  documentDate: "",
  contractDate: "",
  issueDate: "",
  expiryDate: "",
  amount: "",
  category: "Other",
  fileName: "document.pdf",
  remarks: "",
  uploadedOn: format(new Date(), "yyyy-MM-dd"),
  uploadedBy: "Demo Admin",
};
