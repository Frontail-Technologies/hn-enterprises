"use client";

import { useMemo } from "react";
import { FormField } from "@/components/shared/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { exportColumnTemplate } from "@/lib/export-excel";
import type {
  ImportPreviewColumn,
  ImportRowDraft,
  ImportWorkspaceConfig,
  RowEditorProps,
} from "@/components/shared/import-workspace";
import {
  dynamicFieldsImportApi,
  type CustomFieldEditableData,
} from "../services/dynamic-fields-import.service";
import type { CustomFieldAccess, CustomFieldImportRow, CustomFieldValueType } from "../types";

const TEMPLATE_HEADERS = ["Label", "Group", "Value Type", "Options", "Required", "Access", "Position"];
const VALUE_TYPES: CustomFieldValueType[] = ["Text", "Number", "Date", "Amount", "Yes / No", "Dropdown"];
const ACCESS_LEVELS: CustomFieldAccess[] = ["Admin Only", "Supervisor Can View", "Supervisor Can View & Edit"];

function toDraft(row: CustomFieldImportRow): ImportRowDraft<CustomFieldEditableData> {
  const { rowNumber, issues, warnings, ...data } = row;
  return {
    tempId: String(rowNumber),
    rowNumber,
    data,
    status: issues.length ? "invalid" : warnings.length ? "warning" : "valid",
    errors: issues.map((message) => ({ message })),
    warnings: warnings.map((message) => ({ message })),
    isEdited: false,
    isRemoved: false,
  };
}

function toBackendConfirmRow(row: ImportRowDraft<CustomFieldEditableData>): CustomFieldImportRow {
  return {
    rowNumber: row.rowNumber,
    ...row.data,
    issues: row.errors.map((error) => error.message),
    warnings: row.warnings.map((warning) => warning.message),
  };
}

const PREVIEW_COLUMNS: ImportPreviewColumn<CustomFieldEditableData>[] = [
  { key: "label", label: "Label", width: 200, getValue: (row) => row.data.label },
  { key: "groupName", label: "Group", width: 150, getValue: (row) => row.data.groupName },
  { key: "valueType", label: "Value Type", width: 120, getValue: (row) => row.data.valueType },
  {
    key: "dropdownOptions",
    label: "Options",
    width: 220,
    getValue: (row) => (row.data.valueType === "Dropdown" ? row.data.dropdownOptions.join(", ") : "-"),
  },
];

function CustomFieldImportRowEditor({ data, onChange, errors }: RowEditorProps<CustomFieldEditableData>) {
  return (
    <div className="space-y-3">
      {errors.length ? (
        <ul className="list-inside list-disc rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
          {errors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      ) : null}
      <FormField label="Label" required>
        <Input value={data.label} onChange={(event) => onChange({ ...data, label: event.target.value })} />
      </FormField>
      <FormField label="Group">
        <Input value={data.groupName} onChange={(event) => onChange({ ...data, groupName: event.target.value })} />
      </FormField>
      <FormField label="Value Type" required>
        <Select value={data.valueType} onValueChange={(valueType) => onChange({ ...data, valueType: (valueType as CustomFieldValueType) ?? "Text" })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VALUE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      {data.valueType === "Dropdown" ? (
        <FormField label="Options (comma separated)" required>
          <Textarea
            value={data.dropdownOptions.join(", ")}
            onChange={(event) =>
              onChange({
                ...data,
                dropdownOptions: event.target.value.split(",").map((option) => option.trim()).filter(Boolean),
              })
            }
            rows={2}
          />
        </FormField>
      ) : null}
      <FormField label="Access">
        <Select value={data.supervisorAccess} onValueChange={(access) => onChange({ ...data, supervisorAccess: (access as CustomFieldAccess) ?? "Admin Only" })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCESS_LEVELS.map((access) => (
              <SelectItem key={access} value={access}>{access}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <div className="flex items-center gap-2">
        <Checkbox checked={data.required} onCheckedChange={(checked) => onChange({ ...data, required: Boolean(checked) })} />
        <span className="text-sm text-foreground">Required</span>
      </div>
      <FormField label="Position">
        <Input
          type="number"
          value={data.sortOrder ?? ""}
          onChange={(event) => onChange({ ...data, sortOrder: event.target.value ? Number(event.target.value) : undefined })}
        />
      </FormField>
    </div>
  );
}

export function useCustomFieldDefsImportConfig(): ImportWorkspaceConfig<CustomFieldEditableData> {
  return useMemo<ImportWorkspaceConfig<CustomFieldEditableData>>(
    () => ({
      module: "custom-field-definitions",
      title: "Import Custom Fields",
      description: "Upload an Excel file to bulk import field definitions. Rejected rows can be fixed right here.",
      entityLabelPlural: "Fields",
      onDownloadTemplate: () => void exportColumnTemplate("dynamic-fields-import-template.xlsx", TEMPLATE_HEADERS),
      columns: PREVIEW_COLUMNS,
      renderEditor: (props) => <CustomFieldImportRowEditor {...props} />,

      async preview(file) {
        const result = await dynamicFieldsImportApi.preview(file);
        return { rows: result.rows.map(toDraft) };
      },

      async validateRow(row) {
        const { issues, warnings } = await dynamicFieldsImportApi.validateRow(row.data);
        return {
          data: row.data,
          status: issues.length ? "invalid" : warnings.length ? "warning" : "valid",
          errors: issues.map((message) => ({ message })),
          warnings: warnings.map((message) => ({ message })),
        };
      },

      async commit(rows) {
        const result = await dynamicFieldsImportApi.confirm(rows.map(toBackendConfirmRow));
        return { imported: result.imported, failed: result.failed };
      },
    }),
    [],
  );
}
