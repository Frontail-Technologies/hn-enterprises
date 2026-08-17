import { apiRequest } from "@/lib/api-client";
import type { DeleteImpactResult } from "@/components/shared/delete-impact.types";
import type {
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
  | "material_categories"
  | "meter_types";

type BackendStatus = "active" | "inactive";
type BackendHolidayType = "national" | "restricted" | "company";

const CATEGORY_TO_FRONTEND: Record<BackendCategory, MasterValueCategory> = {
  payment_types: "Payment Types",
  connection_types: "Connection Types",
  house_types: "House Types",
  schemes: "Schemes",
  document_categories: "Document Categories",
  material_categories: "Material Categories",
  meter_types: "Meter Types",
};

export const CATEGORY_TO_BACKEND: Record<MasterValueCategory, BackendCategory> = {
  "Payment Types": "payment_types",
  "Connection Types": "connection_types",
  "House Types": "house_types",
  Schemes: "schemes",
  "Document Categories": "document_categories",
  "Material Categories": "material_categories",
  "Meter Types": "meter_types",
};

const STATUS_TO_FRONTEND: Record<BackendStatus, MasterValueStatus> = {
  active: "Active",
  inactive: "Inactive",
};

const STATUS_TO_BACKEND: Record<MasterValueStatus, BackendStatus> = {
  Active: "active",
  Inactive: "inactive",
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

  async delete(id: string): Promise<void> {
    await apiRequest(`/masters/values/${id}`, {
      method: "DELETE",
    });
  },

  async getDeleteImpact(id: string): Promise<DeleteImpactResult> {
    return apiRequest<DeleteImpactResult>(`/masters/values/${id}/delete-impact`);
  },

  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    return apiRequest<{ count: number }>("/masters/values/bulk/delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
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

  async delete(id: string): Promise<void> {
    await apiRequest(`/masters/holidays/${id}`, {
      method: "DELETE",
    });
  },

  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    return apiRequest<{ count: number }>("/masters/holidays/bulk/delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },
};
