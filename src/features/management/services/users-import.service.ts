import { apiRequest } from "@/lib/api-client";

export type UserImportRowStatus = "valid" | "warning" | "invalid";

export type UserImportRowData = {
  name: string;
  username: string;
  email: string;
  mobile: string;
  role: string;
  password: string;
};

export type UserImportPreviewRow = UserImportRowData & {
  rowNumber: number;
  error?: string;
};

export type UserImportPreviewResult = {
  fileName: string;
  validRows: UserImportPreviewRow[];
  invalidRows: UserImportPreviewRow[];
};

export type UserImportConfirmResult = {
  insertedCount: number;
  imported: number;
  failed: { tempId: string; message: string }[];
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

  async validateRow(data: UserImportRowData): Promise<{ error?: string }> {
    return apiRequest<{ error?: string }>("/users/import/validate-row", {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: { "Content-Type": "application/json" },
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
