"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { uploadFile } from "@/lib/upload";
import type { ProjectDocument } from "../../types/project.types";
import { documentCategories } from "./project-document.constants";

export function ProjectDocumentDialog({
  open,
  draft,
  setDraft,
  onOpenChange,
  onSave,
  projectId,
}: {
  open: boolean;
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
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>Add a project document.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Document Type">
            <Select
              value={draft.category}
              onValueChange={(value) => {
                const category = documentCategories.find((item) => item.type === value);
                setDraft((current) => ({
                  ...current,
                  category: category?.type ?? "Other",
                  type: category?.type ?? "Other",
                  documentName: current.documentName || `${category?.label ?? "Other"} Document`,
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
            onChange={(value) => setDraft((current) => ({ ...current, documentName: value }))}
          />
          <CompactInput
            label="No. / Reference"
            value={draft.number}
            onChange={(value) => setDraft((current) => ({ ...current, number: value }))}
          />
          <CompactInput
            label="Amount"
            value={draft.amount}
            onChange={(value) => setDraft((current) => ({ ...current, amount: value }))}
          />
          <CompactInput
            label="Document Date"
            type="date"
            value={draft.documentDate}
            onChange={(value) => setDraft((current) => ({ ...current, documentDate: value, issueDate: value }))}
          />
          <CompactInput
            label="Expiry Date"
            type="date"
            value={draft.expiryDate}
            onChange={(value) => setDraft((current) => ({ ...current, expiryDate: value }))}
          />
          <FormField label="File">
            <Input type="file" onChange={(event) => void handleFileSelect(event.target.files?.[0])} />
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
              onChange={(event) => setDraft((current) => ({ ...current, remarks: event.target.value }))}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isUploading}>
            Save Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </FormField>
  );
}
