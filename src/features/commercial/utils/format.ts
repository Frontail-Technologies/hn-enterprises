import { format, parseISO } from "date-fns";
import type { MaterialSource, MaterialStatus } from "../types/material.types";

const SOURCE_LABELS: Record<MaterialSource, string> = { purchase: "Purchase", pbg: "PBG" };

export function sourceLabel(source: MaterialSource | "" | null | undefined) {
  return source ? SOURCE_LABELS[source] : "-";
}

// "unassigned" is the backend sentinel for projectId IS NULL (§3) - a store-custody
// transaction with no attributable project, shown to users as "Central / Unassigned"
// rather than a blank cell.
export function projectLabel(projectId: string | "" | null | undefined, projectNameById: Map<string, string>) {
  if (!projectId) return "Central / Unassigned";
  return projectNameById.get(projectId) ?? "Central / Unassigned";
}

// Mirrors backend materials.service.ts's computeStockStatus exactly - needed
// client-side because a project/source-filtered Stock Sheet balance never reaches
// the backend's own per-material `status` field (that's always computed from the
// global currentBalance). Status must be derived from whichever balance number is
// actually displayed, or it silently claims stock is low/out based on a number the
// reader can't see.
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
