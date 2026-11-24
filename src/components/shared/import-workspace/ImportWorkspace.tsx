"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  CheckCircleIcon,
  DownloadSimpleIcon,
  FileXlsIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageIcon, pageIconForPath } from "@/components/shared/PageIcon";
import { FullViewPortal } from "@/components/shared/table/FullViewPortal";
import { FullViewToggleButton } from "@/components/shared/table/FullViewToggleButton";
import { filesFromDrop } from "@/lib/file-drop";
import { cn } from "@/lib/utils";
import { ImportFilterTabs } from "./ImportFilterTabs";
import { ImportPreviewTable } from "./ImportPreviewTable";
import { ImportRowEditorModal } from "./ImportRowEditorModal";
import { ImportStepper } from "./ImportStepper";
import { ImportSummary } from "./ImportSummary";
import { useImportWorkspace } from "./useImportWorkspace";
import type { ImportWorkspaceConfig } from "./types";

const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const VIEWPORT_HEIGHT_CLASS = "md:flex md:h-[calc(100dvh-4.5rem)] md:min-h-0 md:flex-col";
const ENTER = "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 fill-mode-both";

export function ImportWorkspace<TData>({
  config,
  backHref,
  backLabel = "Back",
}: {
  config: ImportWorkspaceConfig<TData>;
  backHref?: string;
  backLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileTypeError, setFileTypeError] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const workspace = useImportWorkspace(config);
  const router = useRouter();

  /**
   * All rows imported: confirm with a toast and go back to the list (when there
   * is one). Some failed: stay here so they can be fixed and imported again.
   */
  async function handleCommit() {
    const result = await workspace.commit();
    if (!result) return;
    const label = config.entityLabelPlural.toLowerCase();
    if (!result.failed.length) {
      toast.success(`${result.imported.toLocaleString("en-IN")} ${label} imported`);
      if (backHref) router.push(backHref);
      return;
    }
    toast.warning(`${result.imported.toLocaleString("en-IN")} ${label} imported, ${result.failed.length} failed`, {
      description: "The failed rows are still listed here - fix them and import again.",
    });
  }
  const sectionIcon = pageIconForPath(usePathname());
  const isPreview = workspace.view === "preview";
  const [fullView, setFullView] = useState(false);
  const step: 0 | 1 | 2 = !isPreview ? 0 : workspace.commitResult ? 2 : 1;
  const readyShare = workspace.summary.total ? Math.round((workspace.summary.ready / workspace.summary.total) * 100) : 0;

  function pickFile(file: File | undefined) {
    if (!file) return;
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileTypeError("Unsupported file type. Please upload an .xlsx, .xls, or .csv file.");
      return;
    }
    setFileTypeError("");
    setSelectedFile(file);
  }

  function clearFile() {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function discardAndRestart() {
    setConfirmDiscard(false);
    setSelectedFile(null);
    workspace.backToUpload();
  }

  function handleBackToUpload() {
    // Unsaved edits are confirmed with the shared dialog (RG-031) instead of window.confirm.
    if (workspace.hasUnsavedWork) setConfirmDiscard(true);
    else discardAndRestart();
  }

  const activeRow = workspace.rows.find((row) => row.tempId === workspace.editingTempId) ?? null;

  return (
    <div className={cn("flex flex-col gap-4", VIEWPORT_HEIGHT_CLASS)}>
      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {backHref ? (
            <a
              href={backHref}
              aria-label={backLabel}
              title={backLabel}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeftIcon size={18} />
            </a>
          ) : null}
          <PageIcon name={sectionIcon} />
          <div className="min-w-0">
            <h1 className="truncate text-page-title">{config.title}</h1>
            {isPreview && workspace.fileName ? (
              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground">
                <FileXlsIcon size={15} className="shrink-0 text-success" />
                <span className="truncate">{workspace.fileName}</span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <ImportStepper current={step} />
          {isPreview ? (
            <Button type="button" variant="outline" size="compact" onClick={handleBackToUpload} disabled={workspace.isCommitting}>
              <ArrowsClockwiseIcon size={14} />
              Replace file
            </Button>
          ) : null}
        </div>
      </div>

      {!isPreview ? (
        <div key="upload" className={cn("grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]", ENTER)}>
          {/* Drop zone */}
          <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-5 shadow-card">
            <div
              role="button"
              tabIndex={0}
              aria-label="Choose an import file"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
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
                const [file] = filesFromDrop(event.dataTransfer);
                if (file) pickFile(file);
              }}
              className={cn(
                "group flex min-h-[44vh] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 text-center outline-none transition-[border-color,background-color] duration-200 focus-visible:ring-3 focus-visible:ring-ring/50",
                isDragging
                  ? "border-primary bg-primary-soft"
                  : selectedFile
                    ? "border-success/50 bg-success-soft/50"
                    : "border-border-strong hover:border-primary/50 hover:bg-muted/40",
              )}
            >
              {selectedFile ? (
                <div key={selectedFile.name} className="flex flex-col items-center gap-4 animate-in fade-in-0 zoom-in-95 duration-300">
                  <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
                    <CheckCircleIcon size={30} weight="fill" />
                  </span>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card py-2 ps-3 pe-2 text-left shadow-card">
                    <FileXlsIcon size={26} className="shrink-0 text-success" />
                    <span className="flex min-w-0 flex-col">
                      <span className="max-w-64 truncate text-sm font-semibold text-foreground">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
                    </span>
                    <button
                      type="button"
                      aria-label="Remove selected file"
                      className="ms-1 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger-soft hover:text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        clearFile();
                      }}
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                  <p className="text-[13px] text-muted-foreground">Drop a different file or click to choose another.</p>
                </div>
              ) : (
                <>
                  <span
                    className={cn(
                      "flex size-16 items-center justify-center rounded-full transition-all duration-300",
                      isDragging
                        ? "-translate-y-1 scale-110 bg-primary text-primary-foreground shadow-floating"
                        : "bg-primary-soft text-primary group-hover:-translate-y-0.5",
                    )}
                  >
                    <UploadSimpleIcon size={28} weight="bold" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">
                      {isDragging ? "Drop it here" : (
                        <>
                          <span className="text-primary">Click to choose a file</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Excel (.xlsx, .xls) or CSV</p>
                  </div>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(event) => pickFile(event.target.files?.[0])}
              />
            </div>

            {fileTypeError || workspace.previewError ? (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-danger-soft px-3 py-2 text-sm text-destructive animate-in fade-in-0 duration-200">
                <WarningCircleIcon size={17} weight="fill" className="mt-px shrink-0" />
                {fileTypeError || workspace.previewError}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              {workspace.isPreviewing ? (
                <div className="flex min-w-48 flex-1 flex-col gap-1.5" role="status">
                  <span className="text-[13px] text-muted-foreground">Reading and checking rows…</span>
                  <span className="relative h-1.5 overflow-hidden rounded-full bg-muted">
                    <span className="absolute inset-y-0 w-1/3 rounded-full bg-primary animate-[import-progress_1.1s_ease-in-out_infinite]" />
                  </span>
                </div>
              ) : (
                <span className="text-[13px] text-muted-foreground">
                  {selectedFile ? "Next, review every row before anything is saved." : "Nothing is saved until you confirm the import."}
                </span>
              )}
              <Button type="button" disabled={!selectedFile || workspace.isPreviewing} onClick={() => selectedFile && void workspace.loadPreview(selectedFile)}>
                {workspace.isPreviewing ? <LoadingSpinner size="sm" /> : null}
                Review rows
                <ArrowRightIcon size={15} />
              </Button>
            </div>
          </section>

          {/* Guidance */}
          <aside className="flex flex-col gap-4 rounded-card border border-border bg-card p-5 shadow-card">
            <h2 className="text-section-title">Before you start</h2>
            {config.description ? <div className="text-sm text-muted-foreground">{config.description}</div> : null}
            <ol className="flex flex-col gap-3 text-[13px]">
              {[
                config.onDownloadTemplate ? "Download the template and fill one row per record." : "Use one row per record, with column headers in the first row.",
                "Upload the file — every row is checked before import.",
                "Fix or remove rejected rows, then import the ready ones.",
              ].map((tip, index) => (
                <li key={tip} className="flex gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">{index + 1}</span>
                  <span className="text-foreground/90">{tip}</span>
                </li>
              ))}
            </ol>
            {config.onDownloadTemplate ? (
              <Button type="button" variant="outline" className="mt-auto" onClick={config.onDownloadTemplate}>
                <DownloadSimpleIcon size={15} />
                Download template
              </Button>
            ) : null}
          </aside>
        </div>
      ) : (
        <FullViewPortal active={fullView} onExit={() => setFullView(false)}>
          <div key="preview" className={cn(fullView ? "flex min-h-0 flex-1 flex-col gap-3" : "contents")}>
            {workspace.commitResult ? (
              <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-card border border-success/30 bg-success-soft px-4 py-3 animate-in fade-in-0 zoom-in-95 duration-300">
                <span className="flex size-9 items-center justify-center rounded-full bg-success text-white">
                  <CheckCircleIcon size={20} weight="fill" className="animate-in zoom-in-50 duration-500" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-success-foreground">
                    {workspace.commitResult.imported.toLocaleString("en-IN")} {config.entityLabelPlural.toLowerCase()} imported
                  </span>
                  {workspace.commitResult.failed.length ? (
                    <span className="text-[13px] text-success-foreground/80">
                      {workspace.commitResult.failed.length} rows failed — fix them below and import again.
                    </span>
                  ) : null}
                </span>
              </div>
            ) : null}
            {workspace.commitError || workspace.rowActionError ? (
              <p role="alert" className="flex shrink-0 items-start gap-2 rounded-lg border border-destructive/25 bg-danger-soft px-3 py-2 text-sm text-destructive animate-in fade-in-0 duration-200">
                <WarningCircleIcon size={17} weight="fill" className="mt-px shrink-0" />
                {workspace.commitError || workspace.rowActionError}
              </p>
            ) : null}

            <div className={cn("shrink-0", ENTER)}>
              <ImportFilterTabs active={workspace.filter} onChange={workspace.setFilter} summary={workspace.summary} />
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
              <ImportSummary summary={workspace.summary} importedCount={workspace.importedCount} onUndoAllRemoved={() => void workspace.undoAllRemoved()} />
              <FullViewToggleButton active={fullView} onToggle={() => setFullView((current) => !current)} />
            </div>

            <ImportPreviewTable
              columns={config.columns}
              rows={workspace.filteredRows}
              onEdit={workspace.startEdit}
              onToggleRemove={(tempId, removed) => void workspace.toggleRemove(tempId, removed)}
              removingTempId={workspace.removingTempId}
              fillHeight
            />

            <div className="sticky bottom-0 z-10 flex shrink-0 flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-card px-4 py-3 shadow-card">
              <div className="flex min-w-48 flex-1 flex-col gap-1.5">
                <span className="text-sm text-muted-foreground">
                  <b className="font-semibold text-foreground tabular-nums">{workspace.summary.ready.toLocaleString("en-IN")}</b> of{" "}
                  {workspace.summary.total.toLocaleString("en-IN")} rows ready to import
                </span>
                <span className="h-1.5 max-w-80 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <span className="block h-full rounded-full bg-success transition-[width] duration-500 ease-out" style={{ width: `${readyShare}%` }} />
                </span>
              </div>
              <Button type="button" onClick={() => void handleCommit()} disabled={!workspace.summary.ready || workspace.isCommitting}>
                {workspace.isCommitting ? <LoadingSpinner size="sm" /> : <UploadSimpleIcon size={15} />}
                {workspace.isCommitting ? "Importing…" : `Import ${workspace.summary.ready.toLocaleString("en-IN")} ${config.entityLabelPlural}`}
              </Button>
            </div>
          </div>
        </FullViewPortal>
      )}

      <ImportRowEditorModal
        row={activeRow}
        renderEditor={config.renderEditor}
        isSaving={workspace.savingTempId === activeRow?.tempId}
        error={workspace.rowActionError}
        onCancel={workspace.cancelEdit}
        onSave={(tempId, data) => void workspace.saveEdit(tempId, data)}
      />

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this import?</AlertDialogTitle>
            <AlertDialogDescription>Your row edits and removals in this file will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={discardAndRestart}>
              Discard and start over
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
