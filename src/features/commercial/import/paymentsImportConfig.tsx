"use client";

import { useMemo } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMasterValuesQuery } from "@/features/management/hooks/useMasters";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { exportColumnTemplate } from "@/lib/export-excel";
import type {
  ImportPreviewColumn,
  ImportRowDraft,
  ImportWorkspaceConfig,
  RowEditorProps,
} from "@/components/shared/import-workspace";
import { paymentTabs } from "../data/payments.data";
import {
  paymentsImportApi,
  type PaymentImportRow,
  type PaymentImportRowData,
} from "../services/payments-import.service";

const TEMPLATE_HEADERS = ["Category", "Paid To", "Plumber Name", "Amount", "Payment Date", "Mode", "Purpose", "Remarks", "Address"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

function toDraft(row: PaymentImportRow): ImportRowDraft<PaymentImportRowData> {
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

const PREVIEW_COLUMNS: ImportPreviewColumn<PaymentImportRowData>[] = [
  { key: "category", label: "Category", width: 170, getValue: (row) => row.data.category },
  { key: "paidTo", label: "Paid To", width: 150, getValue: (row) => row.data.paidTo },
  { key: "amount", label: "Amount", width: 100, getValue: (row) => row.data.amount },
  { key: "paymentDate", label: "Date", width: 120, getValue: (row) => row.data.paymentDate },
  { key: "mode", label: "Mode", width: 110, getValue: (row) => row.data.mode },
];

function PaymentImportRowEditor({ data, onChange, errors }: RowEditorProps<PaymentImportRowData>) {
  const { data: paymentModes = [] } = useMasterValuesQuery("Payment Types");
  const { data: plumbers = [] } = usePlumbersQuery();
  const isPlumberCategory = data.category === "Plumber Payments";

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
        <FormField label="Category" required>
          <Select value={data.category || undefined} onValueChange={(category) => onChange({ ...data, category: category ?? "" })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {paymentTabs.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Amount" required>
          <Input value={data.amount} onChange={(event) => onChange({ ...data, amount: event.target.value })} />
        </FormField>
        <FormField label="Paid To">
          <Input value={data.paidTo} onChange={(event) => onChange({ ...data, paidTo: event.target.value })} />
        </FormField>
        {isPlumberCategory ? (
          <FormField label="Plumber">
            <SearchableSelect
              value={plumbers.find((p) => p.name === data.plumberName)?.id ?? undefined}
              onValueChange={(plumberId) => {
                const plumber = plumbers.find((p) => p.id === plumberId);
                onChange({ ...data, plumberName: plumber?.name ?? "" });
              }}
              placeholder="Select plumber"
              options={plumbers.map((plumber) => ({ value: plumber.id, label: plumber.name }))}
              className="w-full"
            />
          </FormField>
        ) : null}
        <FormField label="Payment Date" required>
          <DatePicker
            value={ISO_DATE.test(data.paymentDate) ? data.paymentDate : undefined}
            onChange={(value) => onChange({ ...data, paymentDate: value })}
          />
        </FormField>
        <FormField label="Mode" required>
          <Select value={data.mode || undefined} onValueChange={(mode) => onChange({ ...data, mode: mode ?? "" })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {paymentModes.map((mode) => (
                <SelectItem key={mode.id} value={mode.value}>{mode.value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Purpose">
          <Input value={data.purpose} onChange={(event) => onChange({ ...data, purpose: event.target.value })} />
        </FormField>
        <FormField label="Address">
          <Input value={data.address} onChange={(event) => onChange({ ...data, address: event.target.value })} />
        </FormField>
      </div>
      <FormField label="Remarks">
        <Textarea value={data.remarks} onChange={(event) => onChange({ ...data, remarks: event.target.value })} rows={2} />
      </FormField>
    </div>
  );
}

export function usePaymentsImportConfig(): ImportWorkspaceConfig<PaymentImportRowData> {
  return useMemo<ImportWorkspaceConfig<PaymentImportRowData>>(
    () => ({
      module: "payments",
      title: "Import Payments",
      description: "Upload an Excel file to bulk import payment/expense records. Rejected rows can be fixed right here.",
      entityLabelPlural: "Payments",
      onDownloadTemplate: () => void exportColumnTemplate("payments_template.xlsx", TEMPLATE_HEADERS),
      columns: PREVIEW_COLUMNS,
      renderEditor: (props) => <PaymentImportRowEditor {...props} />,

      async preview(file) {
        const result = await paymentsImportApi.preview(file);
        return { rows: [...result.validRows, ...result.invalidRows].map(toDraft) };
      },

      async validateRow(row) {
        const { error } = await paymentsImportApi.validateRow(row.data);
        return {
          data: row.data,
          status: error ? "invalid" : "valid",
          errors: error ? [{ message: error }] : [],
          warnings: [],
        };
      },

      async commit(rows) {
        const result = await paymentsImportApi.confirm(rows.map((row) => ({ rowNumber: row.rowNumber, ...row.data })));
        return { imported: result.imported, failed: result.failed };
      },
    }),
    [],
  );
}
