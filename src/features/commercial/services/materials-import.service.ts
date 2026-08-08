import { apiRequest } from "@/lib/api-client";

export type MaterialImportRow = {
  rowNumber: number;
  name: string;
  category: string;
  unit: string;
  reorderLevel: number;
  error?: string;
};

export type MaterialImportPreviewResult = {
  fileName: string;
  validRows: MaterialImportRow[];
  invalidRows: MaterialImportRow[];
};

export type MaterialImportConfirmResult = {
  insertedCount: number;
};

export const materialsImportApi = {
  async preview(file: File): Promise<MaterialImportPreviewResult> {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<MaterialImportPreviewResult>("/materials/import/preview", {
      method: "POST",
      body: formData,
    });
  },

  async confirm(validRows: MaterialImportRow[]): Promise<MaterialImportConfirmResult> {
    return apiRequest<MaterialImportConfirmResult>("/materials/import/confirm", {
      method: "POST",
      body: JSON.stringify({ validRows }),
      headers: { "Content-Type": "application/json" },
    });
  },
};
