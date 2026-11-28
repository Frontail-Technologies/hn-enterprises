import { apiRequest, apiRequestPaginated, type PaginationMeta } from "@/lib/api-client";
import type {
  Bill,
  BillFormValues,
  BillPayment,
  BillPaymentFormValues,
  BillPaymentStatus,
  BillStatus,
} from "../types/bill.types";

type BackendBillStatus = "draft" | "submitted" | "completed" | "overdue";
type BackendBillPaymentStatus = "pending" | "cleared" | "bounced";

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
  projectName?: string | null;
  billNumber: string;
  billDate: string | null;
  dueDate: string | null;
  totalAmount: string;
  tax: string;
  tdsIncome?: string;
  tdsGst?: string;
  prs?: string;
  bankGuarantee?: string;
  bgReleased?: string;
  holdAmount?: string;
  holdReleased?: string;
  bgHeld?: number;
  holdHeld?: number;
  netPayable?: number;
  paidAmount: string;
  pendingAmount: number;
  status: BackendBillStatus;
  remarks: string | null;
  attachments?: { id: string; label: string; fileName: string; fileUrl: string }[] | null;
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
    projectName: raw.projectName ?? "",
    billNumber: raw.billNumber,
    billDate: toDateOnly(raw.billDate),
    dueDate: toDateOnly(raw.dueDate),
    totalAmount: Number(raw.totalAmount),
    tax: Number(raw.tax),
    tdsIncome: Number(raw.tdsIncome ?? 0),
    tdsGst: Number(raw.tdsGst ?? 0),
    prs: Number(raw.prs ?? 0),
    bankGuarantee: Number(raw.bankGuarantee ?? 0),
    bgReleased: Number(raw.bgReleased ?? 0),
    holdAmount: Number(raw.holdAmount ?? 0),
    holdReleased: Number(raw.holdReleased ?? 0),
    bgHeld: Number(raw.bgHeld ?? 0),
    holdHeld: Number(raw.holdHeld ?? 0),
    netPayable: Number(raw.netPayable ?? Number(raw.totalAmount) + Number(raw.tax)),
    paidAmount: Number(raw.paidAmount),
    pendingAmount: raw.pendingAmount,
    status: STATUS_TO_FRONTEND[raw.status] ?? "Draft",
    remarks: raw.remarks ?? "",
    attachments: (raw.attachments ?? []).map((item) => ({ ...item, status: "uploaded" as const })),
  };
}

function mapBillFormToBody(values: BillFormValues) {
  return {
    projectId: values.projectId,
    billNumber: values.billNumber,
    billDate: values.billDate || undefined,
    dueDate: values.dueDate || undefined,
    totalAmount: Number(values.totalAmount) || 0,
    tax: Number(values.tax) || 0,
    tdsIncome: Number(values.tdsIncome) || 0,
    tdsGst: Number(values.tdsGst) || 0,
    prs: Number(values.prs) || 0,
    bankGuarantee: Number(values.bankGuarantee) || 0,
    holdAmount: Number(values.holdAmount) || 0,
    status: STATUS_TO_BACKEND[values.status],
    remarks: values.remarks || undefined,
    // Only uploaded photos are sent (the dialog uploads them before saving).
    attachments: (values.attachments ?? [])
      .filter((item) => item.fileUrl)
      .map((item) => ({ id: item.id, label: item.label, fileName: item.fileName, fileUrl: item.fileUrl! })),
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

export type BillListParams = { search?: string; projectId?: string; status?: BillStatus };

export type BillSummary = {
  billed: number;
  received: number;
  pending: number;
  overdue: number;
  tds?: number;
  prs?: number;
  bgHeld?: number;
  holdHeld?: number;
};

export const billsApi = {
  async list(params: BillListParams = {}): Promise<Bill[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    const rows = await apiRequest<BackendBill[]>(`/bills?${query.toString()}`);
    return rows.map(mapBill);
  },

  /** Real server pagination for the main Billing screen; list() above stays for scoped consumers. */
  async listPage(
    params: BillListParams & { page?: number; limit?: number } = {},
  ): Promise<{ data: Bill[]; pagination?: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    const { data, pagination } = await apiRequestPaginated<BackendBill[]>(`/bills?${query.toString()}`);
    return { data: (data ?? []).map(mapBill), pagination };
  },

  /** Dataset-wide billing totals for the stat cards, honoring the same filters. */
  async summary(params: BillListParams = {}): Promise<BillSummary> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    return apiRequest<BillSummary>(`/bills/summary?${query.toString()}`);
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

  /** The client paid out (part of) the bank guarantee or the held amount. */
  async releaseAmount(id: string, body: { kind: "bg" | "hold"; amount: number; paymentDate: string; mode: string; remarks?: string }) {
    return apiRequest<unknown>(`/bills/${id}/release`, { method: "POST", body: JSON.stringify(body) });
  },

  async update(id: string, values: Partial<BillFormValues>): Promise<Bill> {
    const raw = await apiRequest<BackendBill>(`/bills/${id}`, {
      method: "PATCH",
      body: JSON.stringify(
        Object.fromEntries(
          Object.entries({
            projectId: values.projectId,
            billNumber: values.billNumber,
            billDate: values.billDate || undefined,
            dueDate: values.dueDate || undefined,
            totalAmount: values.totalAmount != null ? Number(values.totalAmount) : undefined,
            tax: values.tax != null ? Number(values.tax) : undefined,
            tdsIncome: values.tdsIncome != null ? Number(values.tdsIncome) || 0 : undefined,
            tdsGst: values.tdsGst != null ? Number(values.tdsGst) || 0 : undefined,
            prs: values.prs != null ? Number(values.prs) || 0 : undefined,
            bankGuarantee: values.bankGuarantee != null ? Number(values.bankGuarantee) || 0 : undefined,
            holdAmount: values.holdAmount != null ? Number(values.holdAmount) || 0 : undefined,
            status: values.status ? STATUS_TO_BACKEND[values.status] : undefined,
            remarks: values.remarks,
            // Sent whenever the form has the list, so removing every photo clears them too.
            attachments: values.attachments
              ?.filter((item) => item.fileUrl)
              .map((item) => ({ id: item.id, label: item.label, fileName: item.fileName, fileUrl: item.fileUrl! })),
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
