import { apiRequest } from "@/lib/api-client";
import type {
  CustomField,
  CustomFieldFormValues,
  CustomFieldValueType,
  Holiday,
  HolidayFormValues,
  HolidayType,
  MasterValue,
  MasterValueCategory,
  MasterValueFormValues,
  MasterValueStatus,
} from "../types/masters.types";

type BackendCategory =
  | "payment_types"
  | "connection_types"
  | "house_types"
  | "schemes"
  | "document_categories"
  | "staff_roles"
  | "bank_types"
  | "upi_types"
  | "material_categories";

type BackendStatus = "active" | "inactive";
type BackendValueType = "text" | "number" | "date" | "amount" | "yes_no" | "dropdown";
type BackendHolidayType = "national" | "restricted" | "company";

const CATEGORY_TO_FRONTEND: Record<BackendCategory, MasterValueCategory> = {
  payment_types: "Payment Types",
  connection_types: "Connection Types",
  house_types: "House Types",
  schemes: "Schemes",
  document_categories: "Document Categories",
  staff_roles: "Staff Roles",
  bank_types: "Bank Types",
  upi_types: "UPI Types",
  material_categories: "Material Categories",
};

const CATEGORY_TO_BACKEND: Record<MasterValueCategory, BackendCategory> = {
  "Payment Types": "payment_types",
  "Connection Types": "connection_types",
  "House Types": "house_types",
  Schemes: "schemes",
  "Document Categories": "document_categories",
  "Staff Roles": "staff_roles",
  "Bank Types": "bank_types",
  "UPI Types": "upi_types",
  "Material Categories": "material_categories",
};

const STATUS_TO_FRONTEND: Record<BackendStatus, MasterValueStatus> = {
  active: "Active",
  inactive: "Inactive",
};

const STATUS_TO_BACKEND: Record<MasterValueStatus, BackendStatus> = {
  Active: "active",
  Inactive: "inactive",
};

const VALUE_TYPE_TO_FRONTEND: Record<BackendValueType, CustomFieldValueType> = {
  text: "Text",
  number: "Number",
  date: "Date",
  amount: "Amount",
  yes_no: "Yes / No",
  dropdown: "Dropdown",
};

const VALUE_TYPE_TO_BACKEND: Record<CustomFieldValueType, BackendValueType> = {
  Text: "text",
  Number: "number",
  Date: "date",
  Amount: "amount",
  "Yes / No": "yes_no",
  Dropdown: "dropdown",
};

const HOLIDAY_TYPE_TO_FRONTEND: Record<BackendHolidayType, HolidayType> = {
  national: "National",
  restricted: "Restricted",
  company: "Company",
};

const HOLIDAY_TYPE_TO_BACKEND: Record<HolidayType, BackendHolidayType> = {
  National: "national",
  Restricted: "restricted",
  Company: "company",
};

function toDateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

type BackendMasterValue = {
  id: string;
  category: BackendCategory;
  value: string;
  description: string | null;
  status: BackendStatus;
};

function mapMasterValue(raw: BackendMasterValue): MasterValue {
  return {
    id: raw.id,
    category: CATEGORY_TO_FRONTEND[raw.category] ?? "Payment Types",
    value: raw.value,
    description: raw.description ?? "",
    status: STATUS_TO_FRONTEND[raw.status] ?? "Active",
  };
}

export const masterValuesApi = {
  async list(category: MasterValueCategory, search?: string): Promise<MasterValue[]> {
    const query = new URLSearchParams({ category: CATEGORY_TO_BACKEND[category] });
    if (search) query.set("search", search);
    const rows = await apiRequest<BackendMasterValue[]>(`/masters/values?${query.toString()}`);
    return rows.map(mapMasterValue);
  },

  async create(category: MasterValueCategory, values: MasterValueFormValues): Promise<MasterValue> {
    const raw = await apiRequest<BackendMasterValue>("/masters/values", {
      method: "POST",
      body: JSON.stringify({
        category: CATEGORY_TO_BACKEND[category],
        value: values.value,
        description: values.description || undefined,
        status: STATUS_TO_BACKEND[values.status],
      }),
    });
    return mapMasterValue(raw);
  },

  async update(id: string, values: MasterValueFormValues): Promise<MasterValue> {
    const raw = await apiRequest<BackendMasterValue>(`/masters/values/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        value: values.value,
        description: values.description || undefined,
        status: STATUS_TO_BACKEND[values.status],
      }),
    });
    return mapMasterValue(raw);
  },
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
    status: STATUS_TO_FRONTEND[raw.status] ?? "Active",
  };
}

export const customFieldsApi = {
  async list(status?: MasterValueStatus): Promise<CustomField[]> {
    const query = new URLSearchParams();
    if (status) query.set("status", STATUS_TO_BACKEND[status]);
    const qs = query.toString();
    const rows = await apiRequest<BackendCustomField[]>(`/masters/custom-fields${qs ? `?${qs}` : ""}`);
    return rows.map(mapCustomField);
  },

  async create(values: CustomFieldFormValues): Promise<CustomField> {
    const raw = await apiRequest<BackendCustomField>("/masters/custom-fields", {
      method: "POST",
      body: JSON.stringify({
        key: values.key,
        label: values.label,
        groupName: values.group,
        width: Number(values.width) || undefined,
        valueType: VALUE_TYPE_TO_BACKEND[values.valueType],
        dropdownOptions: values.valueType === "Dropdown" ? values.dropdownOptions : undefined,
        required: values.required,
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
        width: Number(values.width) || undefined,
        valueType: VALUE_TYPE_TO_BACKEND[values.valueType],
        dropdownOptions: values.valueType === "Dropdown" ? values.dropdownOptions : undefined,
        required: values.required,
        status: STATUS_TO_BACKEND[values.status],
      }),
    });
    return mapCustomField(raw);
  },
};

type BackendHoliday = {
  id: string;
  name: string;
  date: string;
  type: BackendHolidayType;
  status: BackendStatus;
};

function mapHoliday(raw: BackendHoliday): Holiday {
  return {
    id: raw.id,
    name: raw.name,
    date: toDateOnly(raw.date),
    type: HOLIDAY_TYPE_TO_FRONTEND[raw.type] ?? "National",
    status: STATUS_TO_FRONTEND[raw.status] ?? "Active",
  };
}

export const holidaysApi = {
  async list(search?: string): Promise<Holiday[]> {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    const qs = query.toString();
    const rows = await apiRequest<BackendHoliday[]>(`/masters/holidays${qs ? `?${qs}` : ""}`);
    return rows.map(mapHoliday);
  },

  async create(values: HolidayFormValues): Promise<Holiday> {
    const raw = await apiRequest<BackendHoliday>("/masters/holidays", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        date: values.date,
        type: HOLIDAY_TYPE_TO_BACKEND[values.type],
        status: STATUS_TO_BACKEND[values.status],
      }),
    });
    return mapHoliday(raw);
  },

  async update(id: string, values: HolidayFormValues): Promise<Holiday> {
    const raw = await apiRequest<BackendHoliday>(`/masters/holidays/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: values.name,
        date: values.date,
        type: HOLIDAY_TYPE_TO_BACKEND[values.type],
        status: STATUS_TO_BACKEND[values.status],
      }),
    });
    return mapHoliday(raw);
  },
};
