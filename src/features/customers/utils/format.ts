import { format, parseISO } from "date-fns";

/**
 * Shared date/date-time display formatters for the Customers detail
 * surfaces (approvals history, survey detail, LMC detail, progress
 * milestones). Pulled out of `CustomerDetail.tsx` so every extracted
 * `components/detail/*` and `components/lmc/*` file can share one copy
 * instead of redefining it locally.
 */
export function formatDate(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

export function formatDateTime(value: string) {
  if (!value) return "-";
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
