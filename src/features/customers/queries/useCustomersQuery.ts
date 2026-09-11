import { useQuery } from "@tanstack/react-query";
import { customersApi } from "../api/customers.api";
import { customerKey, customersKey, customersListKey, customersSearchKey } from "./customer.query-keys";
import type { CustomerStatus } from "../types/customer.types";

export function useCustomersQuery(
  params: { search?: string; projectId?: string; siteId?: string; status?: CustomerStatus; statKey?: string; city?: string } = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [...customersKey, params],
    queryFn: () => customersApi.list(params),
    enabled: options.enabled ?? true,
  });
}

export type CustomersListParams = {
  search?: string;
  projectId?: string;
  siteId?: string;
  status?: CustomerStatus;
  statKey?: string;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: "customerName" | "trBpNumber" | "mobileNumber" | "createdAt";
  sortOrder?: "asc" | "desc";
  columnFilters?: Record<string, string[]>;
};

/** Real server pagination for CustomersList - keeps previous page's data while the next page loads. */
export function useCustomersListQuery(params: CustomersListParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: customersListKey(params),
    queryFn: () => customersApi.listPaginated(params),
    placeholderData: (previous) => previous,
    enabled: options.enabled ?? true,
  });
}

/**
 * Debounced remote search for customer SELECTOR consumers (ComplaintDialog,
 * PaymentDialog, CorrectTransactionDialog, MaterialDrawer, ReportTemplatesPage).
 * Callers debounce `search` themselves before passing it in here.
 */
export function useCustomerSearchQuery(search: string, options: { enabled?: boolean } = {}) {
  const params = { search: search.trim(), limit: 20 };
  return useQuery({
    queryKey: customersSearchKey(params),
    queryFn: () => customersApi.listPaginated(params),
    enabled: options.enabled ?? true,
    placeholderData: (previous) => previous,
  });
}

export function useCustomerQuery(id: string) {
  return useQuery({
    queryKey: customerKey(id),
    queryFn: () => customersApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCustomerDeleteImpactQuery(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...customerKey(id), "delete-impact"],
    queryFn: () => customersApi.getDeleteImpact(id),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 0,
  });
}
