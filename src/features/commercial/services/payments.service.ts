import { apiRequest } from "@/lib/api-client";
import { appendEvidenceArray, type ImagePreviewItem } from "@/components/shared/ImageUploadPreview";
import type { Payment, PaymentCategory, PaymentFormValues, PaymentStatus } from "../types/payment.types";

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
  siteId: string | null;
  address: string | null;
  customerId: string | null;
  amount: string;
  paymentDate: string;
  mode: string;
  status: BackendStatus;
  purpose: string | null;
  remarks: string | null;
  evidence: Record<string, unknown>[] | null;
};

function mapPayment(raw: BackendPayment): Payment {
  return {
    id: raw.id,
    category: CATEGORY_TO_FRONTEND[raw.category] ?? "Other Expenses",
    plumberId: raw.plumberId ?? "",
    paidTo: raw.paidTo ?? "",
    siteId: raw.siteId ?? "",
    address: raw.address ?? "",
    customerId: raw.customerId ?? "",
    amount: Number(raw.amount),
    paymentDate: toDateOnly(raw.paymentDate),
    mode: raw.mode,
    status: STATUS_TO_FRONTEND[raw.status] ?? "Draft",
    purpose: raw.purpose ?? "",
    remarks: raw.remarks ?? "",
    evidence: (raw.evidence ?? []) as Payment["evidence"],
  };
}

// Evidence is embedded directly in this request instead of uploaded
// separately beforehand - a photo picked but never saved never reaches
// storage at all.
function buildPaymentFormData(values: PaymentFormValues): FormData {
  const formData = new FormData();
  formData.append("category", CATEGORY_TO_BACKEND[values.category]);
  if (values.plumberId) formData.append("plumberId", values.plumberId);
  if (values.paidTo) formData.append("paidTo", values.paidTo);
  if (values.siteId) formData.append("siteId", values.siteId);
  if (values.address) formData.append("address", values.address);
  if (values.customerId) formData.append("customerId", values.customerId);
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
    params: { category?: PaymentCategory; status?: PaymentStatus; search?: string } = {},
  ): Promise<Payment[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.category) query.set("category", CATEGORY_TO_BACKEND[params.category]);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    if (params.search) query.set("search", params.search);
    const rows = await apiRequest<BackendPayment[]>(`/payments?${query.toString()}`);
    return rows.map(mapPayment);
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
