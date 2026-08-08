import { apiRequest } from "@/lib/api-client";
import type { CustomFieldImportRow } from "../types";
import { ACCESS_TO_FRONTEND, VALUE_TYPE_TO_FRONTEND } from "./dynamic-fields.service";

type BackendValueType = "text" | "number" | "date" | "amount" | "yes_no" | "dropdown";
type BackendAccess = "admin_only" | "supervisor_view" | "supervisor_edit";

type BackendImportRow = {
  rowNumber: number;
  label: string;
  groupName: string;
  valueType: BackendValueType;
  dropdownOptions: string[];
  required: boolean;
  supervisorAccess: BackendAccess;
  sortOrder?: number;
  issues: string[];
  warnings: string[];
};

export type ImportPreviewResult = {
  fileName: string;
  rows: CustomFieldImportRow[];
  totals: { total: number; valid: number; warning: number; error: number };
};

export type ImportConfirmResult = {
  created: number;
  skipped: number;
};

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
  const VALUE_TYPE_TO_BACKEND: Record<string, BackendValueType> = {
    Text: "text",
    Number: "number",
    Date: "date",
    Amount: "amount",
    "Yes / No": "yes_no",
    Dropdown: "dropdown",
  };
  const ACCESS_TO_BACKEND: Record<string, BackendAccess> = {
    "Admin Only": "admin_only",
    "Supervisor Can View": "supervisor_view",
    "Supervisor Can View & Edit": "supervisor_edit",
  };

  return {
    rowNumber: row.rowNumber,
    label: row.label,
    groupName: row.groupName,
    valueType: VALUE_TYPE_TO_BACKEND[row.valueType] ?? "text",
    dropdownOptions: row.dropdownOptions,
    required: row.required,
    supervisorAccess: ACCESS_TO_BACKEND[row.supervisorAccess] ?? "admin_only",
    sortOrder: row.sortOrder,
    issues: row.issues,
    warnings: row.warnings,
  };
}

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

  async confirm(rows: CustomFieldImportRow[]): Promise<ImportConfirmResult> {
    return apiRequest<ImportConfirmResult>("/masters/custom-fields/import/confirm", {
      method: "POST",
      body: JSON.stringify({ rows: rows.map(toBackendRow) }),
    });
  },
};
