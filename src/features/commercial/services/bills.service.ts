import { apiRequest } from "@/lib/api-client";
import type {
  Bill,
  BillFormValues,
  BillPayment,
  BillPaymentFormValues,
  BillStage,
  BillStatus,
  PaymentMode,
} from "../types/bill.types";

type BackendBillStage = "gi" | "gc" | "commissioning" | "conversion" | "other";
type BackendBillStatus = "draft" | "submitted" | "completed" | "overdue";
type BackendPaymentMode = "cash" | "upi" | "neft" | "bank_transfer" | "cheque" | "other";

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

const MODE_TO_FRONTEND: Record<BackendPaymentMode, PaymentMode> = {
  cash: "Cash",
  upi: "UPI",
  neft: "NEFT",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
  other: "Other",
};

const MODE_TO_BACKEND: Record<PaymentMode, BackendPaymentMode> = {
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

type BackendBill = {
  id: string;
  customerId: string;
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
  mode: BackendPaymentMode;
  remarks: string | null;
};

function mapBill(raw: BackendBill): Bill {
  return {
    id: raw.id,
    customerId: raw.customerId,
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
    customerId: values.customerId,
    billNumber: values.billNumber,
    stage: STAGE_TO_BACKEND[values.stage],
    billDate: values.billDate || undefined,
    dueDate: values.dueDate || undefined,
    totalAmount: Number(values.totalAmount) || 0,
    tax: Number(values.tax) || 0,
    remarks: values.remarks || undefined,
  };
}

function mapPayment(raw: BackendBillPayment): BillPayment {
  return {
    id: raw.id,
    billId: raw.billId,
    amount: Number(raw.amount),
    paymentDate: toDateOnly(raw.paymentDate),
    mode: MODE_TO_FRONTEND[raw.mode] ?? "Other",
    remarks: raw.remarks ?? "",
  };
}

export const billsApi = {
  async list(params: { search?: string; customerId?: string; stage?: BillStage; status?: BillStatus } = {}): Promise<Bill[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.search) query.set("search", params.search);
    if (params.customerId) query.set("customerId", params.customerId);
    if (params.stage) query.set("stage", STAGE_TO_BACKEND[params.stage]);
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
            customerId: values.customerId,
            billNumber: values.billNumber,
            stage: values.stage ? STAGE_TO_BACKEND[values.stage] : undefined,
            billDate: values.billDate || undefined,
            dueDate: values.dueDate || undefined,
            totalAmount: values.totalAmount != null ? Number(values.totalAmount) : undefined,
            tax: values.tax != null ? Number(values.tax) : undefined,
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
        mode: MODE_TO_BACKEND[values.mode],
        remarks: values.remarks || undefined,
      }),
    });
    return mapPayment(raw);
  },
};
