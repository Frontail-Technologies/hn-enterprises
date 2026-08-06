"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CaretRightIcon,
  CheckCircleIcon,
  FileArrowDownIcon,
  FileArrowUpIcon,
  FileCsvIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageShell } from "@/components/shared/PageShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCustomFieldsQuery } from "@/features/management/hooks/useMasters";
import { ApiError } from "@/lib/api-client";
import { exportColumnTemplate } from "@/lib/export-excel";
import {
  buildCustomerMasterSheetColumns,
  type CustomerMasterSheetRow,
} from "../services/customers.service";
import {
  getRowStatus,
  masterImportApi,
  type ConfirmImportResult,
  type ImportPreviewResult,
  type NormalizedImportRow,
} from "../services/master-import.service";


const importStages = ["Processing", "Extracting", "Saving"] as const;

export function CustomerImport() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [view, setView] = useState<"upload" | "preview">("upload");
  const { data: activeCustomFields = [] } = useCustomFieldsQuery("Active");
  const [isDragging, setIsDragging] = useState(false);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [confirmResult, setConfirmResult] = useState<ConfirmImportResult | null>(null);
  const [stageIndex, setStageIndex] = useState(0);

  const masterColumns = useMemo(
    () => buildCustomerMasterSheetColumns(activeCustomFields),
    [activeCustomFields],
  );


  const previewColumns: ExcelColumn<NormalizedImportRow>[] = useMemo(
    () => [
      { key: "giReportNumber", label: "Report No-GI", width: 150, sticky: true, getValue: (row) => row.giReportNumber },
      { key: "gcReportNumber", label: "Report No-GC", width: 150, sticky: true, getValue: (row) => row.gcReportNumber },
      { key: "conversionReportNumber", label: "Report No-Conversion", width: 180, sticky: true, getValue: (row) => row.conversionReportNumber },
      { key: "trBpNumber", label: "TR No. / BP No.", width: 150, sticky: true, getValue: (row) => row.trBpNumber },
      { key: "customerName", label: "Customer Name", width: 180, getValue: (row) => row.customerName },
      { key: "mobileNumber", label: "Mobile No.", width: 140, getValue: (row) => row.mobileNumber },
      { key: "fullAddress", label: "Address", width: 280, getValue: (row) => row.fullAddress },
      { key: "projectName", label: "Project", width: 200, getValue: (row) => row.projectName },
      { key: "siteName", label: "Site / Area", width: 170, getValue: (row) => row.siteName },
      { key: "city", label: "City", width: 120, getValue: (row) => row.city },
      { key: "connectionType", label: "Connection Type", width: 160, getValue: (row) => row.connectionType },
      { key: "houseType", label: "House Type", width: 140, getValue: (row) => row.houseType },
      { key: "scheme", label: "Scheme", width: 150, getValue: (row) => row.scheme },
      { key: "plumberName", label: "Plumber", width: 160, getValue: (row) => row.plumberName },
      { key: "supervisorName", label: "Supervisor", width: 160, getValue: (row) => row.supervisorName },
      { key: "customerStatus", label: "Customer Status", width: 150, getValue: (row) => row.customerStatus },
      { key: "siteCode", label: "Site Code", width: 120, getValue: (row) => row.siteCode },
      {
        key: "validation",
        label: "Validation",
        width: 120,
        getValue: (row) => getRowStatus(row),
        render: (row) => {
          const status = getRowStatus(row);
          return (
            <StatusBadge
              status={status === "valid" ? "Approved" : status === "warning" ? "Pending" : "Rejected"}
            />
          );
        },
      },
      {
        key: "errors",
        label: "Errors",
        width: 320,
        getValue: (row) => [...row.issues, ...row.warnings].join(", ") || "-",
      },
    ],
    [],
  );

  useEffect(() => {
    if (!isConfirming) return;

    const timer = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % importStages.length);
    }, 700);
    return () => window.clearInterval(timer);
  }, [isConfirming]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
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
    void exportColumnTemplate(
      "customer-import-template.xlsx",
      masterColumns.map((column) => column.label),
    );
  }

  async function handleNext() {
    if (!selectedFile) return;
    setPreviewError("");
    setIsPreviewing(true);
    try {
      const result = await masterImportApi.preview(selectedFile);
      setPreview(result);
      setView("preview");
    } catch (error) {
      setPreviewError(error instanceof ApiError ? error.message : "Unable to preview import file");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleImport() {
    if (!preview) return;
    setConfirmError("");
    setConfirmResult(null);
    setStageIndex(0);
    setIsConfirming(true);
    try {
      const result = await masterImportApi.confirm(preview.batchId);
      setConfirmResult(result);
    } catch (error) {
      setConfirmError(error instanceof ApiError ? error.message : "Unable to confirm import");
    } finally {
      setIsConfirming(false);
    }
  }

  function handleBackToUpload() {
    setView("upload");
    setPreview(null);
    setPreviewError("");
    setConfirmResult(null);
    setConfirmError("");
  }

  return (
    <PageShell
      title="Import Customers"
      actions={
        <>
          <Link href="/customers" className={buttonVariants({ variant: "outline", size: "default" })}>
            Back to Customers
          </Link>
          <button
            type="button"
            className={buttonVariants({ variant: "outline", size: "default" })}
            onClick={handleDownloadTemplate}
          >
            <FileArrowDownIcon size={15} />
            Download Template
          </button>
        </>
      }
    >
      {view === "upload" ? (
        <div className="space-y-4">
          <section className="rounded-lg border border-border/70 bg-card p-4">
            <div
              className={`flex min-h-[60vh] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border/80 bg-muted/10 hover:bg-muted/30"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-muted-foreground/40 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                >
                  <path d="M216,72H130.67L102.93,51.2a16.12,16.12,0,0,0-9.6-3.2H40A16,16,0,0,0,24,64V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72Z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-foreground">
                Drag & drop your file or <span className="underline cursor-pointer">choose a file</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedFile ? (
                  <span className="font-medium text-foreground">{selectedFile.name}</span>
                ) : (
                  "Supported formats: .xlsx, .xls, .csv · Max 50 MB"
                )}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {previewError ? <p className="mt-2 text-sm text-destructive">{previewError}</p> : null}
            <div className="mt-3 flex items-center justify-end">
              <Button type="button" disabled={!selectedFile || isPreviewing} onClick={() => void handleNext()}>
                {isPreviewing ? <LoadingSpinner size="sm" /> : null}
                Next
                <CaretRightIcon size={15} />
              </Button>
            </div>
          </section>
        </div>
      ) : (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <FileCsvIcon size={16} className="shrink-0 text-primary" />
              <span className="truncate font-medium text-foreground">{preview?.fileName}</span>
            </div>

            {confirmResult ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <CheckCircleIcon size={17} className="text-status-success-fg" />
                <span className="font-medium text-foreground">
                  {confirmResult.customersCreated} customers, {confirmResult.projectsCreated} projects,{" "}
                  {confirmResult.sitesCreated} sites created
                  {confirmResult.rowsRejected ? ` · ${confirmResult.rowsRejected} rows rejected` : ""}
                </span>
                <Link href="/customers" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Back to Customers
                </Link>
              </div>
            ) : isConfirming ? (
              <div className="flex items-center gap-2 text-sm">
                <LoadingSpinner size="sm" />
                <span className="font-medium text-foreground">{importStages[stageIndex]}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleBackToUpload}>
                  Back
                </Button>
                <Button type="button" onClick={() => void handleImport()}>
                  Import
                </Button>
              </div>
            )}
          </div>

          {confirmError ? <p className="text-sm text-destructive">{confirmError}</p> : null}

          {preview ? (
            <>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground px-1">
                <span><b className="text-foreground">{preview.totals.rows}</b> rows</span>
                <span><b className="text-status-success-fg">{preview.totals.validRows}</b> valid</span>
                {preview.totals.warningRows > 0 && <span><b className="text-status-warning-fg">{preview.totals.warningRows}</b> warnings</span>}
                {preview.totals.invalidRows > 0 && <span><b className="text-destructive">{preview.totals.invalidRows}</b> errors</span>}
              </div>
              <ExcelDataGrid columns={previewColumns} rows={preview.rows} />
            </>
          ) : null}

        </section>
      )}
    </PageShell>
  );
}
