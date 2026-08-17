import { apiRequest } from "@/lib/api-client";
import type { MasterValueStatus } from "@/features/management/types/masters.types";
import type { CustomField, CustomFieldAccess, CustomFieldFormValues, CustomFieldValueType, ReorderCustomFieldItem } from "../types";

type BackendStatus = "active" | "inactive";
type BackendValueType = "text" | "number" | "date" | "amount" | "yes_no" | "dropdown";
type BackendAccess = "admin_only" | "supervisor_view" | "supervisor_edit";

const STATUS_TO_FRONTEND: Record<BackendStatus, MasterValueStatus> = {
  active: "Active",
  inactive: "Inactive",
};

const STATUS_TO_BACKEND: Record<MasterValueStatus, BackendStatus> = {
  Active: "active",
  Inactive: "inactive",
};

export const VALUE_TYPE_TO_FRONTEND: Record<BackendValueType, CustomFieldValueType> = {
  text: "Text",
  number: "Number",
  date: "Date",
  amount: "Amount",
  yes_no: "Yes / No",
  dropdown: "Dropdown",
};

export const VALUE_TYPE_TO_BACKEND: Record<CustomFieldValueType, BackendValueType> = {
  Text: "text",
  Number: "number",
  Date: "date",
  Amount: "amount",
  "Yes / No": "yes_no",
  Dropdown: "dropdown",
};

export const ACCESS_TO_FRONTEND: Record<BackendAccess, CustomFieldAccess> = {
  admin_only: "Admin Only",
  supervisor_view: "Supervisor Can View",
  supervisor_edit: "Supervisor Can View & Edit",
};

export const ACCESS_TO_BACKEND: Record<CustomFieldAccess, BackendAccess> = {
  "Admin Only": "admin_only",
  "Supervisor Can View": "supervisor_view",
  "Supervisor Can View & Edit": "supervisor_edit",
};

type BackendCustomField = {
  id: string;
  key: string;
  label: string;
  groupName: string;
  width: number;
  valueType: BackendValueType;
  dropdownOptions: string[] | null;
  required: boolean;
  sortOrder: number;
  supervisorAccess: BackendAccess;
  status: BackendStatus;
};

function mapCustomField(raw: BackendCustomField): CustomField {
  return {
    id: raw.id,
    key: raw.key,
    label: raw.label,
    group: raw.groupName,
    width: raw.width,
    valueType: VALUE_TYPE_TO_FRONTEND[raw.valueType] ?? "Text",
    dropdownOptions: raw.dropdownOptions ?? [],
    required: raw.required,
    sortOrder: raw.sortOrder ?? 0,
    supervisorAccess: ACCESS_TO_FRONTEND[raw.supervisorAccess] ?? "Admin Only",
    status: STATUS_TO_FRONTEND[raw.status] ?? "Active",
  };
}

export const dynamicFieldsApi = {
  async list(status?: MasterValueStatus): Promise<CustomField[]> {
    const query = new URLSearchParams();
    if (status) query.set("status", STATUS_TO_BACKEND[status]);
    const qs = query.toString();
    const rows = await apiRequest<BackendCustomField[]>(`/masters/custom-fields${qs ? `?${qs}` : ""}`);
    return rows.map(mapCustomField);
  },

  async getGroups(): Promise<string[]> {
    return apiRequest<string[]>("/masters/custom-fields/groups");
  },

  async create(values: CustomFieldFormValues, sortOrder: number): Promise<CustomField> {
    const raw = await apiRequest<BackendCustomField>("/masters/custom-fields", {
      method: "POST",
      body: JSON.stringify({
        label: values.label,
        groupName: values.group,
        sortOrder,
        valueType: VALUE_TYPE_TO_BACKEND[values.valueType],
        dropdownOptions: values.valueType === "Dropdown" ? values.dropdownOptions : undefined,
        required: values.required,
        supervisorAccess: ACCESS_TO_BACKEND[values.supervisorAccess],
        status: STATUS_TO_BACKEND[values.status],
      }),
    });
    return mapCustomField(raw);
  },

  async update(id: string, values: CustomFieldFormValues): Promise<CustomField> {
    const raw = await apiRequest<BackendCustomField>(`/masters/custom-fields/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        label: values.label,
        groupName: values.group,
        valueType: VALUE_TYPE_TO_BACKEND[values.valueType],
        dropdownOptions: values.valueType === "Dropdown" ? values.dropdownOptions : undefined,
        required: values.required,
        supervisorAccess: ACCESS_TO_BACKEND[values.supervisorAccess],
        status: STATUS_TO_BACKEND[values.status],
      }),
    });
    return mapCustomField(raw);
  },

  async setStatus(id: string, status: MasterValueStatus): Promise<CustomField> {
    const raw = await apiRequest<BackendCustomField>(`/masters/custom-fields/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: STATUS_TO_BACKEND[status] }),
    });
    return mapCustomField(raw);
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/masters/custom-fields/${id}`, { method: "DELETE" });
  },

  async bulkDelete(ids: string[]): Promise<{ count: number; skippedActive: number }> {
    return apiRequest<{ count: number; skippedActive: number }>("/masters/custom-fields/bulk/delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },

  async reorder(items: ReorderCustomFieldItem[]): Promise<void> {
    await apiRequest("/masters/custom-fields/reorder", {
      method: "PATCH",
      body: JSON.stringify(items),
    });
  },
};
