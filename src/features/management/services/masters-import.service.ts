import { apiRequest } from "@/lib/api-client";
import type { MasterValueCategory } from "../types/masters.types";

export type MasterImportPreviewRow = {
  rowNumber: number;
  value: string;
  description: string;
  error?: string;
};

export type MasterImportPreviewResult = {
  fileName: string;
  validRows: MasterImportPreviewRow[];
  invalidRows: MasterImportPreviewRow[];
};

export type MasterImportConfirmResult = {
  insertedCount: number;
};

export const masterValuesImportApi = {
  async preview(file: File, category: MasterValueCategory): Promise<MasterImportPreviewResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return apiRequest<MasterImportPreviewResult>("/masters/values/import/preview", {
      method: "POST",
      body: formData,
    });
  },

  async confirm(validRows: MasterImportPreviewRow[], category: MasterValueCategory): Promise<MasterImportConfirmResult> {
    return apiRequest<MasterImportConfirmResult>("/masters/values/import/confirm", {
      method: "POST",
      body: JSON.stringify({ validRows, category }),
      headers: { "Content-Type": "application/json" },
    });
  },
};
