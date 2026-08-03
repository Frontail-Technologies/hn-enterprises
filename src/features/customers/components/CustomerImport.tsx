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

const sampleRows: CustomerMasterSheetRow[] = [
  {
    id: "sample-1",
    customerId: "sample-1",
    values: {
      reportNoGi: "GI-100245",
      reportNoGc: "GC-100245",
      reportNoConversion: "CONV-100245",
      trBpNo: "BP-100245",
      customerName: "Rajesh Kumar",
      mobileNo: "9876543210",
      fullAddress: "42, Shyam Nagar Block A, Jaipur",
      projectName: "Shyam Nagar CGD Project",
      siteArea: "Shyam Nagar Block A",
      city: "Jaipur",
    },
  },
  {
    id: "sample-2",
    customerId: "sample-2",
    values: {
      reportNoGi: "GI-553901",
      reportNoGc: "GC-553901",
      trBpNo: "TR-553901",
      customerName: "Meena Sharma",
      mobileNo: "9823411122",
      fullAddress: "11, New Sanganer Road, Shyam Nagar, Jaipur",
      projectName: "Shyam Nagar CGD Project",
      siteArea: "Shyam Nagar Block B",
      city: "Jaipur",
    },
  },
  {
    id: "sample-3",
    customerId: "sample-3",
    values: {
      reportNoGi: "GI-220118",
      reportNoGc: "GC-220118",
      reportNoConversion: "CONV-220118",
      trBpNo: "BP-220118",
      customerName: "Green Mart Store",
      mobileNo: "9810012200",
      fullAddress: "Shop 8, Green City Phase 1, Indore",
      projectName: "Green City Phase 1",
      siteArea: "Commercial Block",
      city: "Indore",
    },
  },
];

const importStages = ["Processing", "Extracting", "Saving"] as const;

export function CustomerImport() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [view, setView] = useState<"upload" | "preview">("upload");
  const { data: activeCustomFields = [] } = useCustomFieldsQuery("Active");

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

  const sampleColumns: ExcelColumn<CustomerMasterSheetRow>[] = useMemo(
    () => masterColumns.map((column) => ({ ...column, getValue: (row) => row.values[column.key] })),
    [masterColumns],
  );

  const previewColumns: ExcelColumn<NormalizedImportRow>[] = useMemo(
    () => [
      {
        key: "giReportNumber",
        label: "Report No-GI",
        width: 150,
        sticky: true,
        getValue: (row) => row.giReportNumber,
      },
      {
        key: "gcReportNumber",
        label: "Report No-GC",
        width: 150,
        sticky: true,
        getValue: (row) => row.gcReportNumber,
      },
      {
        key: "conversionReportNumber",
        label: "Report No-Conversion",
        width: 180,
        sticky: true,
        getValue: (row) => row.conversionReportNumber,
      },
      { key: "trBpNumber", label: "TR No. / BP No.", width: 150, sticky: true, getValue: (row) => row.trBpNumber },
      { key: "customerName", label: "Customer Name", width: 180, getValue: (row) => row.customerName },
      { key: "mobileNumber", label: "Mobile No.", width: 140, getValue: (row) => row.mobileNumber },
      { key: "fullAddress", label: "Full Address", width: 280, getValue: (row) => row.fullAddress },
      { key: "projectName", label: "Project", width: 200, getValue: (row) => row.projectName },
      { key: "siteName", label: "Site / Area", width: 170, getValue: (row) => row.siteName },
      { key: "city", label: "City", width: 120, getValue: (row) => row.city },
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
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/20 px-4 text-center">
              <div className="grid size-11 place-items-center rounded-md bg-primary/10 text-primary">
                <FileArrowUpIcon size={22} />
              </div>
              <p className="text-sm font-medium text-foreground">
                {selectedFile?.name || "Choose customer master file"}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                <UploadSimpleIcon size={15} />
                Choose File
              </Button>
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

          <section className="min-w-0">
            <ExcelDataGrid
              columns={sampleColumns}
              rows={sampleRows}
              emptyTitle="No sample rows"
              maxHeightClassName="max-h-[420px]"
            />
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

          <ExcelDataGrid
            columns={previewColumns}
            rows={preview?.rows ?? []}
            emptyTitle="No rows extracted"
            maxHeightClassName="max-h-[62vh]"
          />
        </section>
      )}
    </PageShell>
  );
}
