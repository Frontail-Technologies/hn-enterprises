import { apiRequest } from "@/lib/api-client";
import type { CustomerBulkChanges, CustomerBulkResult } from "../types/customer-bulk.types";

export const customersBulkApi = {
  async update(ids: string[], changes: CustomerBulkChanges): Promise<CustomerBulkResult> {
    return apiRequest<CustomerBulkResult>("/customers/bulk/update", {
      method: "POST",
      body: JSON.stringify({ selection: { mode: "ids", ids }, changes }),
    });
  },

  async remark(ids: string[], note: string): Promise<CustomerBulkResult> {
    return apiRequest<CustomerBulkResult>("/customers/bulk/remark", {
      method: "POST",
      body: JSON.stringify({ selection: { mode: "ids", ids }, note }),
    });
  },

  async remove(ids: string[]): Promise<CustomerBulkResult> {
    return apiRequest<CustomerBulkResult>("/customers/bulk/delete", {
      method: "POST",
      body: JSON.stringify({ selection: { mode: "ids", ids } }),
    });
  },
};
