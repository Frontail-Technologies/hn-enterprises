import { useMemo, useState } from "react";
import { useCustomerQuery, useCustomerSearchQuery } from "../queries/useCustomersQuery";
import { toCustomerSelectOption, toCustomerSelectOptions } from "../utils/customer-option";

/**
 * Shared remote-search data source for every customer SELECTOR (Complaint,
 * Payment, Correct Transaction, Material Drawer, Report Templates). Replaces
 * loading the full customer list with a small (20-row) server-searched page -
 * SearchableSelect itself debounces (~300ms) before calling `onSearchChange`.
 *
 * Falls back to a focused GET /customers/:id so an already-selected customer
 * is never shown as a raw UUID when it falls outside the current search page
 * (e.g. editing a record whose customer isn't among the latest/matching 20).
 */
export function useCustomerSelectorOptions(selectedId?: string) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useCustomerSearchQuery(search);
  const customers = useMemo(() => data?.data ?? [], [data]);

  const selectedInPage = Boolean(selectedId) && customers.some((customer) => customer.id === selectedId);
  const { data: fallbackCustomer } = useCustomerQuery(selectedInPage ? "" : selectedId ?? "");

  const options = useMemo(() => {
    const base = toCustomerSelectOptions(customers);
    if (fallbackCustomer && !selectedInPage) {
      return [toCustomerSelectOption(fallbackCustomer), ...base];
    }
    return base;
  }, [customers, fallbackCustomer, selectedInPage]);

  return { options, isLoading, onSearchChange: setSearch };
}
