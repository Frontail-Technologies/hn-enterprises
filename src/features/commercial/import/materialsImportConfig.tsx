"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { exportColumnTemplate } from "@/lib/export-excel";
import type {
  ImportPreviewColumn,
  ImportRowDraft,
  ImportWorkspaceConfig,
  RowEditorProps,
} from "@/components/shared/import-workspace";
import {
  materialsImportApi,
  type MaterialImportRow,
  type MaterialImportRowData,
} from "../services/materials-import.service";

const TEMPLATE_HEADERS = ["Name", "Category", "Unit", "Reorder Level"];

function toDraft(row: MaterialImportRow): ImportRowDraft<MaterialImportRowData> {
  const { rowNumber, error, ...data } = row;
  return {
    tempId: String(rowNumber),
    rowNumber,
    data,
    status: error ? "invalid" : "valid",
    errors: error ? [{ message: error }] : [],
    warnings: [],
    isEdited: false,
    isRemoved: false,
  };
}

const PREVIEW_COLUMNS: ImportPreviewColumn<MaterialImportRowData>[] = [
  { key: "name", label: "Name", width: 200, getValue: (row) => row.data.name },
  { key: "category", label: "Category", width: 160, getValue: (row) => row.data.category },
  { key: "unit", label: "Unit", width: 100, getValue: (row) => row.data.unit },
  { key: "reorderLevel", label: "Reorder Level", width: 130, getValue: (row) => row.data.reorderLevel },
];

function MaterialImportRowEditor({ data, onChange, errors }: RowEditorProps<MaterialImportRowData>) {
  return (
    <div className="space-y-3">
      {errors.length ? (
        <ul className="list-inside list-disc rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
          {errors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      ) : null}
      <FormField label="Name" required>
        <Input value={data.name} onChange={(event) => onChange({ ...data, name: event.target.value })} />
      </FormField>
      <FormField label="Category">
        <Input value={data.category} onChange={(event) => onChange({ ...data, category: event.target.value })} />
      </FormField>
      <FormField label="Unit" required>
        <Input value={data.unit} onChange={(event) => onChange({ ...data, unit: event.target.value })} />
      </FormField>
      <FormField label="Reorder Level">
        <Input
          type="number"
          value={data.reorderLevel}
          onChange={(event) => onChange({ ...data, reorderLevel: Number(event.target.value) || 0 })}
        />
      </FormField>
    </div>
  );
}

export function useMaterialsImportConfig(): ImportWorkspaceConfig<MaterialImportRowData> {
  return useMemo<ImportWorkspaceConfig<MaterialImportRowData>>(
    () => ({
      module: "materials",
      title: "Import Materials",
      description: "Upload an Excel file to bulk import catalog items. Rejected rows can be fixed right here.",
      entityLabelPlural: "Materials",
      onDownloadTemplate: () => void exportColumnTemplate("materials_template.xlsx", TEMPLATE_HEADERS),
      columns: PREVIEW_COLUMNS,
      renderEditor: (props) => <MaterialImportRowEditor {...props} />,

      async preview(file) {
        const result = await materialsImportApi.preview(file);
        return { rows: [...result.validRows, ...result.invalidRows].map(toDraft) };
      },

      async validateRow(row) {
        const { error } = await materialsImportApi.validateRow(row.data);
        return {
          data: row.data,
          status: error ? "invalid" : "valid",
          errors: error ? [{ message: error }] : [],
          warnings: [],
        };
      },

      async commit(rows) {
        const result = await materialsImportApi.confirm(
          rows.map((row) => ({ rowNumber: row.rowNumber, ...row.data })),
        );
        return { imported: result.imported, failed: result.failed };
      },
    }),
    [],
  );
}
