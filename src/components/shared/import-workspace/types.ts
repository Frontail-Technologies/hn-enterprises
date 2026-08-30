import type { ReactNode } from "react";

export type ImportRowStatus = "valid" | "warning" | "invalid";

export type ImportFieldError = { field?: string; code?: string; message: string };

export type ImportRowDraft<TData> = {
  tempId: string;
  rowNumber: number;
  data: TData;
  status: ImportRowStatus;
  errors: ImportFieldError[];
  warnings: ImportFieldError[];
  isEdited: boolean;
  isRemoved: boolean;
  isImported?: boolean;
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
  batchId?: string;
  rows: ImportRowDraft<TData>[];
};

export type ImportWorkspaceConfig<TData> = {
  module: string;
  title: string;
  description?: ReactNode;
  entityLabelPlural: string;
  onDownloadTemplate?: () => void;
  columns: ImportPreviewColumn<TData>[];
  renderEditor: (props: RowEditorProps<TData>) => ReactNode;
  preview: (file: File) => Promise<ImportPreviewOutcome<TData>>;
  validateRow: (row: ImportRowDraft<TData>, batchId?: string) => Promise<RowValidationResult<TData>>;
  removeRow?: (row: ImportRowDraft<TData>, removed: boolean, batchId?: string) => Promise<void>;
  commit: (rows: ImportRowDraft<TData>[], batchId?: string) => Promise<CommitResult>;
};
