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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ApiError } from "@/lib/api-client";
import { exportColumnTemplate } from "@/lib/export-excel";
import { useUserImportConfirm, useUserImportPreview } from "../../hooks/useUserImport";
import type { UserImportPreviewRow } from "../../services/users-import.service";

const TEMPLATE_HEADERS = ["Name", "Username", "Email", "Mobile", "Role", "Password"];

type PreviewRow = UserImportPreviewRow & { id: string };

export function UserImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [view, setView] = useState<"upload" | "preview">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [insertedCount, setInsertedCount] = useState<number | null>(null);

  const preview = useUserImportPreview();
  const confirm = useUserImportConfirm();

  const rows: PreviewRow[] = useMemo(() => {
    if (!preview.data) return [];
    return [...preview.data.validRows, ...preview.data.invalidRows].map((row) => ({
      ...row,
      id: String(row.rowNumber),
    }));
  }, [preview.data]);

  const totals = useMemo(
    () => ({
      total: rows.length,
      valid: preview.data?.validRows.length ?? 0,
      invalid: preview.data?.invalidRows.length ?? 0,
    }),
    [rows.length, preview.data],
  );

  const columns: ExcelColumn<PreviewRow>[] = useMemo(
    () => [
      { key: "name", label: "Name", width: 180, sticky: true, getValue: (row) => row.name },
      { key: "username", label: "Username", width: 150, getValue: (row) => row.username },
      { key: "email", label: "Email", width: 200, getValue: (row) => row.email },
      { key: "mobile", label: "Mobile", width: 150, getValue: (row) => row.mobile },
      { key: "role", label: "Role", width: 150, getValue: (row) => row.role },
      {
        key: "validation",
        label: "Validation",
        width: 110,
        getValue: (row) => (row.error ? "invalid" : "valid"),
        render: (row) => <StatusBadge status={row.error ? "Rejected" : "Approved"} />,
      },
      { key: "error", label: "Notes", width: 280, getValue: (row) => row.error || "-" },
    ],
    [],
  );

  function reset() {
    setView("upload");
    setSelectedFile(null);
    setPreviewError("");
    setInsertedCount(null);
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
    void exportColumnTemplate("users_import_template.xlsx", TEMPLATE_HEADERS);
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
    if (!preview.data?.validRows.length) return;
    const result = await confirm.mutateAsync(preview.data.validRows);
    setInsertedCount(result.insertedCount);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
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

              {insertedCount != null ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <CheckCircleIcon size={17} className="text-status-success-fg" />
                  <span className="font-medium text-foreground">
                    {insertedCount} user{insertedCount === 1 ? "" : "s"} imported
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
                    Import {totals.valid} User{totals.valid === 1 ? "" : "s"}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 px-1 text-sm text-muted-foreground">
              <span><b className="text-foreground">{totals.total}</b> rows</span>
              <span><b className="text-status-success-fg">{totals.valid}</b> valid</span>
              {totals.invalid > 0 && <span><b className="text-destructive">{totals.invalid}</b> errors (skipped)</span>}
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <ExcelDataGrid
                columns={columns}
                rows={rows}
                maxHeightClassName="max-h-[50vh]"
                getRowClassName={(row) => (row.error ? "bg-destructive/5 hover:bg-destructive/10" : undefined)}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
