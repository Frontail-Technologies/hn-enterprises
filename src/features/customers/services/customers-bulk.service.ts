import { apiRequest } from "@/lib/api-client";
import type { CustomerBulkChanges, CustomerBulkResult } from "../types/customer-bulk.types";

// The Customers page loads every matching row client-side (ExcelDataGrid), so
// "selection" here is always a concrete id list the frontend already knows -
// the backend's selection union also supports a server-side filter mode
// (for future callers that don't have every row loaded), but there's no
// reason for this UI to reconstruct its own client-side filters into a
// server-side filter payload when it already has the exact ids on screen.
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
