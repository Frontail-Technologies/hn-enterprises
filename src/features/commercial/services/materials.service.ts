import { apiRequest } from "@/lib/api-client";
import type {
  Material,
  MaterialFormValues,
  MaterialTransaction,
  MaterialTransactionFormValues,
  MaterialTransactionType,
  PlumberBalance,
} from "../types/material.types";

type BackendMaterialStatus = "active" | "low_stock" | "out_of_stock";

const STATUS_TO_FRONTEND: Record<BackendMaterialStatus, Material["status"]> = {
  active: "Active",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

type BackendMaterial = {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  reorderLevel: string;
  currentBalance: string;
  status: BackendMaterialStatus;
};

type BackendMaterialTransaction = {
  id: string;
  materialId: string;
  type: MaterialTransactionType;
  quantity: string;
  quantityDelta: string;
  referenceNo: string | null;
  vendorName: string | null;
  rate: string | null;
  billAmount: string | null;
  plumberId: string | null;
  supervisorName: string | null;
  siteId: string | null;
  storeLabel: string | null;
  customerId: string | null;
  reportNo: string | null;
  condition: string | null;
  adjustmentType: string | null;
  vehicleNo: string | null;
  vehicleQty: string | null;
  transactionDate: string;
  evidence: Record<string, unknown>[] | null;
  remarks: string | null;
};

type BackendPlumberBalance = {
  plumberId: string;
  materialId: string;
  issued: number;
  consumed: number;
  returned: number;
  balance: number;
};

function mapMaterial(raw: BackendMaterial): Material {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category ?? "",
    unit: raw.unit,
    reorderLevel: Number(raw.reorderLevel),
    currentBalance: Number(raw.currentBalance),
    status: STATUS_TO_FRONTEND[raw.status] ?? "Active",
  };
}

function mapMaterialFormToBody(values: MaterialFormValues) {
  return {
    name: values.name,
    category: values.category || undefined,
    unit: values.unit,
    reorderLevel: Number(values.reorderLevel) || 0,
  };
}

function mapTransaction(raw: BackendMaterialTransaction): MaterialTransaction {
  return {
    id: raw.id,
    materialId: raw.materialId,
    type: raw.type,
    quantity: Number(raw.quantity),
    quantityDelta: Number(raw.quantityDelta),
    referenceNo: raw.referenceNo ?? "",
    vendorName: raw.vendorName ?? "",
    rate: raw.rate != null ? Number(raw.rate) : null,
    billAmount: raw.billAmount != null ? Number(raw.billAmount) : null,
    plumberId: raw.plumberId ?? "",
    supervisorName: raw.supervisorName ?? "",
    siteId: raw.siteId ?? "",
    storeLabel: raw.storeLabel ?? "",
    customerId: raw.customerId ?? "",
    reportNo: raw.reportNo ?? "",
    condition: raw.condition ?? "",
    adjustmentType: raw.adjustmentType ?? "",
    vehicleNo: raw.vehicleNo ?? "",
    vehicleQty: raw.vehicleQty != null ? Number(raw.vehicleQty) : null,
    transactionDate: raw.transactionDate.slice(0, 10),
    evidence: (raw.evidence ?? []) as MaterialTransaction["evidence"],
    remarks: raw.remarks ?? "",
  };
}

function mapTransactionFormToBody(type: MaterialTransactionType, values: MaterialTransactionFormValues) {
  return {
    materialId: values.materialId,
    type,
    quantity: Number(values.quantity) || 0,
    transactionDate: values.transactionDate,
    referenceNo: values.referenceNo || undefined,
    vendorName: values.vendorName || undefined,
    rate: values.rate ? Number(values.rate) : undefined,
    billAmount: values.billAmount ? Number(values.billAmount) : undefined,
    plumberId: values.plumberId || undefined,
    supervisorName: values.supervisorName || undefined,
    siteId: values.siteId || undefined,
    storeLabel: values.storeLabel || undefined,
    customerId: values.customerId || undefined,
    reportNo: values.reportNo || undefined,
    condition: values.condition || undefined,
    adjustmentType: values.adjustmentType || undefined,
    vehicleNo: values.vehicleNo || undefined,
    vehicleQty: values.vehicleQty ? Number(values.vehicleQty) : undefined,
    evidence: values.evidence.length ? values.evidence : undefined,
    remarks: values.remarks || undefined,
  };
}

export const materialsApi = {
  async list(search?: string): Promise<Material[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (search) query.set("search", search);
    const rows = await apiRequest<BackendMaterial[]>(`/materials?${query.toString()}`);
    return rows.map(mapMaterial);
  },

  async get(id: string): Promise<Material> {
    const raw = await apiRequest<BackendMaterial>(`/materials/${id}`);
    return mapMaterial(raw);
  },

  async create(values: MaterialFormValues): Promise<Material> {
    const raw = await apiRequest<BackendMaterial>("/materials", {
      method: "POST",
      body: JSON.stringify(mapMaterialFormToBody(values)),
    });
    return mapMaterial(raw);
  },

  async update(id: string, values: Partial<MaterialFormValues>): Promise<Material> {
    const raw = await apiRequest<BackendMaterial>(`/materials/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: values.name,
        category: values.category,
        unit: values.unit,
        reorderLevel: values.reorderLevel != null ? Number(values.reorderLevel) : undefined,
      }),
    });
    return mapMaterial(raw);
  },

  async listTransactions(
    params: {
      materialId?: string;
      type?: MaterialTransactionType;
      plumberId?: string;
      siteId?: string;
      customerId?: string;
    } = {},
  ): Promise<MaterialTransaction[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.materialId) query.set("materialId", params.materialId);
    if (params.type) query.set("type", params.type);
    if (params.plumberId) query.set("plumberId", params.plumberId);
    if (params.siteId) query.set("siteId", params.siteId);
    if (params.customerId) query.set("customerId", params.customerId);
    const rows = await apiRequest<BackendMaterialTransaction[]>(`/materials/transactions?${query.toString()}`);
    return rows.map(mapTransaction);
  },

  async createTransaction(
    type: MaterialTransactionType,
    values: MaterialTransactionFormValues,
  ): Promise<MaterialTransaction> {
    const raw = await apiRequest<BackendMaterialTransaction>("/materials/transactions", {
      method: "POST",
      body: JSON.stringify(mapTransactionFormToBody(type, values)),
    });
    return mapTransaction(raw);
  },

  async plumberBalances(params: { plumberId?: string; materialId?: string } = {}): Promise<PlumberBalance[]> {
    const query = new URLSearchParams();
    if (params.plumberId) query.set("plumberId", params.plumberId);
    if (params.materialId) query.set("materialId", params.materialId);
    const qs = query.toString();
    const rows = await apiRequest<BackendPlumberBalance[]>(`/materials/plumber-balances${qs ? `?${qs}` : ""}`);
    return rows;
  },
};
