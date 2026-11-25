import type { KeyValueItem } from "@/components/shared/KeyValueGrid";
import { formatDate } from "./format";

/**
 * Projects a `FieldDefinition[]` + matching values object into
 * `KeyValueGrid` items for the read-only detail sections (GI measurements,
 * isolation valves, fittings, MDPE fittings, billing, civil work). Shared
 * across `components/detail/*` instead of each section re-implementing the
 * same value formatting.
 */
export function itemsFromFields<T extends Record<string, string | boolean>>(
  fields: { key: keyof T; label: string; input?: string }[],
  values: T,
): KeyValueItem[] {
  return fields.map((field) => ({
    label: field.label,
    value: formatFieldValue(values[field.key], field.input),
  }));
}

export function formatFieldValue(value: string | boolean, input?: string) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (!value) return "-";
  if (input === "date") return formatDate(value);
  // Select options saved as codes ("draft", "not_started") read as words.
  if (input === "select" && /^[a-z][a-z_ ]*$/.test(value)) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  return value;
}
