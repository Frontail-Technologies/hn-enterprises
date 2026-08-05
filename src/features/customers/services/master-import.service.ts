import { apiRequest } from "@/lib/api-client";

export type ImportRowStatus = "valid" | "warning" | "invalid";

export type NormalizedImportRow = {
  id: string;
  rowNumber: number;
  projectName: string;
  projectCode: string;
  city: string;
  siteName: string;
  siteCode: string;
  siteAddress: string;
  customerName: string;
  trBpNumber: string;
  mobileNumber: string;
  fullAddress: string;
  connectionType: string;
  houseType: string;
  scheme: string;
  plumberName: string;
  supervisorName: string;
  giReportNumber: string;
  gcReportNumber: string;
  conversionReportNumber: string;
  customerStatus: string;
  issues: string[];
  warnings: string[];
};

type BackendNormalizedImportRow = Omit<NormalizedImportRow, "id">;

export type ImportPreviewResult = {
  batchId: string;
  fileName: string;
  rows: NormalizedImportRow[];
  totals: {
    rows: number;
    validRows: number;
    warningRows: number;
    invalidRows: number;
    projects: number;
    newProjects: number;
    sites: number;
    newSites: number;
    customers: number;
    duplicateCustomers: number;
  };
};

export type ConfirmImportResult = {
  batchId: string;
  projectsCreated: number;
  sitesCreated: number;
  customersCreated: number;
  rowsRejected: number;
};

export function getRowStatus(row: NormalizedImportRow): ImportRowStatus {
  if (row.issues.length) return "invalid";
  if (row.warnings.length) return "warning";
  return "valid";
}

type BackendImportPreviewResult = Omit<ImportPreviewResult, "rows"> & { rows: BackendNormalizedImportRow[] };

export const masterImportApi = {
  async preview(file: File): Promise<ImportPreviewResult> {
    const formData = new FormData();
    formData.append("file", file);
    const result = await apiRequest<BackendImportPreviewResult>("/master-import/preview", {
      method: "POST",
      body: formData,
    });
    return {
      ...result,
      rows: result.rows.map((row) => ({ ...row, id: String(row.rowNumber) })),
    };
  },

  async confirm(batchId: string): Promise<ConfirmImportResult> {
    return apiRequest<ConfirmImportResult>(`/master-import/${batchId}/confirm`, {
      method: "POST",
    });
  },
};
