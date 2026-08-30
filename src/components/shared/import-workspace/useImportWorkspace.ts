"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommitResult, ImportRowDraft, ImportSummary, ImportWorkspaceConfig } from "./types";

export type ImportWorkspaceView = "upload" | "preview";
export type ImportPreviewFilter = "all" | "ready" | "rejected";

/**
 * Owns all draft state for one import session: the parsed rows, per-row
 * edit/remove/commit lifecycle, and the derived summary/filter views the
 * shell renders. Module-agnostic - every read/write of `TData` happens
 * through the adapter config passed in, never assumed here.
 */
export function useImportWorkspace<TData>(config: ImportWorkspaceConfig<TData>) {
  const [view, setView] = useState<ImportWorkspaceView>("upload");
  const [fileName, setFileName] = useState("");
  const [batchId, setBatchId] = useState<string | undefined>(undefined);
  const [rows, setRows] = useState<ImportRowDraft<TData>[]>([]);
  const [filter, setFilter] = useState<ImportPreviewFilter>("all");
  const [editingTempId, setEditingTempId] = useState<string | null>(null);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [rowActionError, setRowActionError] = useState("");
  const [savingTempId, setSavingTempId] = useState<string | null>(null);
  const [removingTempId, setRemovingTempId] = useState<string | null>(null);

  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState("");
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null);

  async function loadPreview(file: File) {
    setPreviewError("");
    setIsPreviewing(true);
    try {
      const result = await config.preview(file);
      setBatchId(result.batchId);
      setRows(result.rows);
      setFileName(file.name);
      setFilter("all");
      setCommitResult(null);
      setCommitError("");
      setView("preview");
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Unable to preview import file");
    } finally {
      setIsPreviewing(false);
    }
  }

  function backToUpload() {
    setView("upload");
    setRows([]);
    setBatchId(undefined);
    setFileName("");
    setPreviewError("");
    setCommitError("");
    setCommitResult(null);
    setEditingTempId(null);
  }

  const editingRow = useMemo(
    () => rows.find((row) => row.tempId === editingTempId) ?? null,
    [rows, editingTempId],
  );

  function startEdit(tempId: string) {
    setRowActionError("");
    setEditingTempId(tempId);
  }

  function cancelEdit() {
    setEditingTempId(null);
  }

  async function saveEdit(tempId: string, data: TData) {
    const target = rows.find((row) => row.tempId === tempId);
    if (!target) return;

    setRowActionError("");
    setSavingTempId(tempId);
    try {
      const result = await config.validateRow({ ...target, data }, batchId);
      setRows((current) =>
        current.map((row) =>
          row.tempId === tempId
            ? {
                ...row,
                data: result.data,
                status: result.status,
                errors: result.errors,
                warnings: result.warnings,
                isEdited: true,
                commitError: undefined,
              }
            : row,
        ),
      );
      setEditingTempId(null);
    } catch (error) {
      setRowActionError(error instanceof Error ? error.message : "Unable to validate this row");
    } finally {
      setSavingTempId(null);
    }
  }

  async function toggleRemove(tempId: string, removed: boolean) {
    const target = rows.find((row) => row.tempId === tempId);
    if (!target) return;

    setRowActionError("");
    setRemovingTempId(tempId);
    try {
      if (config.removeRow) await config.removeRow(target, removed, batchId);
      setRows((current) =>
        current.map((row) => (row.tempId === tempId ? { ...row, isRemoved: removed } : row)),
      );
    } catch (error) {
      setRowActionError(error instanceof Error ? error.message : "Unable to update this row");
    } finally {
      setRemovingTempId(null);
    }
  }

  // Convenience for the compact "N removed · Undo" notice - restores every
  // currently-removed row by calling the exact same per-row toggleRemove()
  // already used by each row's own Undo button, just looped. No new
  // remove/undo semantics: same adapter call, same state update, per row.
  async function undoAllRemoved() {
    const removedTempIds = rows.filter((row) => row.isRemoved).map((row) => row.tempId);
    for (const tempId of removedTempIds) {
      await toggleRemove(tempId, false);
    }
  }

  async function commit() {
    const submittable = rows.filter((row) => !row.isRemoved && !row.isImported);
    if (!submittable.length) return;

    setCommitError("");
    setIsCommitting(true);
    try {
      const result = await config.commit(submittable, batchId);
      setRows((current) =>
        current.map((row) => {
          if (row.isRemoved || row.isImported) return row;
          const failure = result.failed.find((entry) => entry.tempId === row.tempId);
          if (failure) return { ...row, commitError: failure.message };
          const wasSubmitted = submittable.some((entry) => entry.tempId === row.tempId);
          return wasSubmitted ? { ...row, isImported: true, commitError: undefined } : row;
        }),
      );
      setCommitResult(result);
    } catch (error) {
      setCommitError(error instanceof Error ? error.message : "Unable to import these rows");
    } finally {
      setIsCommitting(false);
    }
  }

  const summary: ImportSummary = useMemo(() => {
    const active = rows.filter((row) => !row.isRemoved && !row.isImported);
    return {
      total: rows.length,
      ready: active.filter((row) => row.status !== "invalid").length,
      rejected: active.filter((row) => row.status === "invalid").length,
      warnings: active.filter((row) => row.status === "warning").length,
      removed: rows.filter((row) => row.isRemoved).length,
    };
  }, [rows]);

  const importedCount = useMemo(() => rows.filter((row) => row.isImported).length, [rows]);

  const filteredRows = useMemo(() => {
    if (filter === "ready") return rows.filter((row) => !row.isRemoved && row.status !== "invalid");
    if (filter === "rejected") return rows.filter((row) => !row.isRemoved && row.status === "invalid");
    return rows;
  }, [rows, filter]);

  // Drives the "don't lose my edits" confirmation - true while there is any
  // local work (an edit, a removal, or a still-rejected row) that hasn't
  // already been committed. Never true once every non-removed row is imported.
  const hasUnsavedWork = useMemo(
    () => rows.some((row) => !row.isImported && (row.isEdited || row.isRemoved || row.status === "invalid")),
    [rows],
  );

  useEffect(() => {
    if (view !== "preview" || !hasUnsavedWork) return undefined;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [view, hasUnsavedWork]);

  return {
    view,
    fileName,
    batchId,
    rows,
    filteredRows,
    filter,
    setFilter,
    summary,
    importedCount,
    hasUnsavedWork,
    isPreviewing,
    previewError,
    loadPreview,
    backToUpload,
    editingRow,
    editingTempId,
    startEdit,
    cancelEdit,
    saveEdit,
    savingTempId,
    toggleRemove,
    undoAllRemoved,
    removingTempId,
    rowActionError,
    isCommitting,
    commitError,
    commitResult,
    commit,
  };
}

export type ImportWorkspaceState<TData> = ReturnType<typeof useImportWorkspace<TData>>;
