import { apiRequest } from "@/lib/api-client";
import { appendEvidenceArray, type ImagePreviewItem } from "@/components/shared/ImageUploadPreview";
import type { DeleteImpactResult } from "@/components/shared/delete-impact.types";
import type {
  CorrectMaterialTransactionInput,
  Material,
  MaterialFormValues,
  MaterialSource,
  MaterialTransaction,
  MaterialTransactionFormValues,
  MaterialTransactionLinkType,
  MaterialTransactionType,
  PlumberBalance,
  StockBalance,
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
  source: MaterialSource | null;
  projectId: string | null;
  referenceNo: string | null;
  vendorName: string | null;
  rate: string | null;
  billAmount: string | null;
  plumberId: string | null;
  supervisorId: string | null;
  supervisorName: string | null;
  siteId: string | null;
  address: string | null;
  storeLabel: string | null;
  customerId: string | null;
  paymentId: string | null;
  reportNo: string | null;
  condition: string | null;
  adjustmentType: string | null;
  vehicleNo: string | null;
  vehicleQty: string | null;
  transactionDate: string;
  evidence: Record<string, unknown>[] | null;
  remarks: string | null;
  relatedTransactionId: string | null;
  linkType: MaterialTransactionLinkType | null;
  correctionReason: string | null;
  isReversed?: boolean;
  isCorrected?: boolean;
};

type BackendPlumberBalance = {
  plumberId: string;
  materialId: string;
  source: MaterialSource | null;
  projectId: string | null;
  issued: number;
  consumed: number;
  returned: number;
  adjusted: number;
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
    source: raw.source ?? "",
    projectId: raw.projectId ?? "",
    referenceNo: raw.referenceNo ?? "",
    vendorName: raw.vendorName ?? "",
    rate: raw.rate != null ? Number(raw.rate) : null,
    billAmount: raw.billAmount != null ? Number(raw.billAmount) : null,
    plumberId: raw.plumberId ?? "",
    supervisorId: raw.supervisorId ?? "",
    supervisorName: raw.supervisorName ?? "",
    siteId: raw.siteId ?? "",
    address: raw.address ?? "",
    storeLabel: raw.storeLabel ?? "",
    customerId: raw.customerId ?? "",
    paymentId: raw.paymentId ?? "",
    reportNo: raw.reportNo ?? "",
    condition: raw.condition ?? "",
    adjustmentType: raw.adjustmentType ?? "",
    vehicleNo: raw.vehicleNo ?? "",
    vehicleQty: raw.vehicleQty != null ? Number(raw.vehicleQty) : null,
    transactionDate: raw.transactionDate.slice(0, 10),
    evidence: (raw.evidence ?? []) as MaterialTransaction["evidence"],
    remarks: raw.remarks ?? "",
    relatedTransactionId: raw.relatedTransactionId ?? "",
    linkType: raw.linkType ?? "",
    correctionReason: raw.correctionReason ?? "",
    isReversed: raw.isReversed ?? false,
    isCorrected: raw.isCorrected ?? false,
  };
}

