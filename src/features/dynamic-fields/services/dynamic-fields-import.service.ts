import { apiRequest } from "@/lib/api-client";
import type { CustomFieldAccess, CustomFieldImportRow, CustomFieldValueType } from "../types";
import { ACCESS_TO_FRONTEND, VALUE_TYPE_TO_FRONTEND } from "./dynamic-fields.service";

type BackendValueType = "text" | "number" | "date" | "amount" | "yes_no" | "dropdown";
type BackendAccess = "admin_only" | "supervisor_view" | "supervisor_edit";

export type CustomFieldEditableData = {
  label: string;
  groupName: string;
  valueType: CustomFieldValueType;
  dropdownOptions: string[];
  required: boolean;
  supervisorAccess: CustomFieldAccess;
  sortOrder?: number;
};

type BackendEditableData = {
  label: string;
  groupName: string;
  valueType: BackendValueType;
  dropdownOptions: string[];
  required: boolean;
  supervisorAccess: BackendAccess;
  sortOrder?: number;
};

type BackendImportRow = BackendEditableData & {
  rowNumber: number;
  issues: string[];
  warnings: string[];
};

export const VALUE_TYPE_TO_BACKEND: Record<CustomFieldValueType, BackendValueType> = {
  Text: "text",
  Number: "number",
  Date: "date",
  Amount: "amount",
  "Yes / No": "yes_no",
  Dropdown: "dropdown",
};

export const ACCESS_TO_BACKEND: Record<CustomFieldAccess, BackendAccess> = {
  "Admin Only": "admin_only",
  "Supervisor Can View": "supervisor_view",
  "Supervisor Can View & Edit": "supervisor_edit",
};

function toBackendData(data: CustomFieldEditableData): BackendEditableData {
  return {
    label: data.label,
    groupName: data.groupName,
    valueType: VALUE_TYPE_TO_BACKEND[data.valueType] ?? "text",
    dropdownOptions: data.dropdownOptions,
    required: data.required,
    supervisorAccess: ACCESS_TO_BACKEND[data.supervisorAccess] ?? "admin_only",
    sortOrder: data.sortOrder,
  };
}

function mapRow(row: BackendImportRow): CustomFieldImportRow {
  return {
    rowNumber: row.rowNumber,
    label: row.label,
    groupName: row.groupName,
    valueType: VALUE_TYPE_TO_FRONTEND[row.valueType] ?? "Text",
    dropdownOptions: row.dropdownOptions,
    required: row.required,
    supervisorAccess: ACCESS_TO_FRONTEND[row.supervisorAccess] ?? "Admin Only",
    sortOrder: row.sortOrder,
    issues: row.issues,
    warnings: row.warnings,
  };
}

function toBackendRow(row: CustomFieldImportRow): BackendImportRow {
  return { ...toBackendData(row), rowNumber: row.rowNumber, issues: row.issues, warnings: row.warnings };
}

export type ImportPreviewResult = {
  fileName: string;
  rows: CustomFieldImportRow[];
  totals: { total: number; valid: number; warning: number; error: number };
};

export type ImportConfirmResult = {
  created: number;
  skipped: number;
  imported: number;
  failed: { tempId: string; message: string }[];
};

export const dynamicFieldsImportApi = {
  async preview(file: File): Promise<ImportPreviewResult> {
    const formData = new FormData();
    formData.append("file", file);
    const result = await apiRequest<{ fileName: string; rows: BackendImportRow[]; totals: ImportPreviewResult["totals"] }>(
      "/masters/custom-fields/import/preview",
      { method: "POST", body: formData },
    );
    return { ...result, rows: result.rows.map(mapRow) };
  },

  async validateRow(data: CustomFieldEditableData): Promise<{ issues: string[]; warnings: string[] }> {
    return apiRequest<{ issues: string[]; warnings: string[] }>("/masters/custom-fields/import/validate-row", {
      method: "POST",
      body: JSON.stringify({ data: toBackendData(data) }),
    });
  },

  async confirm(rows: CustomFieldImportRow[]): Promise<ImportConfirmResult> {
    return apiRequest<ImportConfirmResult>("/masters/custom-fields/import/confirm", {
      method: "POST",
      body: JSON.stringify({ rows: rows.map(toBackendRow) }),
    });
  },
};
