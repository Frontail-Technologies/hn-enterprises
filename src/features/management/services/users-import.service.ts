import { apiRequest } from "@/lib/api-client";

export type UserImportRowStatus = "valid" | "warning" | "invalid";

export type UserImportPreviewRow = {
  rowNumber: number;
  name: string;
  username: string;
  email: string;
  mobile: string;
  role: string;
  error?: string;
};

export type UserImportPreviewResult = {
  fileName: string;
  validRows: UserImportPreviewRow[];
  invalidRows: UserImportPreviewRow[];
};

export type UserImportConfirmResult = {
  insertedCount: number;
};

export const usersImportApi = {
  async preview(file: File): Promise<UserImportPreviewResult> {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<UserImportPreviewResult>("/users/import/preview", {
      method: "POST",
      body: formData,
    });
  },

  async confirm(validRows: UserImportPreviewRow[]): Promise<UserImportConfirmResult> {
    return apiRequest<UserImportConfirmResult>("/users/import/confirm", {
      method: "POST",
      body: JSON.stringify({ validRows }),
      headers: { "Content-Type": "application/json" },
    });
  },
};
