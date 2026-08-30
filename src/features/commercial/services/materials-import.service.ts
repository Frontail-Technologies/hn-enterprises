import { apiRequest } from "@/lib/api-client";

export type MaterialImportRowData = {
  name: string;
  category: string;
  unit: string;
  reorderLevel: number;
};

export type MaterialImportRow = MaterialImportRowData & {
  rowNumber: number;
  error?: string;
};

export type MaterialImportPreviewResult = {
  fileName: string;
  validRows: MaterialImportRow[];
  invalidRows: MaterialImportRow[];
};

export type MaterialImportConfirmResult = {
  insertedCount: number;
  imported: number;
  failed: { tempId: string; message: string }[];
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

  async validateRow(data: MaterialImportRowData): Promise<{ error?: string }> {
    return apiRequest<{ error?: string }>("/materials/import/validate-row", {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: { "Content-Type": "application/json" },
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
