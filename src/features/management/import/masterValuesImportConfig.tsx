"use client";

import { useMemo } from "react";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { exportColumnTemplate } from "@/lib/export-excel";
import type {
  ImportPreviewColumn,
  ImportRowDraft,
  ImportWorkspaceConfig,
  RowEditorProps,
} from "@/components/shared/import-workspace";
import {
  masterValuesImportApi,
  type MasterImportPreviewRow,
  type MasterImportRowData,
} from "../services/masters-import.service";
import type { MasterValueCategory } from "../types/masters.types";

const TEMPLATE_HEADERS = ["Value", "Description"];

function toDraft(row: MasterImportPreviewRow): ImportRowDraft<MasterImportRowData> {
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

const PREVIEW_COLUMNS: ImportPreviewColumn<MasterImportRowData>[] = [
  { key: "value", label: "Value", width: 240, getValue: (row) => row.data.value },
  { key: "description", label: "Description", width: 300, getValue: (row) => row.data.description },
];

function MasterValueImportRowEditor({ data, onChange, errors }: RowEditorProps<MasterImportRowData>) {
  return (
    <div className="space-y-3">
      {errors.length ? (
        <ul className="list-inside list-disc rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
          {errors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      ) : null}
      <FormField label="Value" required>
        <Input value={data.value} onChange={(event) => onChange({ ...data, value: event.target.value })} />
      </FormField>
      <FormField label="Description">
        <Textarea value={data.description} onChange={(event) => onChange({ ...data, description: event.target.value })} rows={3} />
      </FormField>
    </div>
  );
}

export function useMasterValuesImportConfig(category: MasterValueCategory): ImportWorkspaceConfig<MasterImportRowData> {
  return useMemo<ImportWorkspaceConfig<MasterImportRowData>>(
    () => ({
      module: "master-values",
      title: `Import ${category}`,
      description: `Upload an Excel file to bulk import values for ${category}. Rejected rows can be fixed right here.`,
      entityLabelPlural: "Values",
      onDownloadTemplate: () => void exportColumnTemplate(`${category.replace(/\s+/g, "_")}_template.xlsx`, TEMPLATE_HEADERS),
      columns: PREVIEW_COLUMNS,
      renderEditor: (props) => <MasterValueImportRowEditor {...props} />,

      async preview(file) {
        const result = await masterValuesImportApi.preview(file, category);
        return { rows: [...result.validRows, ...result.invalidRows].map(toDraft) };
      },

      async validateRow(row) {
        const { error } = await masterValuesImportApi.validateRow(row.data, category);
        return {
          data: row.data,
          status: error ? "invalid" : "valid",
          errors: error ? [{ message: error }] : [],
          warnings: [],
        };
      },

      async commit(rows) {
        const result = await masterValuesImportApi.confirm(
          rows.map((row) => ({ rowNumber: row.rowNumber, ...row.data })),
          category,
        );
        return { imported: result.imported, failed: result.failed };
      },
    }),
    [category],
  );
}
