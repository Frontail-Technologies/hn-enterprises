import { apiRequest } from "@/lib/api-client";

export type BillingReportTotals = {
  bills: number;
  billed: number;
  tdsIncome: number;
  tdsGst: number;
  prs: number;
  bgKept: number;
  bgReleased: number;
  holdKept: number;
  holdReleased: number;
  netPayable: number;
  paidOnBills: number;
  pending: number;
  overdue: number;
  receivedInPeriod: number;
};

export type BillingReportProjectRow = {
  projectId: string;
  projectName: string;
  bills: number;
  billed: number;
  deductions: number;
  held: number;
  netPayable: number;
  paid: number;
  pending: number;
  overdue: number;
};

export type BillingReportData = {
  totals: BillingReportTotals;
  projects: BillingReportProjectRow[];
  months: { month: string; billed: number; received: number }[];
  ageing: { bucket: string; label: string; bills: number; amount: number }[];
};

/** Bills by month and pending by age (backend GET /reports/billing). */
export const billTrendsApi = {
  get: (params: { from: string; to: string; projectId?: string }) => {
    const query = new URLSearchParams({ from: params.from, to: params.to });
    if (params.projectId) query.set("projectId", params.projectId);
    return apiRequest<BillingReportData>(`/reports/billing?${query.toString()}`);
  },
};
