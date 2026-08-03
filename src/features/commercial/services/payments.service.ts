import { apiRequest } from "@/lib/api-client";
import type { Payment, PaymentCategory, PaymentFormValues, PaymentStatus } from "../types/payment.types";

type BackendCategory = "worker_payment" | "supervisor_payment" | "plumber_payment" | "rent" | "material_expense" | "other_expense";
type BackendStatus = "draft" | "submitted" | "approved" | "rejected";
type BackendMode = "cash" | "upi" | "neft" | "bank_transfer" | "cheque" | "other";

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

const MODE_TO_FRONTEND: Record<BackendMode, Payment["mode"]> = {
  cash: "Cash",
  upi: "UPI",
  neft: "NEFT",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
  other: "Other",
};

const MODE_TO_BACKEND: Record<Payment["mode"], BackendMode> = {
  Cash: "cash",
  UPI: "upi",
  NEFT: "neft",
  "Bank Transfer": "bank_transfer",
  Cheque: "cheque",
  Other: "other",
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
  customerId: string | null;
  amount: string;
  paymentDate: string;
  mode: BackendMode;
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
    customerId: raw.customerId ?? "",
    amount: Number(raw.amount),
    paymentDate: toDateOnly(raw.paymentDate),
    mode: MODE_TO_FRONTEND[raw.mode] ?? "Other",
    status: STATUS_TO_FRONTEND[raw.status] ?? "Draft",
    purpose: raw.purpose ?? "",
    remarks: raw.remarks ?? "",
    evidence: (raw.evidence ?? []) as Payment["evidence"],
  };
}

function mapFormToBody(values: PaymentFormValues) {
  return {
    category: CATEGORY_TO_BACKEND[values.category],
    plumberId: values.plumberId || undefined,
    paidTo: values.paidTo || undefined,
    siteId: values.siteId || undefined,
    customerId: values.customerId || undefined,
    amount: Number(values.amount) || 0,
    paymentDate: values.paymentDate,
    mode: MODE_TO_BACKEND[values.mode],
    status: STATUS_TO_BACKEND[values.status],
    purpose: values.purpose || undefined,
    remarks: values.remarks || undefined,
    evidence: values.evidence.length
      ? values.evidence.map((item) => ({
          id: item.id,
          label: item.label,
          fileName: item.fileName,
          fileUrl: item.fileUrl,
        }))
      : undefined,
  };
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
      body: JSON.stringify(mapFormToBody(values)),
    });
    return mapPayment(raw);
  },

  async update(id: string, values: PaymentFormValues): Promise<Payment> {
    const raw = await apiRequest<BackendPayment>(`/payments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(mapFormToBody(values)),
    });
    return mapPayment(raw);
  },
};
