import { format, parseISO } from "date-fns";

export function uniqOptions(values: string[]) {
  return Array.from(new Set(values)).map((value) => ({ label: value, value }));
}

export function formatDate(value: string) {
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

export function formatDateTime(value: string) {
  try {
    return format(parseISO(value.replace(" ", "T")), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}
