"use client";

import { useMemo } from "react";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportColumnTemplate } from "@/lib/export-excel";
import type {
  ImportPreviewColumn,
  ImportRowDraft,
  ImportWorkspaceConfig,
  RowEditorProps,
} from "@/components/shared/import-workspace";
import {
  usersImportApi,
  type UserImportPreviewRow,
  type UserImportRowData,
} from "../services/users-import.service";

const TEMPLATE_HEADERS = ["Name", "Username", "Email", "Mobile", "Role", "Password"];

// Matches the full allow-list the import backend actually validates against
// (users.import.service.ts's VALID_ROLES) - wider than the 2-role subset the
// Staff page's own quick-create drawer exposes for that narrower context.
const ROLE_OPTIONS = ["Super Admin", "Admin", "Supervisor", "Accountant", "Office Staff"];

function toDraft(row: UserImportPreviewRow): ImportRowDraft<UserImportRowData> {
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

const PREVIEW_COLUMNS: ImportPreviewColumn<UserImportRowData>[] = [
  { key: "name", label: "Name", width: 180, getValue: (row) => row.data.name },
  { key: "username", label: "Username", width: 150, getValue: (row) => row.data.username },
  { key: "email", label: "Email", width: 190, getValue: (row) => row.data.email },
  { key: "role", label: "Role", width: 140, getValue: (row) => row.data.role },
];

function UserImportRowEditor({ data, onChange, errors }: RowEditorProps<UserImportRowData>) {
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
      <FormField label="Username" required>
        <Input value={data.username} onChange={(event) => onChange({ ...data, username: event.target.value })} />
      </FormField>
      <FormField label="Email" required>
        <Input type="email" value={data.email} onChange={(event) => onChange({ ...data, email: event.target.value })} />
      </FormField>
      <FormField label="Mobile">
        <Input value={data.mobile} onChange={(event) => onChange({ ...data, mobile: event.target.value })} />
      </FormField>
      <FormField label="Role" required>
        <Select value={data.role || undefined} onValueChange={(role) => onChange({ ...data, role: role ?? "" })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Password" required>
        <Input type="text" value={data.password} onChange={(event) => onChange({ ...data, password: event.target.value })} />
      </FormField>
    </div>
  );
}

export function useUsersImportConfig(): ImportWorkspaceConfig<UserImportRowData> {
  return useMemo<ImportWorkspaceConfig<UserImportRowData>>(
    () => ({
      module: "users",
      title: "Import Users",
      description: "Upload an Excel file to bulk import login accounts. Rejected rows can be fixed right here.",
      entityLabelPlural: "Users",
      onDownloadTemplate: () => void exportColumnTemplate("users_import_template.xlsx", TEMPLATE_HEADERS),
      columns: PREVIEW_COLUMNS,
      renderEditor: (props) => <UserImportRowEditor {...props} />,

      async preview(file) {
        const result = await usersImportApi.preview(file);
        return { rows: [...result.validRows, ...result.invalidRows].map(toDraft) };
      },

      async validateRow(row) {
        const { error } = await usersImportApi.validateRow(row.data);
        return {
          data: row.data,
          status: error ? "invalid" : "valid",
          errors: error ? [{ message: error }] : [],
          warnings: [],
        };
      },

      async commit(rows) {
        const result = await usersImportApi.confirm(rows.map((row) => ({ rowNumber: row.rowNumber, ...row.data })));
        return { imported: result.imported, failed: result.failed };
      },
    }),
    [],
  );
}
