import { apiRequest } from "@/lib/api-client";

export type PlumberImportRow = {
  rowNumber: number;
  name: string;
  type: string;
  contactNumber: string;
  remarks: string;
  error?: string;
};

export type PlumberImportPreviewResult = {
  fileName: string;
  validRows: PlumberImportRow[];
  invalidRows: PlumberImportRow[];
};

export type PlumberImportConfirmResult = {
  insertedCount: number;
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

  async confirm(validRows: PlumberImportRow[]): Promise<PlumberImportConfirmResult> {
    return apiRequest<PlumberImportConfirmResult>("/plumbers/import/confirm", {
      method: "POST",
      body: JSON.stringify({ validRows }),
      headers: { "Content-Type": "application/json" },
    });
  },
};
