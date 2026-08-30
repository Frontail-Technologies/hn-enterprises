"use client";

import { useMemo } from "react";
import { FormField } from "@/components/shared/FormField";
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
  plumbersImportApi,
  type PlumberImportRow,
  type PlumberImportRowData,
} from "../services/plumbers-import.service";

const TEMPLATE_HEADERS = ["Name", "Type", "Contact Number", "Remarks"];

function toDraft(row: PlumberImportRow): ImportRowDraft<PlumberImportRowData> {
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

const PREVIEW_COLUMNS: ImportPreviewColumn<PlumberImportRowData>[] = [
  { key: "name", label: "Name", width: 200, getValue: (row) => row.data.name },
  { key: "type", label: "Type", width: 120, getValue: (row) => row.data.type },
  { key: "contactNumber", label: "Contact Number", width: 150, getValue: (row) => row.data.contactNumber },
];

function PlumberImportRowEditor({ data, onChange, errors }: RowEditorProps<PlumberImportRowData>) {
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
      <FormField label="Type">
        <Select value={data.type === "team" ? "team" : "individual"} onValueChange={(type) => onChange({ ...data, type: type ?? "individual" })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Contact Number">
        <Input value={data.contactNumber} onChange={(event) => onChange({ ...data, contactNumber: event.target.value })} />
      </FormField>
      <FormField label="Remarks">
        <Textarea value={data.remarks} onChange={(event) => onChange({ ...data, remarks: event.target.value })} rows={2} />
      </FormField>
    </div>
  );
}

export function usePlumbersImportConfig(): ImportWorkspaceConfig<PlumberImportRowData> {
  return useMemo<ImportWorkspaceConfig<PlumberImportRowData>>(
    () => ({
      module: "plumbers",
      title: "Import Plumbers",
      description: "Upload an Excel file to bulk import plumbers. Rejected rows can be fixed right here.",
      entityLabelPlural: "Plumbers",
      onDownloadTemplate: () => void exportColumnTemplate("plumbers_template.xlsx", TEMPLATE_HEADERS),
      columns: PREVIEW_COLUMNS,
      renderEditor: (props) => <PlumberImportRowEditor {...props} />,

      async preview(file) {
        const result = await plumbersImportApi.preview(file);
        return { rows: [...result.validRows, ...result.invalidRows].map(toDraft) };
      },

      async validateRow(row) {
        const { error } = await plumbersImportApi.validateRow(row.data);
        return {
          data: row.data,
          status: error ? "invalid" : "valid",
          errors: error ? [{ message: error }] : [],
          warnings: [],
        };
      },

      async commit(rows) {
        const result = await plumbersImportApi.confirm(rows.map((row) => ({ rowNumber: row.rowNumber, ...row.data })));
        return { imported: result.imported, failed: result.failed };
      },
    }),
    [],
  );
}
