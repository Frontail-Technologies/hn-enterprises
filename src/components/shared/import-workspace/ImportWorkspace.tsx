"use client";

import { useRef, useState } from "react";
import { ArrowLeftIcon, CaretRightIcon, CheckCircleIcon, DownloadSimpleIcon, FileCsvIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { FullViewPortal } from "@/components/shared/table/FullViewPortal";
import { FullViewToggleButton } from "@/components/shared/table/FullViewToggleButton";
import { cn } from "@/lib/utils";
import { ImportFilterTabs } from "./ImportFilterTabs";
import { ImportPreviewTable } from "./ImportPreviewTable";
import { ImportRowEditorModal } from "./ImportRowEditorModal";
import { ImportSummary } from "./ImportSummary";
import { useImportWorkspace } from "./useImportWorkspace";
import type { ImportWorkspaceConfig } from "./types";

const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

const VIEWPORT_HEIGHT_CLASS = "md:flex md:h-[calc(100dvh-4.5rem)] md:min-h-0 md:flex-col";

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

  const workspace = useImportWorkspace(config);
  const isPreview = workspace.view === "preview";
  const [fullView, setFullView] = useState(false);

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

  function handleBackToUpload() {
    if (workspace.hasUnsavedWork && !window.confirm("You have unsaved changes in this import. Discard them and start over?")) {
      return;
    }
    setSelectedFile(null);
    workspace.backToUpload();
  }

  const activeRow = workspace.rows.find((row) => row.tempId === workspace.editingTempId) ?? null;

  return (
    <div className={cn("flex flex-col gap-3", VIEWPORT_HEIGHT_CLASS)}>
      {/* Compact header: one back affordance beside the title (not a
          breadcrumb AND a "Back to X" button), filename as small secondary
          text under the title (not a standalone row), and only the
          secondary/low-priority actions here - the primary "Import" action
          lives in the sticky footer below so it doesn't compete with these. */}
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {backHref ? (
            <a
              href={backHref}
              aria-label={backLabel}
              title={backLabel}
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeftIcon size={17} />
            </a>
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold leading-tight tracking-tight text-foreground">
              {config.title}
            </h1>
            {isPreview && workspace.fileName ? (
              <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <FileCsvIcon size={12} className="shrink-0" />
                <span className="truncate">{workspace.fileName}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {config.onDownloadTemplate ? (
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "sm" })}
              onClick={config.onDownloadTemplate}
            >
              <DownloadSimpleIcon size={14} />
              Download Template
            </button>
          ) : null}
          {isPreview ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleBackToUpload}
              disabled={workspace.isCommitting}
            >
              Replace File
            </Button>
          ) : null}
        </div>
      </div>

      {!isPreview ? (
        <div className="space-y-4">
          {config.description ? <p className="text-sm text-muted-foreground">{config.description}</p> : null}
          <section className="rounded-lg border border-border/70 bg-card p-4">
            <div
              className={`flex min-h-[50vh] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 text-center transition-colors ${
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
              <p className="text-base font-semibold text-foreground">
                Drag &amp; drop your file or <span className="cursor-pointer underline">choose a file</span>
              </p>
              <p className="text-sm text-muted-foreground">
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
            {fileTypeError ? <p className="mt-2 text-sm text-destructive">{fileTypeError}</p> : null}
            {workspace.previewError ? <p className="mt-2 text-sm text-destructive">{workspace.previewError}</p> : null}
            <div className="mt-3 flex items-center justify-end">
              <Button
                type="button"
                disabled={!selectedFile || workspace.isPreviewing}
                onClick={() => selectedFile && void workspace.loadPreview(selectedFile)}
              >
                {workspace.isPreviewing ? <LoadingSpinner size="sm" /> : null}
                Next
                <CaretRightIcon size={15} />
              </Button>
            </div>
          </section>
        </div>
      ) : (
        <FullViewPortal active={fullView} onExit={() => setFullView(false)}>
          <div className={cn(fullView ? "flex min-h-0 flex-1 flex-col gap-3" : "contents")}>
            {workspace.commitResult ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-lg border border-status-success/30 bg-status-success-bg px-3 py-2 text-sm">
                <CheckCircleIcon size={17} className="text-status-success-fg" />
                <span className="font-medium text-status-success-fg">
                  {workspace.commitResult.imported} {config.entityLabelPlural.toLowerCase()} imported
                  {workspace.commitResult.failed.length ? ` · ${workspace.commitResult.failed.length} rows failed - fix and retry below` : ""}
                </span>
              </div>
            ) : null}
            {workspace.commitError ? <p className="shrink-0 text-sm text-destructive">{workspace.commitError}</p> : null}
            {workspace.rowActionError ? <p className="shrink-0 text-sm text-destructive">{workspace.rowActionError}</p> : null}

            {/* Filter tabs are the one primary summary (All/Ready/Rejected
                with counts) - no separate stats row duplicating the same
                numbers. Removed/already-imported, which the tabs don't
                cover, ride along on the same row only when there's
                something to say; the Full View toggle sits at the far end,
                matching where it stays after entering Full View too. */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
              <ImportFilterTabs active={workspace.filter} onChange={workspace.setFilter} summary={workspace.summary} />
              <div className="flex items-center gap-3">
                <ImportSummary
                  summary={workspace.summary}
                  importedCount={workspace.importedCount}
                  onUndoAllRemoved={() => void workspace.undoAllRemoved()}
                />
                <FullViewToggleButton active={fullView} onToggle={() => setFullView((current) => !current)} />
              </div>
            </div>

            <ImportPreviewTable
              columns={config.columns}
              rows={workspace.filteredRows}
              onEdit={workspace.startEdit}
              onToggleRemove={(tempId, removed) => void workspace.toggleRemove(tempId, removed)}
              removingTempId={workspace.removingTempId}
              fillHeight
            />

            {/* Sticky action area - stays reachable without scrolling back
                to the top, and never overlays the table (it's a normal
                flex/sticky sibling that reserves its own space, not a
                floating overlay). */}
            <div className="sticky bottom-0 z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
              <span className="text-sm text-muted-foreground">
                <b className="text-foreground">{workspace.summary.ready}</b> row{workspace.summary.ready === 1 ? "" : "s"} ready
              </span>
              <Button
                type="button"
                onClick={() => void workspace.commit()}
                disabled={!workspace.summary.ready || workspace.isCommitting}
              >
                {workspace.isCommitting ? <LoadingSpinner size="sm" /> : null}
                Import {workspace.summary.ready} {config.entityLabelPlural}
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
    </div>
  );
}
