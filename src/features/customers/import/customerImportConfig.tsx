"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { useDynamicFieldsQuery } from "@/features/dynamic-fields/hooks/useDynamicFields";
import { exportColumnTemplate } from "@/lib/export-excel";
import type {
  ImportFieldError,
  ImportPreviewColumn,
  ImportRowDraft,
  ImportWorkspaceConfig,
  RowEditorProps,
  RowValidationResult,
} from "@/components/shared/import-workspace";
import { buildCustomerMasterSheetColumns } from "../services/customers.service";
import {
  getRowStatus,
  masterImportApi,
  type NormalizedImportRow,
} from "../services/master-import.service";

export type CustomerImportRowData = Omit<NormalizedImportRow, "id" | "issues" | "warnings" | "isRemoved" | "rowNumber">;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- rest-destructure is the omit
function toRowData({ id, issues, warnings, isRemoved, rowNumber, ...data }: NormalizedImportRow): CustomerImportRowData {
  return data;
}

function toFieldErrors(messages: string[]): ImportFieldError[] {
  return messages.map((message) => ({ message }));
}

function toDraft(row: NormalizedImportRow): ImportRowDraft<CustomerImportRowData> {
  return {
    tempId: row.id,
    rowNumber: row.rowNumber,
    data: toRowData(row),
    status: getRowStatus(row),
    errors: toFieldErrors(row.issues),
    warnings: toFieldErrors(row.warnings),
    isEdited: false,
    isRemoved: row.isRemoved,
  };
}

const PREVIEW_COLUMNS: ImportPreviewColumn<CustomerImportRowData>[] = [
  { key: "projectName", label: "Project", width: 170, getValue: (row) => row.data.projectName },
  { key: "siteName", label: "Site / Area", width: 160, getValue: (row) => row.data.siteName },
  { key: "customerName", label: "Customer Name", width: 180, getValue: (row) => row.data.customerName },
  { key: "trBpNumber", label: "TR/BP No.", width: 140, getValue: (row) => row.data.trBpNumber },
  { key: "mobileNumber", label: "Mobile No.", width: 130, getValue: (row) => row.data.mobileNumber },
  { key: "connectionType", label: "Connection Type", width: 150, getValue: (row) => row.data.connectionType },
];

function TextField({
  label,
  field,
  data,
  onChange,
  required,
}: {
  label: string;
  field: keyof CustomerImportRowData;
  data: CustomerImportRowData;
  onChange: (data: CustomerImportRowData) => void;
  required?: boolean;
}) {
  const value = data[field];
  return (
    <FormField label={label} required={required}>
      <Input
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange({ ...data, [field]: event.target.value })}
      />
    </FormField>
  );
}

function CustomerImportRowEditor({ data, onChange, errors }: RowEditorProps<CustomerImportRowData>) {
  return (
    <div className="space-y-3">
      {errors.length ? (
        <ul className="list-inside list-disc rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
          {errors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Project" field="projectName" data={data} onChange={onChange} required />
        <TextField label="Project Code" field="projectCode" data={data} onChange={onChange} />
        <TextField label="City" field="city" data={data} onChange={onChange} />
        <TextField label="Site / Area" field="siteName" data={data} onChange={onChange} required />
        <TextField label="Site Code" field="siteCode" data={data} onChange={onChange} />
        <TextField label="Customer Name" field="customerName" data={data} onChange={onChange} required />
        <TextField label="TR/BP Number" field="trBpNumber" data={data} onChange={onChange} required />
        <TextField label="Mobile Number" field="mobileNumber" data={data} onChange={onChange} />
        <TextField label="Address" field="fullAddress" data={data} onChange={onChange} />
        <TextField label="Connection Type" field="connectionType" data={data} onChange={onChange} />
        <TextField label="House Type" field="houseType" data={data} onChange={onChange} />
        <TextField label="Scheme" field="scheme" data={data} onChange={onChange} />
        <TextField label="Plumber" field="plumberName" data={data} onChange={onChange} />
        <TextField label="Supervisor" field="supervisorName" data={data} onChange={onChange} />
        <TextField label="Customer Status" field="customerStatus" data={data} onChange={onChange} />
        <TextField label="Report No. - GI" field="giReportNumber" data={data} onChange={onChange} />
        <TextField label="Report No. - GC" field="gcReportNumber" data={data} onChange={onChange} />
        <TextField label="Report No. - Conversion" field="conversionReportNumber" data={data} onChange={onChange} />
      </div>
    </div>
  );
}

export function useCustomerImportConfig(): ImportWorkspaceConfig<CustomerImportRowData> {
  const { data: activeCustomFields = [] } = useDynamicFieldsQuery("Active");

  return useMemo<ImportWorkspaceConfig<CustomerImportRowData>>(() => {
    const masterColumns = buildCustomerMasterSheetColumns(activeCustomFields);

    return {
      module: "customers",
      title: "Import Customers",
      description: "Upload a customer master sheet. Rejected rows can be fixed and revalidated right here - no need to re-upload the file.",
      entityLabelPlural: "Customers",
      onDownloadTemplate: () => {
        void exportColumnTemplate(
          "customer-import-template.xlsx",
          masterColumns.map((column) => column.label),
        );
      },
      columns: PREVIEW_COLUMNS,
      renderEditor: (props) => <CustomerImportRowEditor {...props} />,

      async preview(file) {
        const result = await masterImportApi.preview(file);
        return { batchId: result.batchId, rows: result.rows.map(toDraft) };
      },

      async validateRow(row, batchId): Promise<RowValidationResult<CustomerImportRowData>> {
        if (!batchId) throw new Error("Missing import batch");
        const updated = await masterImportApi.editRow(batchId, row.tempId, row.data);
        return {
          data: toRowData(updated),
          status: getRowStatus(updated),
          errors: toFieldErrors(updated.issues),
          warnings: toFieldErrors(updated.warnings),
        };
      },

      async removeRow(row, removed, batchId) {
        if (!batchId) throw new Error("Missing import batch");
        await masterImportApi.setRowRemoved(batchId, row.tempId, removed);
      },

      async commit(_rows, batchId) {
        if (!batchId) throw new Error("Missing import batch");
        const result = await masterImportApi.confirm(batchId);
        return { imported: result.imported, failed: result.failed };
      },
    };
  }, [activeCustomFields]);
}
