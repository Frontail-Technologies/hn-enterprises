import { apiRequest } from "@/lib/api-client";
import type { ReportFilters } from "../types";

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

export function reportQueryString(filters: ReportFilters) {
  const query = new URLSearchParams({ from: filters.from, to: filters.to });
  if (filters.projectId) query.set("projectId", filters.projectId);
  return query.toString();
}

export const billingReportApi = {
  get: (filters: ReportFilters) => apiRequest<BillingReportData>(`/reports/billing?${reportQueryString(filters)}`),
};
