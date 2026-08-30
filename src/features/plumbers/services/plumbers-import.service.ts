import { apiRequest } from "@/lib/api-client";

export type PlumberImportRowData = {
  name: string;
  type: string;
  contactNumber: string;
  remarks: string;
};

export type PlumberImportRow = PlumberImportRowData & {
  rowNumber: number;
  error?: string;
};

export type PlumberImportPreviewResult = {
  fileName: string;
  validRows: PlumberImportRow[];
  invalidRows: PlumberImportRow[];
};

export type PlumberImportConfirmResult = {
  insertedCount: number;
  imported: number;
  failed: { tempId: string; message: string }[];
};

export const plumbersImportApi = {
  async preview(file: File): Promise<PlumberImportPreviewResult> {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<PlumberImportPreviewResult>("/plumbers/import/preview", {
      method: "POST",
      body: formData,
    });
  },

  async validateRow(data: PlumberImportRowData): Promise<{ error?: string }> {
    return apiRequest<{ error?: string }>("/plumbers/import/validate-row", {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: { "Content-Type": "application/json" },
    });
  },

  async confirm(validRows: PlumberImportRow[]): Promise<PlumberImportConfirmResult> {
    return apiRequest<PlumberImportConfirmResult>("/plumbers/import/confirm", {
      method: "POST",
      body: JSON.stringify({ validRows }),
      headers: { "Content-Type": "application/json" },
    });
  },
};
