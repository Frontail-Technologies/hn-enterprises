import type { SearchableSelectOption } from "@/components/shared/SearchableSelect";
import type { Customer } from "../types/customer.types";

/**
 * Canonical customer identity for any selector/picker: customer names are
 * not unique, so BR/TR Number is always shown alongside the name, never
 * name-alone. Used by every Customer SearchableSelect (complaints, expenses,
 * filters, ...) so labels/search behavior don't drift per-feature.
 */
export function toCustomerSelectOption(customer: Customer): SearchableSelectOption {
  const name = customer.customerConnection.customerName?.trim();
  const trBpNo = customer.customerConnection.trBpNo?.trim();

  const label = name || (trBpNo ? `BR/TR: ${trBpNo}` : "Unnamed Customer");
  const secondary = name && trBpNo ? `BR/TR: ${trBpNo}` : undefined;

  return {
    value: customer.id,
    label,
    secondary,
    keywords: [name, trBpNo].filter((value): value is string => Boolean(value)),
  };
}

export function toCustomerSelectOptions(customers: Customer[]): SearchableSelectOption[] {
  return customers.map(toCustomerSelectOption);
}
