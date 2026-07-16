"use client";

import { useState } from "react";
import {
  DownloadSimpleIcon,
  EyeIcon,
  FileArrowUpIcon,
  NotePencilIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { ActionTooltip } from "./ActionTooltip";
import { DataTable, type ColumnDef } from "./DataTable";
import { DatePicker } from "./DatePicker";
import { SectionCard } from "./SectionCard";
import { StatusBadge, type StatusValue } from "./StatusBadge";

export type DocumentUploadRecord = {
  id: string;
  type: string;
  referenceNumber: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  amount: string;
  fileName: string;
  remarks: string;
  uploadedOn: string;
  uploadedBy: string;
  status: StatusValue;
};

interface DocumentCategoryUploadPanelProps<T extends DocumentUploadRecord> {
  categories: string[];
  documents: T[];
  onChange?: (documents: T[]) => void;
  readOnly?: boolean;
  title?: string;
  description?: string;
}

const defaultStatus: StatusValue = "Pending";

export function DocumentCategoryUploadPanel<T extends DocumentUploadRecord>({
  categories,
  documents,
  onChange,
  readOnly = false,
  title = "Document Categories",
  description,
}: DocumentCategoryUploadPanelProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DocumentUploadRecord>(() =>
    createEmptyDocument(categories.at(-1) ?? "Other"),
  );

  const openUpload = (category = categories.at(-1) ?? "Other") => {
    if (readOnly) return;
    setEditingId(null);
    setDraft(createEmptyDocument(category));
    setDialogOpen(true);
  };

  const openEdit = (document: T) => {
    if (readOnly) return;
    setEditingId(document.id);
    setDraft(document);
    setDialogOpen(true);
  };

  const deleteDocument = (id: string) => {
    if (readOnly) return;
    onChange?.(documents.filter((document) => document.id !== id));
  };

  const saveDocument = () => {
    if (readOnly || !onChange) return;

    const nextDraft = {
      ...draft,
      type: draft.type || draft.category,
      fileName: draft.fileName || "-",
      uploadedOn: draft.uploadedOn || new Date().toISOString().slice(0, 10),
      uploadedBy: draft.uploadedBy || "Demo Admin",
    };

    if (editingId) {
      onChange(documents.map((document) => (document.id === editingId ? nextDraft as T : document)));
    } else {
      onChange([
        ...documents,
        {
          ...nextDraft,
          id: `doc-${documents.length + 1}`,
        } as T,
      ]);
    }

    setDialogOpen(false);
    setEditingId(null);
    setDraft(createEmptyDocument(categories.at(-1) ?? "Other"));
  };

  const columns: ColumnDef<T>[] = [
    { key: "type", header: "Type" },
    { key: "referenceNumber", header: "Reference No." },
    { key: "category", header: "Category" },
    { key: "issueDate", header: "Issue Date", render: (document) => document.issueDate || "-" },
    { key: "expiryDate", header: "Expiry Date", render: (document) => document.expiryDate || "-" },
    { key: "amount", header: "Amount" },
    { key: "fileName", header: "File", className: "min-w-48" },
    {
      key: "status",
      header: "Status",
      render: (document) => <StatusBadge status={document.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-36",
      render: (document) => (
        <div className="flex items-center gap-1">
          <ActionTooltip label="Preview">
            <Button type="button" variant="ghost" size="icon-xs" aria-label="Preview document">
              <EyeIcon size={13} />
            </Button>
          </ActionTooltip>
          <ActionTooltip label="Download">
            <Button type="button" variant="ghost" size="icon-xs" aria-label="Download document">
              <DownloadSimpleIcon size={13} />
            </Button>
          </ActionTooltip>
          {!readOnly ? (
            <>
              <ActionTooltip label="Edit">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Edit document"
                  onClick={() => openEdit(document)}
                >
                  <NotePencilIcon size={13} />
                </Button>
              </ActionTooltip>
              <ActionTooltip label="Replace">
                <Button type="button" variant="ghost" size="icon-xs" aria-label="Replace document">
                  <UploadSimpleIcon size={13} />
                </Button>
              </ActionTooltip>
              <ActionTooltip label="Delete">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Delete document"
                  onClick={() => deleteDocument(document.id)}
                >
                  <TrashIcon size={13} />
                </Button>
              </ActionTooltip>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SectionCard
        title={title}
        action={
          !readOnly ? (
            <Button type="button" size="sm" onClick={() => openUpload()}>
              <FileArrowUpIcon size={14} />
              Upload Document
            </Button>
          ) : null
        }
      >
        {description ? (
          <p className="mb-3 text-xs text-muted-foreground">{description}</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => {
            const uploadedCount = documents.filter((document) => document.category === category).length;
            return (
              <button
                key={category}
                type="button"
                disabled={readOnly}
                onClick={() => openUpload(category)}
                className={cn(
                  "rounded-lg border border-dashed border-border bg-muted/10 px-4 py-4 text-center text-sm font-semibold text-foreground transition-colors",
                  readOnly
                    ? "cursor-default"
                    : "hover:border-primary hover:bg-primary/5",
                )}
              >
                <FileArrowUpIcon size={20} className="mx-auto mb-2 text-primary" />
                {category}
                <span className="mt-1 block text-xs font-medium text-muted-foreground">
                  {uploadedCount} uploaded
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Uploaded Documents">
        <DataTable
          columns={columns}
          data={documents}
          emptyTitle="No documents uploaded"
          emptyDescription="Upload a document from the category tiles above."
          variant="striped"
        />
      </SectionCard>

      {!readOnly ? (
        <DocumentUploadDialog
          open={dialogOpen}
          categories={categories}
          draft={draft}
          title={editingId ? "Edit Document" : "Upload Document"}
          onDraftChange={setDraft}
          onOpenChange={setDialogOpen}
          onSave={saveDocument}
        />
      ) : null}
    </div>
  );
}

function DocumentUploadDialog({
  open,
  title,
  categories,
  draft,
  onDraftChange,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  title: string;
  categories: string[];
  draft: DocumentUploadRecord;
  onDraftChange: React.Dispatch<React.SetStateAction<DocumentUploadRecord>>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Add customer document details and upload reference.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Type">
            <Input
              value={draft.type}
              onChange={(event) => onDraftChange((current) => ({ ...current, type: event.target.value }))}
            />
          </Field>
          <Field label="Reference Number">
            <Input
              value={draft.referenceNumber}
              onChange={(event) => onDraftChange((current) => ({ ...current, referenceNumber: event.target.value }))}
            />
          </Field>
          <Field label="Category">
            <Select
              value={draft.category || undefined}
              onValueChange={(category) =>
                onDraftChange((current) => ({
                  ...current,
                  category: category ?? "Other",
                  type: current.type || category || "Other",
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={String(draft.status || defaultStatus)}
              onValueChange={(status) =>
                onDraftChange((current) => ({
                  ...current,
                  status: (status ?? defaultStatus) as StatusValue,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Pending", "Submitted", "In Review", "Approved", "Rejected", "Completed"].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Issue Date">
            <DatePicker
              value={draft.issueDate}
              onChange={(issueDate) => onDraftChange((current) => ({ ...current, issueDate: String(issueDate) }))}
              className="w-full"
            />
          </Field>
          <Field label="Expiry Date">
            <DatePicker
              value={draft.expiryDate}
              onChange={(expiryDate) => onDraftChange((current) => ({ ...current, expiryDate: String(expiryDate) }))}
              className="w-full"
            />
          </Field>
          <Field label="Amount">
            <Input
              value={draft.amount}
              onChange={(event) => onDraftChange((current) => ({ ...current, amount: event.target.value }))}
            />
          </Field>
          <Field label="File">
            <Input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                onDraftChange((current) => ({ ...current, fileName: file.name }));
              }}
            />
            {draft.fileName ? (
              <p className="mt-1 text-xs text-muted-foreground">{draft.fileName}</p>
            ) : null}
          </Field>
          <Field label="Remarks" className="md:col-span-2">
            <Textarea
              value={draft.remarks}
              onChange={(event) => onDraftChange((current) => ({ ...current, remarks: event.target.value }))}
              rows={3}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

function createEmptyDocument(category: string): DocumentUploadRecord {
  return {
    id: "",
    type: category,
    referenceNumber: "",
    category,
    issueDate: "",
    expiryDate: "",
    amount: "",
    fileName: "",
    remarks: "",
    uploadedOn: "",
    uploadedBy: "Demo Admin",
    status: defaultStatus,
  };
}
