import { apiRequest } from "@/lib/api-client";
import type { WageCategory, WageFormValues, WageRecord, WageStatus } from "../types/wage.types";

type BackendCategory = "high_skilled" | "skilled" | "unskilled";
type BackendStatus = "pending" | "approved" | "paid";

const CATEGORY_TO_FRONTEND: Record<BackendCategory, WageCategory> = {
  high_skilled: "High Skilled",
  skilled: "Skilled",
  unskilled: "Unskilled",
};

const CATEGORY_TO_BACKEND: Record<WageCategory, BackendCategory> = {
  "High Skilled": "high_skilled",
  Skilled: "skilled",
  Unskilled: "unskilled",
};

const STATUS_TO_FRONTEND: Record<BackendStatus, WageStatus> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
};

const STATUS_TO_BACKEND: Record<WageStatus, BackendStatus> = {
  Pending: "pending",
  Approved: "approved",
  Paid: "paid",
};

type BackendWageRecord = {
  id: string;
  plumberId: string;
  month: string;
  category: BackendCategory;
  wageRate: string;
  daysWorked: string;
  pf: string;
  esic: string;
  status: BackendStatus;
  remarks: string | null;
  basic: number;
  total: number;
  totalDeduction: number;
  netPayment: number;
};

function mapWage(raw: BackendWageRecord): WageRecord {
  return {
    id: raw.id,
    plumberId: raw.plumberId,
    month: raw.month,
    category: CATEGORY_TO_FRONTEND[raw.category] ?? "Unskilled",
    wageRate: Number(raw.wageRate),
    daysWorked: Number(raw.daysWorked),
    basic: raw.basic,
    total: raw.total,
    pf: Number(raw.pf),
    esic: Number(raw.esic),
    totalDeduction: raw.totalDeduction,
    netPayment: raw.netPayment,
    status: STATUS_TO_FRONTEND[raw.status] ?? "Pending",
    remarks: raw.remarks ?? "",
  };
}

function mapFormToBody(values: WageFormValues) {
  return {
    plumberId: values.plumberId,
    month: values.month,
    category: CATEGORY_TO_BACKEND[values.category],
    wageRate: Number(values.wageRate) || 0,
    daysWorked: Number(values.daysWorked) || 0,
    pf: Number(values.pf) || 0,
    esic: Number(values.esic) || 0,
    status: STATUS_TO_BACKEND[values.status],
    remarks: values.remarks || undefined,
  };
}

export const wagesApi = {
  async list(params: { month?: string; plumberId?: string; status?: WageStatus } = {}): Promise<WageRecord[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.month) query.set("month", params.month);
    if (params.plumberId) query.set("plumberId", params.plumberId);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    const rows = await apiRequest<BackendWageRecord[]>(`/wages?${query.toString()}`);
    return rows.map(mapWage);
  },

  async upsert(values: WageFormValues): Promise<WageRecord> {
    const raw = await apiRequest<BackendWageRecord>("/wages", {
      method: "PUT",
      body: JSON.stringify(mapFormToBody(values)),
    });
    return mapWage(raw);
  },
};
