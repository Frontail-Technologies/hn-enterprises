"use client";

import { useRef, useState } from "react";
import type { DragEvent, ReactNode } from "react";
import {
  CheckCircleIcon,
  FileArrowUpIcon,
  FileCsvIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ImportField {
  key: string;
  label: string;
  required?: boolean;
  helper?: string;
}

interface ImportDataDialogProps {
  moduleName: string;
  description?: string;
  fields: ImportField[];
  trigger: ReactNode;
  acceptedFormats?: string;
  templateLabel?: string;
}

export function ImportDataDialog({
  moduleName,
  description = "Upload a CSV or Excel file and validate it against the required template fields.",
  fields,
  trigger,
  acceptedFormats = ".xlsx,.xls,.csv",
  templateLabel = "Download Template",
}: ImportDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const requiredFields = fields.filter((field) => field.required);
  const optionalFields = fields.filter((field) => !field.required);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) setSelectedFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <>
      <span className="inline-flex" onClick={() => setOpen(true)}>
        {trigger}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] p-0 sm:max-w-4xl">
          <DialogHeader className="border-b border-border/70 px-4 py-3">
            <DialogTitle>Import {moduleName}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-5 text-center transition-colors",
                isDragging && "border-primary bg-primary/5",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept={acceptedFormats}
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileArrowUpIcon size={24} />
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">
                Drag and drop file here
              </p>
              <p className="mt-1 max-w-sm text-xs font-medium text-muted-foreground">
                Upload Excel or CSV data using the fixed {moduleName.toLowerCase()} master
                template.
              </p>

              {selectedFile ? (
                <div className="mt-4 flex w-full max-w-md items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left">
                  <FileCsvIcon size={18} className="text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <CheckCircleIcon size={18} className="text-status-success-fg" />
                </div>
              ) : null}

              <Button type="button" variant="outline" className="mt-4">
                <UploadSimpleIcon size={15} />
                Choose File
              </Button>
            </div>

            <aside className="rounded-xl border border-border bg-card">
              <div className="border-b border-border/70 px-3 py-2.5">
                <p className="text-sm font-bold text-foreground">Template Fields</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {requiredFields.length} required, {optionalFields.length} optional
                </p>
              </div>
              <div className="max-h-72 space-y-3 overflow-y-auto p-3">
                <FieldGroup title="Required" fields={requiredFields} required />
                <FieldGroup title="Optional" fields={optionalFields} />
              </div>
            </aside>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline">
              {templateLabel}
            </Button>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="button" disabled={!selectedFile}>
              Import Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FieldGroup({
  title,
  fields,
  required,
}: {
  title: string;
  fields: ImportField[];
  required?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-muted-foreground">{title}</p>
      <div className="space-y-1.5">
        {fields.map((field) => (
          <div
            key={field.key}
            className="rounded-lg border border-border/70 bg-background px-2.5 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {field.label}
                </p>
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {field.key}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  required
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {required ? "Required" : "Optional"}
              </span>
            </div>
            {field.helper ? (
              <p className="mt-1 text-xs text-muted-foreground">{field.helper}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
