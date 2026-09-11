import { apiRequest, apiRequestPaginated, type PaginationMeta } from "@/lib/api-client";
import { appendEvidenceArray, type ImagePreviewItem } from "@/components/shared/ImageUploadPreview";
import type { Payment, PaymentCategory, PaymentFormValues, PaymentStatus } from "../types/payment.types";

export type PaymentListParams = {
  category?: PaymentCategory;
  status?: PaymentStatus;
  search?: string;
  projectId?: string;
  city?: string;
  from?: string;
  to?: string;
};

export type PaymentSummary = {
  count: number;
  total: number;
  categoryBreakdown: { category: PaymentCategory; count: number; total: number }[];
  statusBreakdown: { status: PaymentStatus; count: number; total: number }[];
};

type BackendCategory = "worker_payment" | "supervisor_payment" | "plumber_payment" | "rent" | "material_expense" | "other_expense";
type BackendStatus = "draft" | "submitted" | "approved" | "rejected";

const CATEGORY_TO_FRONTEND: Record<BackendCategory, PaymentCategory> = {
  worker_payment: "Worker Payments",
  supervisor_payment: "Supervisor Payments",
  plumber_payment: "Plumber Payments",
  rent: "Office / Guest House Rent",
  material_expense: "Material Expenses",
  other_expense: "Other Expenses",
};

const CATEGORY_TO_BACKEND: Record<PaymentCategory, BackendCategory> = {
  "Worker Payments": "worker_payment",
  "Supervisor Payments": "supervisor_payment",
  "Plumber Payments": "plumber_payment",
  "Office / Guest House Rent": "rent",
  "Material Expenses": "material_expense",
  "Other Expenses": "other_expense",
};

const STATUS_TO_FRONTEND: Record<BackendStatus, PaymentStatus> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_TO_BACKEND: Record<PaymentStatus, BackendStatus> = {
  Draft: "draft",
  Submitted: "submitted",
  Approved: "approved",
  Rejected: "rejected",
};

function toDateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

type BackendPayment = {
  id: string;
  category: BackendCategory;
  plumberId: string | null;
  paidTo: string | null;
  address: string | null;
  customerId: string | null;
  customerName: string | null;
  customerTrBpNumber: string | null;
  projectId: string | null;
  amount: string;
  paymentDate: string;
  mode: string;
  status: BackendStatus;
  purpose: string | null;
  remarks: string | null;
  evidence: Record<string, unknown>[] | null;
  supervisorId: string | null;
  supervisorName: string | null;
  createdById: string | null;
  createdByName: string | null;
};

function mapPayment(raw: BackendPayment): Payment {
  return {
    id: raw.id,
    category: CATEGORY_TO_FRONTEND[raw.category] ?? "Other Expenses",
    plumberId: raw.plumberId ?? "",
    paidTo: raw.paidTo ?? "",
    address: raw.address ?? "",
    customerId: raw.customerId ?? "",
    customerName: raw.customerName ?? "",
    customerTrBpNumber: raw.customerTrBpNumber ?? "",
    projectId: raw.projectId ?? "",
    amount: Number(raw.amount),
    paymentDate: toDateOnly(raw.paymentDate),
    mode: raw.mode,
    status: STATUS_TO_FRONTEND[raw.status] ?? "Draft",
    purpose: raw.purpose ?? "",
    remarks: raw.remarks ?? "",
    evidence: (raw.evidence ?? []) as Payment["evidence"],
    supervisorId: raw.supervisorId ?? "",
    supervisorName: raw.supervisorName ?? "",
    createdById: raw.createdById ?? "",
    createdByName: raw.createdByName ?? "",
  };
}

function buildPaymentFormData(values: PaymentFormValues): FormData {
  const formData = new FormData();
  formData.append("category", CATEGORY_TO_BACKEND[values.category]);
  if (values.plumberId) formData.append("plumberId", values.plumberId);
  if (values.paidTo) formData.append("paidTo", values.paidTo);
  if (values.address) formData.append("address", values.address);
  if (values.customerId) formData.append("customerId", values.customerId);
  if (values.projectId) formData.append("projectId", values.projectId);
  if (values.supervisorId) formData.append("supervisorId", values.supervisorId);
  formData.append("amount", String(Number(values.amount) || 0));
  formData.append("paymentDate", values.paymentDate);
  formData.append("mode", values.mode);
  formData.append("status", STATUS_TO_BACKEND[values.status]);
  if (values.purpose) formData.append("purpose", values.purpose);
  if (values.remarks) formData.append("remarks", values.remarks);
  appendEvidenceArray(formData, "evidence", values.evidence as unknown as ImagePreviewItem[]);
  return formData;
}

export const paymentsApi = {
  async list(
    params: {
      category?: PaymentCategory;
      status?: PaymentStatus;
      search?: string;
      projectId?: string;
      city?: string;
      from?: string;
      to?: string;
    } = {},
  ): Promise<Payment[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.category) query.set("category", CATEGORY_TO_BACKEND[params.category]);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.city) query.set("city", params.city);
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    const rows = await apiRequest<BackendPayment[]>(`/payments?${query.toString()}`);
    return rows.map(mapPayment);
  },

  /**
   * Real server pagination for the main Payments & Expenses screen. The flat
   * list() above stays for scoped detail consumers (ProjectExpensesTab,
   * dashboard drill-downs) which pull a bounded slice.
   */
  async listPage(
    params: PaymentListParams & { page?: number; limit?: number } = {},
  ): Promise<{ data: Payment[]; pagination?: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.category) query.set("category", CATEGORY_TO_BACKEND[params.category]);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.city) query.set("city", params.city);
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    const { data, pagination } = await apiRequestPaginated<BackendPayment[]>(`/payments?${query.toString()}`);
    return { data: (data ?? []).map(mapPayment), pagination };
  },

  /** Dataset-wide totals + per-category / per-status breakdown, honoring the same filters. */
  async summary(params: PaymentListParams = {}): Promise<PaymentSummary> {
    const query = new URLSearchParams();
    if (params.category) query.set("category", CATEGORY_TO_BACKEND[params.category]);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.city) query.set("city", params.city);
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    const raw = await apiRequest<{
      count: number;
      total: number;
      categoryBreakdown: { category: BackendCategory; count: number; total: number }[];
      statusBreakdown: { status: BackendStatus; count: number; total: number }[];
    }>(`/payments/summary?${query.toString()}`);
    return {
      count: raw.count,
      total: raw.total,
      categoryBreakdown: raw.categoryBreakdown.map((row) => ({
        category: CATEGORY_TO_FRONTEND[row.category] ?? "Other Expenses",
        count: row.count,
        total: row.total,
      })),
      statusBreakdown: raw.statusBreakdown.map((row) => ({
        status: STATUS_TO_FRONTEND[row.status] ?? "Draft",
        count: row.count,
        total: row.total,
      })),
    };
  },

  async create(values: PaymentFormValues): Promise<Payment> {
    const raw = await apiRequest<BackendPayment>("/payments", {
      method: "POST",
      body: buildPaymentFormData(values),
    });
    return mapPayment(raw);
  },

  async update(id: string, values: PaymentFormValues): Promise<Payment> {
    const raw = await apiRequest<BackendPayment>(`/payments/${id}`, {
      method: "PATCH",
      body: buildPaymentFormData(values),
    });
    return mapPayment(raw);
  },

  async remove(id: string): Promise<void> {
    await apiRequest<null>(`/payments/${id}`, { method: "DELETE" });
  },
};
