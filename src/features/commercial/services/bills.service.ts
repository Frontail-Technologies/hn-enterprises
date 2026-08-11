import { apiRequest } from "@/lib/api-client";
import type {
  Bill,
  BillFormValues,
  BillPayment,
  BillPaymentFormValues,
  BillPaymentStatus,
  BillStage,
  BillStatus,
} from "../types/bill.types";

type BackendBillStage = "gi" | "gc" | "commissioning" | "conversion" | "other";
type BackendBillStatus = "draft" | "submitted" | "completed" | "overdue";
type BackendBillPaymentStatus = "pending" | "cleared" | "bounced";

const STAGE_TO_FRONTEND: Record<BackendBillStage, BillStage> = {
  gi: "GI",
  gc: "GC",
  commissioning: "Commissioning",
  conversion: "Conversion",
  other: "Other",
};

const STAGE_TO_BACKEND: Record<BillStage, BackendBillStage> = {
  GI: "gi",
  GC: "gc",
  Commissioning: "commissioning",
  Conversion: "conversion",
  Other: "other",
};

const STATUS_TO_FRONTEND: Record<BackendBillStatus, BillStatus> = {
  draft: "Draft",
  submitted: "Submitted",
  completed: "Completed",
  overdue: "Overdue",
};

const STATUS_TO_BACKEND: Record<BillStatus, BackendBillStatus> = {
  Draft: "draft",
  Submitted: "submitted",
  Completed: "completed",
  Overdue: "overdue",
};

const PAYMENT_STATUS_TO_FRONTEND: Record<BackendBillPaymentStatus, BillPaymentStatus> = {
  pending: "Pending",
  cleared: "Cleared",
  bounced: "Bounced",
};

const PAYMENT_STATUS_TO_BACKEND: Record<BillPaymentStatus, BackendBillPaymentStatus> = {
  Pending: "pending",
  Cleared: "cleared",
  Bounced: "bounced",
};

function toDateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

type BackendBill = {
  id: string;
  projectId: string;
  customerId: string | null;
  billNumber: string;
  stage: BackendBillStage;
  billDate: string | null;
  dueDate: string | null;
  totalAmount: string;
  tax: string;
  paidAmount: string;
  pendingAmount: number;
  status: BackendBillStatus;
  remarks: string | null;
};

type BackendBillPayment = {
  id: string;
  billId: string;
  amount: string;
  paymentDate: string;
  mode: string;
  status: BackendBillPaymentStatus;
  remarks: string | null;
};

function mapBill(raw: BackendBill): Bill {
  return {
    id: raw.id,
    projectId: raw.projectId,
    customerId: raw.customerId ?? "",
    billNumber: raw.billNumber,
    stage: STAGE_TO_FRONTEND[raw.stage] ?? "Other",
    billDate: toDateOnly(raw.billDate),
    dueDate: toDateOnly(raw.dueDate),
    totalAmount: Number(raw.totalAmount),
    tax: Number(raw.tax),
    paidAmount: Number(raw.paidAmount),
    pendingAmount: raw.pendingAmount,
    status: STATUS_TO_FRONTEND[raw.status] ?? "Draft",
    remarks: raw.remarks ?? "",
  };
}

function mapBillFormToBody(values: BillFormValues) {
  return {
    projectId: values.projectId,
    customerId: values.customerId || undefined,
    billNumber: values.billNumber,
    stage: STAGE_TO_BACKEND[values.stage],
    billDate: values.billDate || undefined,
    dueDate: values.dueDate || undefined,
    totalAmount: Number(values.totalAmount) || 0,
    tax: Number(values.tax) || 0,
    status: STATUS_TO_BACKEND[values.status],
    remarks: values.remarks || undefined,
  };
}

function mapPayment(raw: BackendBillPayment): BillPayment {
  return {
    id: raw.id,
    billId: raw.billId,
    amount: Number(raw.amount),
    paymentDate: toDateOnly(raw.paymentDate),
    mode: raw.mode,
    status: PAYMENT_STATUS_TO_FRONTEND[raw.status] ?? "Cleared",
    remarks: raw.remarks ?? "",
  };
}

export const billsApi = {
  async list(
    params: { search?: string; projectId?: string; customerId?: string; stage?: BillStage; status?: BillStatus } = {},
  ): Promise<Bill[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.customerId) query.set("customerId", params.customerId);
    if (params.stage) query.set("stage", STAGE_TO_BACKEND[params.stage]);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    const rows = await apiRequest<BackendBill[]>(`/bills?${query.toString()}`);
    return rows.map(mapBill);
  },

  async get(id: string): Promise<Bill> {
    const raw = await apiRequest<BackendBill>(`/bills/${id}`);
    return mapBill(raw);
  },

  async create(values: BillFormValues): Promise<Bill> {
    const raw = await apiRequest<BackendBill>("/bills", {
      method: "POST",
      body: JSON.stringify(mapBillFormToBody(values)),
    });
    return mapBill(raw);
  },

  async update(id: string, values: Partial<BillFormValues>): Promise<Bill> {
    const raw = await apiRequest<BackendBill>(`/bills/${id}`, {
      method: "PATCH",
      body: JSON.stringify(
        Object.fromEntries(
          Object.entries({
            projectId: values.projectId,
            customerId: values.customerId,
            billNumber: values.billNumber,
            stage: values.stage ? STAGE_TO_BACKEND[values.stage] : undefined,
            billDate: values.billDate || undefined,
            dueDate: values.dueDate || undefined,
            totalAmount: values.totalAmount != null ? Number(values.totalAmount) : undefined,
            tax: values.tax != null ? Number(values.tax) : undefined,
            status: values.status ? STATUS_TO_BACKEND[values.status] : undefined,
            remarks: values.remarks,
          }).filter(([, value]) => value !== undefined),
        ),
      ),
    });
    return mapBill(raw);
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/bills/${id}`, { method: "DELETE" });
  },

  async listPayments(billId: string): Promise<BillPayment[]> {
    const rows = await apiRequest<BackendBillPayment[]>(`/bills/${billId}/payments`);
    return rows.map(mapPayment);
  },

  async createPayment(billId: string, values: BillPaymentFormValues): Promise<BillPayment> {
    const raw = await apiRequest<BackendBillPayment>(`/bills/${billId}/payments`, {
      method: "POST",
      body: JSON.stringify({
        amount: Number(values.amount) || 0,
        paymentDate: values.paymentDate,
        mode: values.mode,
        status: PAYMENT_STATUS_TO_BACKEND[values.status],
        remarks: values.remarks || undefined,
      }),
    });
    return mapPayment(raw);
  },

  async updatePaymentStatus(billId: string, paymentId: string, status: BillPaymentStatus): Promise<BillPayment> {
    const raw = await apiRequest<BackendBillPayment>(`/bills/${billId}/payments/${paymentId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: PAYMENT_STATUS_TO_BACKEND[status] }),
    });
    return mapPayment(raw);
  },
};
