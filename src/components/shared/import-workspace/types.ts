import type { ReactNode } from "react";

/**
 * Generic, module-independent row/error model for the import workspace.
 * Every adapter config (customers, materials, payments, ...) plugs its own
 * `TData` shape in here - the shell components never know what a row
 * actually contains, only this envelope around it.
 */
export type ImportRowStatus = "valid" | "warning" | "invalid";

export type ImportFieldError = { field?: string; code?: string; message: string };

export type ImportRowDraft<TData> = {
  /** Stable id the workspace tracks by - a real DB row id for persisted-batch
   * modules (Customers), or the stringified spreadsheet row number for
   * stateless modules (nothing to key by until commit). */
  tempId: string;
  rowNumber: number;
  data: TData;
  status: ImportRowStatus;
  errors: ImportFieldError[];
  warnings: ImportFieldError[];
  isEdited: boolean;
  /** Excluded from commit; never touches a DB record. */
  isRemoved: boolean;
  /** Set locally once this row succeeded in a commit call - keeps a partial
   * commit's succeeded rows visibly done without discarding the rest of the
   * draft (client requirement: never re-upload just because some rows failed). */
  isImported?: boolean;
  /** Message from the most recent commit attempt, if this specific row failed. */
  commitError?: string;
};

export type ImportSummary = {
  total: number;
  ready: number;
  rejected: number;
  warnings: number;
  removed: number;
};

export type ImportPreviewColumn<TData> = {
  key: string;
  label: string;
  width?: number;
  getValue: (row: ImportRowDraft<TData>) => string | number | boolean | null | undefined;
  render?: (row: ImportRowDraft<TData>) => ReactNode;
};

export type RowValidationResult<TData> = Pick<ImportRowDraft<TData>, "status" | "errors" | "warnings" | "data">;

export type RowEditorProps<TData> = {
  data: TData;
  onChange: (data: TData) => void;
  errors: ImportFieldError[];
};

export type CommitResult = {
  imported: number;
  failed: { tempId: string; message: string }[];
};

export type ImportPreviewOutcome<TData> = {
  /** Present only for modules that persist the draft server-side (Customers). */
  batchId?: string;
  rows: ImportRowDraft<TData>[];
};

export type ImportWorkspaceConfig<TData> = {
  module: string;
  title: string;
  description?: ReactNode;
  entityLabelPlural: string;
  /** Omit to hide the Download Template button entirely. */
  onDownloadTemplate?: () => void;
  columns: ImportPreviewColumn<TData>[];
  renderEditor: (props: RowEditorProps<TData>) => ReactNode;
  preview: (file: File) => Promise<ImportPreviewOutcome<TData>>;
  /** Re-runs the same authoritative checks `preview` used, against one edited
   * row - never requires reprocessing the whole file for a single edit. */
  validateRow: (row: ImportRowDraft<TData>, batchId?: string) => Promise<RowValidationResult<TData>>;
  /** Toggles a row out of (removed=true) / back into (removed=false) the
   * commit set. Omit entirely for modules with nothing to persist per-row
   * removal against - the shell still tracks `isRemoved` locally either way. */
  removeRow?: (row: ImportRowDraft<TData>, removed: boolean, batchId?: string) => Promise<void>;
  /** Commits exactly the rows passed (already filtered to !isRemoved &&
   * !isImported by the shell) and returns a per-row result - a row-level
   * failure must never silently discard the rest of the draft. */
  commit: (rows: ImportRowDraft<TData>[], batchId?: string) => Promise<CommitResult>;
};
