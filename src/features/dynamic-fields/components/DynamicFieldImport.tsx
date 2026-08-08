"use client";

import { useMemo, useRef, useState } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  FileArrowDownIcon,
  FileCsvIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api-client";
import { exportColumnTemplate } from "@/lib/export-excel";
import { useDynamicFieldsImportConfirm, useDynamicFieldsImportPreview } from "../hooks/useDynamicFields";
import type { CustomFieldImportRow } from "../types";
import type { ImportConfirmResult } from "../services/dynamic-fields-import.service";

const TEMPLATE_HEADERS = ["Label", "Group", "Value Type", "Options", "Required", "Access", "Position"];

type PreviewRow = CustomFieldImportRow & { id: string };

function rowStatus(row: CustomFieldImportRow) {
  if (row.issues.length) return "invalid";
  if (row.warnings.length) return "warning";
  return "valid";
}

export function DynamicFieldImport({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [view, setView] = useState<"upload" | "preview">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [confirmResult, setConfirmResult] = useState<ImportConfirmResult | null>(null);

  const preview = useDynamicFieldsImportPreview();
  const confirm = useDynamicFieldsImportConfirm();

  const rows: PreviewRow[] = useMemo(
    () => (preview.data?.rows ?? []).map((row) => ({ ...row, id: String(row.rowNumber) })),
    [preview.data],
  );

  const totals = useMemo(
    () => ({
      total: rows.length,
      valid: rows.filter((row) => rowStatus(row) === "valid").length,
      warning: rows.filter((row) => rowStatus(row) === "warning").length,
      error: rows.filter((row) => rowStatus(row) === "invalid").length,
    }),
    [rows],
  );

  const columns: ExcelColumn<PreviewRow>[] = useMemo(
    () => [
      { key: "label", label: "Label", width: 180, sticky: true, getValue: (row) => row.label },
      { key: "groupName", label: "Group", width: 160, getValue: (row) => row.groupName },
      { key: "valueType", label: "Value Type", width: 120, getValue: (row) => row.valueType },
      {
        key: "dropdownOptions",
        label: "Options",
        width: 220,
        getValue: (row) => (row.valueType === "Dropdown" ? row.dropdownOptions.join(", ") : "-"),
      },
      { key: "required", label: "Required", width: 100, getValue: (row) => row.required },
      { key: "supervisorAccess", label: "Access", width: 180, getValue: (row) => row.supervisorAccess },
      { key: "sortOrder", label: "Position", width: 100, getValue: (row) => row.sortOrder ?? null },
      {
        key: "validation",
        label: "Validation",
        width: 110,
        getValue: (row) => rowStatus(row),
        render: (row) => {
          const status = rowStatus(row);
          return <StatusBadge status={status === "valid" ? "Approved" : status === "warning" ? "Pending" : "Rejected"} />;
        },
      },
      {
        key: "errors",
        label: "Notes",
        width: 280,
        getValue: (row) => [...row.issues, ...row.warnings].join(", ") || "-",
      },
    ],
    [],
  );

  function reset() {
    setView("upload");
    setSelectedFile(null);
    setPreviewError("");
    setConfirmError("");
    setConfirmResult(null);
    preview.reset();
    confirm.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  function pickFile(file: File | undefined) {
    if (!file) return;
    const allowed = [".xlsx", ".xls", ".csv"];
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!allowed.includes(ext)) {
      setPreviewError("Unsupported file type. Please upload an .xlsx, .xls, or .csv file.");
      return;
    }
    setPreviewError("");
    setSelectedFile(file);
  }

  function handleDownloadTemplate() {
    void exportColumnTemplate("dynamic-fields-import-template.xlsx", TEMPLATE_HEADERS);
  }

  async function handleNext() {
    if (!selectedFile) return;
    setPreviewError("");
    try {
      await preview.mutateAsync(selectedFile);
      setView("preview");
    } catch (error) {
      setPreviewError(error instanceof ApiError ? error.message : "Unable to preview import file");
    }
  }

  async function handleImport() {
    setConfirmError("");
    try {
      const result = await confirm.mutateAsync(preview.data?.rows ?? []);
      setConfirmResult(result);
    } catch (error) {
      setConfirmError(error instanceof ApiError ? error.message : "Unable to confirm import");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Fields</DialogTitle>
        </DialogHeader>

        {view === "upload" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-end">
              <button type="button" className={buttonVariants({ variant: "outline", size: "sm" })} onClick={handleDownloadTemplate}>
                <FileArrowDownIcon size={15} />
                Download Template
              </button>
            </div>
            <div
              className={`flex min-h-[40vh] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/10" : "border-border/80 bg-muted/10 hover:bg-muted/30"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                pickFile(event.dataTransfer.files[0]);
              }}
            >
              <FileCsvIcon size={48} className="text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">
                Drag &amp; drop your file or <span className="cursor-pointer underline">choose a file</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedFile ? (
                  <span className="font-medium text-foreground">{selectedFile.name}</span>
                ) : (
                  "Supported formats: .xlsx, .xls, .csv"
                )}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(event) => pickFile(event.target.files?.[0])}
              />
            </div>
            {previewError ? <p className="text-sm text-destructive">{previewError}</p> : null}
            <div className="flex items-center justify-end">
              <Button type="button" disabled={!selectedFile || preview.isPending} onClick={() => void handleNext()}>
                {preview.isPending ? <LoadingSpinner size="sm" /> : null}
                Next
                <CaretRightIcon size={15} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <FileCsvIcon size={16} className="shrink-0 text-primary" />
                <span className="truncate font-medium text-foreground">{preview.data?.fileName}</span>
              </div>

              {confirmResult ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <CheckCircleIcon size={17} className="text-status-success-fg" />
                  <span className="font-medium text-foreground">
                    {confirmResult.created} field{confirmResult.created === 1 ? "" : "s"} created
                    {confirmResult.skipped ? ` · ${confirmResult.skipped} skipped` : ""}
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                    Done
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setView("upload")} disabled={confirm.isPending}>
                    <CaretLeftIcon size={15} />
                    Back
                  </Button>
                  <Button type="button" onClick={() => void handleImport()} disabled={confirm.isPending || !totals.valid}>
                    {confirm.isPending ? <LoadingSpinner size="sm" /> : null}
                    Import {totals.valid} Field{totals.valid === 1 ? "" : "s"}
                  </Button>
                </div>
              )}
            </div>

            {confirmError ? <p className="text-sm text-destructive">{confirmError}</p> : null}

            <div className="flex flex-wrap gap-4 px-1 text-sm text-muted-foreground">
              <span><b className="text-foreground">{totals.total}</b> rows</span>
              <span><b className="text-status-success-fg">{totals.valid}</b> valid</span>
              {totals.warning > 0 && <span><b className="text-status-warning-fg">{totals.warning}</b> warnings (skipped)</span>}
              {totals.error > 0 && <span><b className="text-destructive">{totals.error}</b> errors (skipped)</span>}
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <ExcelDataGrid columns={columns} rows={rows} maxHeightClassName="max-h-[50vh]" />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
