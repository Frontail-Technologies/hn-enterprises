"use client";

import { useRef, useState } from "react";
import type { DragEvent } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  FileArrowDownIcon,
  FileArrowUpIcon,
  FileCsvIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTable, type ColumnDef } from "./DataTable";
import type { ImportField } from "./ImportDataDialog";
import { PageShell } from "./PageShell";
import { TablePanel } from "./TablePanel";

interface ImportDataPageProps<T extends { id: string }> {
  title: string;
  moduleName: string;
  description: string;
  backHref: string;
  backLabel: string;
  fields: ImportField[];
  previewRows: T[];
  previewColumns: ColumnDef<T>[];
  getRowStatus?: (row: T) => "valid" | "error";
  acceptedFormats?: string;
  emptyTitle?: string;
}

export function ImportDataPage<T extends { id: string }>({
  title,
  moduleName,
  description,
  backHref,
  backLabel,
  fields,
  previewRows,
  previewColumns,
  getRowStatus,
  acceptedFormats = ".xlsx,.xls,.csv",
  emptyTitle = "No rows previewed",
}: ImportDataPageProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const requiredFields = fields.filter((field) => field.required);
  const optionalFields = fields.filter((field) => !field.required);
  const validRows = getRowStatus
    ? previewRows.filter((row) => getRowStatus(row) === "valid").length
    : previewRows.length;
  const errorRows = getRowStatus
    ? previewRows.filter((row) => getRowStatus(row) === "error").length
    : 0;

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
    <PageShell
      title={title}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href={backHref}
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            {backLabel}
          </Link>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            <FileArrowDownIcon size={15} />
            Download Template
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_24rem]">
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
              "flex min-h-[22rem] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-border bg-card p-6 text-center transition-colors",
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
            <div className="grid size-12 place-items-center rounded-sm bg-primary/10 text-primary">
              <FileArrowUpIcon size={24} />
            </div>
            <h2 className="mt-3 text-base font-semibold text-foreground">
              Upload {moduleName} File
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>

            {selectedFile ? (
              <div className="mt-5 flex w-full max-w-lg items-center gap-3 rounded-sm border border-border bg-background px-3 py-2 text-left">
                <FileCsvIcon size={18} className="text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <CheckCircleIcon size={18} className="text-status-success-fg" />
              </div>
            ) : null}

            <Button type="button" variant="outline" className="mt-5">
              <UploadSimpleIcon size={15} />
              Choose File
            </Button>
          </div>

          <aside className="rounded-sm border border-border bg-card">
            <div className="border-b border-border/70 px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">Template Fields</p>
              <p className="text-xs text-muted-foreground">
                {requiredFields.length} required, {optionalFields.length} optional
              </p>
            </div>
            <div className="max-h-[19rem] overflow-y-auto p-3">
              <FieldGroup title="Required Fields" fields={requiredFields} required />
              <FieldGroup title="Optional Fields" fields={optionalFields} />
            </div>
          </aside>
        </section>

        <section className="grid gap-3 md:grid-cols-3 xl:max-w-4xl">
          <ImportStat label="Preview Rows" value={previewRows.length.toString()} />
          <ImportStat label="Valid Rows" value={validRows.toString()} />
          <ImportStat label="Rows With Errors" value={errorRows.toString()} />
        </section>

        <TablePanel
          title="Preview & Validation"
          subtitle="Review imported rows before pushing valid records into the system."
          pagination={
            <div className="flex gap-2">
              <button
                type="button"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <FileArrowDownIcon size={14} />
                Download Rejected Rows
              </button>
              <Button type="button" size="sm" disabled={!selectedFile}>
                <FileArrowUpIcon size={14} />
                Import Valid Rows
              </Button>
            </div>
          }
        >
          <DataTable
            data={previewRows}
            columns={previewColumns}
            variant="striped"
            emptyTitle={emptyTitle}
            emptyDescription={`Upload a ${moduleName.toLowerCase()} file to preview and validate rows.`}
          />
        </TablePanel>
      </div>
    </PageShell>
  );
}

function ImportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
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
  if (!fields.length) return null;

  return (
    <div className="mt-4 first:mt-0">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">{title}</p>
      <div className="grid gap-2">
        {fields.map((field) => (
          <div
            key={field.key}
            className="rounded-sm border border-border/70 bg-background px-2.5 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {field.label}
                </p>
                <p className="truncate text-xs text-muted-foreground">{field.key}</p>
              </div>
              {required ? (
                <span className="inline-flex items-center gap-1 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  <WarningCircleIcon size={11} />
                  Required
                </span>
              ) : null}
            </div>
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