// Evidence is embedded directly in this request instead of uploaded
// separately beforehand - a photo picked but never saved never reaches
// storage at all.
function buildTransactionFormData(type: MaterialTransactionType, values: MaterialTransactionFormValues): FormData {
  const formData = new FormData();
  formData.append("materialId", values.materialId);
  formData.append("type", type);
  formData.append("quantity", String(Number(values.quantity) || 0));
  formData.append("transactionDate", values.transactionDate);
  if (values.source) formData.append("source", values.source);
  if (values.direction) formData.append("direction", values.direction);
  if (values.projectId) formData.append("projectId", values.projectId);
  if (values.referenceNo) formData.append("referenceNo", values.referenceNo);
  if (values.vendorName) formData.append("vendorName", values.vendorName);
  if (values.rate) formData.append("rate", String(Number(values.rate)));
  if (values.billAmount) formData.append("billAmount", String(Number(values.billAmount)));
  if (values.plumberId) formData.append("plumberId", values.plumberId);
  if (values.supervisorId) formData.append("supervisorId", values.supervisorId);
  if (values.siteId) formData.append("siteId", values.siteId);
  if (values.address) formData.append("address", values.address);
  if (values.storeLabel) formData.append("storeLabel", values.storeLabel);
  if (values.customerId) formData.append("customerId", values.customerId);
  if (values.reportNo) formData.append("reportNo", values.reportNo);
  if (values.condition) formData.append("condition", values.condition);
  if (values.adjustmentType) formData.append("adjustmentType", values.adjustmentType);
  if (values.vehicleNo) formData.append("vehicleNo", values.vehicleNo);
  if (values.vehicleQty) formData.append("vehicleQty", String(Number(values.vehicleQty)));
  if (values.remarks) formData.append("remarks", values.remarks);
  appendEvidenceArray(formData, "evidence", values.evidence as unknown as ImagePreviewItem[]);
  return formData;
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

  async delete(id: string): Promise<void> {
    await apiRequest(`/materials/${id}`, { method: "DELETE" });
  },

  async getDeleteImpact(id: string): Promise<DeleteImpactResult> {
    return apiRequest<DeleteImpactResult>(`/materials/${id}/delete-impact`);
  },

  async listTransactions(
    params: {
      materialId?: string;
      type?: MaterialTransactionType;
      source?: MaterialSource;
      plumberId?: string;
      siteId?: string;
      customerId?: string;
      projectId?: string;
      from?: string;
      to?: string;
    } = {},
  ): Promise<MaterialTransaction[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.materialId) query.set("materialId", params.materialId);
    if (params.type) query.set("type", params.type);
    if (params.source) query.set("source", params.source);
    if (params.plumberId) query.set("plumberId", params.plumberId);
    if (params.siteId) query.set("siteId", params.siteId);
    if (params.customerId) query.set("customerId", params.customerId);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    const rows = await apiRequest<BackendMaterialTransaction[]>(`/materials/transactions?${query.toString()}`);
    return rows.map(mapTransaction);
  },

  async createTransaction(
    type: MaterialTransactionType,
    values: MaterialTransactionFormValues,
  ): Promise<MaterialTransaction> {
    const raw = await apiRequest<BackendMaterialTransaction>("/materials/transactions", {
      method: "POST",
      body: buildTransactionFormData(type, values),
    });
    return mapTransaction(raw);
  },

  async plumberBalances(
    params: { plumberId?: string; materialId?: string; source?: MaterialSource; projectId?: string } = {},
  ): Promise<PlumberBalance[]> {
    const query = new URLSearchParams();
    if (params.plumberId) query.set("plumberId", params.plumberId);
    if (params.materialId) query.set("materialId", params.materialId);
    if (params.source) query.set("source", params.source);
    if (params.projectId) query.set("projectId", params.projectId);
    const qs = query.toString();
    const rows = await apiRequest<BackendPlumberBalance[]>(`/materials/plumber-balances${qs ? `?${qs}` : ""}`);
    return rows.map((row) => ({ ...row, source: row.source ?? "", projectId: row.projectId ?? "" }));
  },

  async stockBalances(
    params: { materialId?: string; source?: MaterialSource; projectId?: string } = {},
  ): Promise<StockBalance[]> {
    const query = new URLSearchParams();
    if (params.materialId) query.set("materialId", params.materialId);
    if (params.source) query.set("source", params.source);
    if (params.projectId) query.set("projectId", params.projectId);
    const qs = query.toString();
    return apiRequest<StockBalance[]>(`/materials/stock-balances${qs ? `?${qs}` : ""}`);
  },

  async reverseTransaction(id: string, reason: string): Promise<MaterialTransaction> {
    const raw = await apiRequest<BackendMaterialTransaction>(`/materials/transactions/${id}/reverse`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return mapTransaction(raw);
  },

  async correctTransaction(id: string, input: CorrectMaterialTransactionInput): Promise<MaterialTransaction> {
    const body: Record<string, unknown> = { correctionReason: input.correctionReason };
    if (input.quantity) body.quantity = Number(input.quantity);
    if (input.transactionDate) body.transactionDate = input.transactionDate;
    if (input.source) body.source = input.source;
    if (input.direction) body.direction = input.direction;
    if (input.projectId !== undefined) body.projectId = input.projectId;
    if (input.referenceNo) body.referenceNo = input.referenceNo;
    if (input.vendorName) body.vendorName = input.vendorName;
    if (input.rate) body.rate = Number(input.rate);
    if (input.billAmount) body.billAmount = Number(input.billAmount);
    if (input.plumberId) body.plumberId = input.plumberId;
    if (input.supervisorId) body.supervisorId = input.supervisorId;
    if (input.siteId) body.siteId = input.siteId;
    if (input.address) body.address = input.address;
    if (input.storeLabel) body.storeLabel = input.storeLabel;
    if (input.customerId) body.customerId = input.customerId;
    if (input.reportNo) body.reportNo = input.reportNo;
    if (input.condition) body.condition = input.condition;
    if (input.adjustmentType) body.adjustmentType = input.adjustmentType;
    if (input.vehicleNo) body.vehicleNo = input.vehicleNo;
    if (input.vehicleQty) body.vehicleQty = Number(input.vehicleQty);
    if (input.remarks) body.remarks = input.remarks;
    const raw = await apiRequest<BackendMaterialTransaction>(`/materials/transactions/${id}/correct`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapTransaction(raw);
  },
};
