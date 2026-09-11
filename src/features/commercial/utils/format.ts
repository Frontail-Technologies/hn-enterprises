import { format, parseISO } from "date-fns";
import type { MaterialSource, MaterialStatus } from "../types/material.types";

const SOURCE_LABELS: Record<MaterialSource, string> = { purchase: "Purchase", pbg: "PBG" };

export function sourceLabel(source: MaterialSource | "" | null | undefined) {
  return source ? SOURCE_LABELS[source] : "-";
}

export function projectLabel(projectId: string | "" | null | undefined, projectNameById: Map<string, string>) {
  if (!projectId) return "Central / Unassigned";
  return projectNameById.get(projectId) ?? "Central / Unassigned";
}

/** Same fallback semantics as projectLabel, sourced from a server-joined name instead of a client-built id->name Map. */
export function projectLabelFromName(projectId: string | "" | null | undefined, projectName: string | "" | null | undefined) {
  if (!projectId) return "Central / Unassigned";
  return projectName || "Central / Unassigned";
}

export function computeStockStatus(balance: number, reorderLevel: number): MaterialStatus {
  if (balance <= 0) return "Out of Stock";
  if (balance <= reorderLevel) return "Low Stock";
  return "Active";
}

export function uniqOptions(values: string[]) {
  return Array.from(new Set(values)).map((value) => ({ label: value, value }));
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}
