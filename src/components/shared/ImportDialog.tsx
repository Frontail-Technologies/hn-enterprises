import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon, DownloadSimpleIcon, FileCsvIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExcelDataGrid, type ExcelColumn } from "@/components/shared/ExcelDataGrid";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { exportColumnTemplate } from "@/lib/export-excel";

export type ImportPreviewResult<Row> = {
  fileName: string;
  validRows: Row[];
  invalidRows: (Row & { error?: string })[];
};

export function ImportDialog<Row extends Record<string, unknown>>({
  trigger,
  title,
  description,
  templateFileName,
  templateHeaders,
  previewColumns,
  isPreviewPending,
  isConfirmPending,
  onPreview,
  onConfirm,
  entityLabelPlural,
}: {
  trigger: ReactElement;
  title: string;
  description: ReactNode;
  templateFileName: string;
  templateHeaders: string[];
  previewColumns: ExcelColumn<Row & { id: string; error?: string }>[];
  isPreviewPending: boolean;
  isConfirmPending: boolean;
  onPreview: (file: File) => Promise<ImportPreviewResult<Row>>;
  onConfirm: (validRows: Row[]) => Promise<{ insertedCount: number }>;
  entityLabelPlural: string;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<"upload" | "preview">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [preview, setPreview] = useState<ImportPreviewResult<Row> | null>(null);

  function reset() {
    setView("upload");
    setSelectedFile(null);
    setPreviewError("");
    setPreview(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    setOpen(nextOpen);
  }

  function pickFile(file: File | undefined) {
    if (!file) return;
    const allowed = [".xlsx", ".csv"];
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!allowed.includes(ext)) {
      setPreviewError("Unsupported file type. Please upload an .xlsx or .csv file.");
      return;
    }
    setPreviewError("");
    setSelectedFile(file);
  }

  async function handleNext() {
    if (!selectedFile) return;
    setPreviewError("");
    try {
      const res = await onPreview(selectedFile);
      setPreview(res);
      setView("preview");
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Unable to preview import file");
    }
  }

  async function handleConfirm() {
    if (!preview?.validRows.length) return;
    await onConfirm(preview.validRows);
    handleOpenChange(false);
  }

  const previewRows = [...(preview?.validRows ?? []), ...(preview?.invalidRows ?? [])].map((row, i) => ({
    ...row,
    id: String(i),
  })) as (Row & { id: string; error?: string })[];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        {view === "upload" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-end">
              <button
                type="button"
                className={buttonVariants({ variant: "outline", size: "sm" })}
                onClick={() => exportColumnTemplate(templateFileName, templateHeaders)}
              >
                <DownloadSimpleIcon size={15} />
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
                  "Supported formats: .xlsx, .csv"
                )}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(event) => pickFile(event.target.files?.[0])}
              />
            </div>
            {previewError ? <p className="text-sm text-destructive">{previewError}</p> : null}
            <div className="flex items-center justify-end">
              <Button type="button" disabled={!selectedFile || isPreviewPending} onClick={() => void handleNext()}>
                {isPreviewPending ? <LoadingSpinner size="sm" /> : null}
                Next
                <CaretRightIcon size={15} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>
                  <b className="text-status-success-fg">{preview?.validRows.length ?? 0}</b> valid
                </span>
                <span>
                  <b className="text-destructive">{preview?.invalidRows.length ?? 0}</b> invalid
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setView("upload")} disabled={isConfirmPending}>
                  <CaretLeftIcon size={15} />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleConfirm()}
                  disabled={!preview?.validRows.length || isConfirmPending}
                >
                  {isConfirmPending ? <LoadingSpinner size="sm" /> : null}
                  Import {preview?.validRows.length ?? 0} {entityLabelPlural}
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <ExcelDataGrid
                columns={previewColumns}
                rows={previewRows}
                maxHeightClassName="max-h-[50vh]"
                getRowClassName={(row) => (row.error ? "bg-rose-50/50 hover:bg-rose-50" : undefined)}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
