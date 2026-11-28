import { apiRequest } from "@/lib/api-client";
import type { ReportFilters } from "../types";
import { reportQueryString } from "./billing.service";

export type MaterialReportRow = {
  materialId: string;
  name: string;
  unit: string;
  category: string | null;
  storeOpening: number;
  purchased: number;
  pbgReceived: number;
  issued: number;
  returned: number;
  consumed: number;
  adjusted: number;
  storeClosing: number;
  withPlumbersClosing: number;
  flag: string | null;
};

export type MaterialHoldingRow = {
  plumberId: string;
  plumberName: string;
  category: "plumber" | "labour";
  materialId: string;
  materialName: string;
  unit: string;
  balance: number;
  flag: string | null;
};

export type MaterialReportData = {
  totals: { materials: number; movements: number; flagged: number; holders: number; lowStock: number };
  rows: MaterialReportRow[];
  holdings: MaterialHoldingRow[];
};

export const materialReportApi = {
  get: (filters: ReportFilters) => apiRequest<MaterialReportData>(`/reports/material?${reportQueryString(filters)}`),
};
