import { apiRequest } from "@/lib/api-client";

export type PaymentImportRow = {
  rowNumber: number;
  category: string;
  paidTo: string;
  plumberName: string;
  amount: string;
  paymentDate: string;
  mode: string;
  purpose: string;
  remarks: string;
  address: string;
  error?: string;
};

export type PaymentImportPreviewResult = {
  fileName: string;
  validRows: PaymentImportRow[];
  invalidRows: PaymentImportRow[];
};

export type PaymentImportConfirmResult = {
  insertedCount: number;
};

export const paymentsImportApi = {
  async preview(file: File): Promise<PaymentImportPreviewResult> {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<PaymentImportPreviewResult>("/payments/import/preview", {
      method: "POST",
      body: formData,
    });
  },

  async confirm(validRows: PaymentImportRow[]): Promise<PaymentImportConfirmResult> {
    return apiRequest<PaymentImportConfirmResult>("/payments/import/confirm", {
      method: "POST",
      body: JSON.stringify({ validRows }),
      headers: { "Content-Type": "application/json" },
    });
  },
};
