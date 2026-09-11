import type { RecentActivityRow } from "./recent-activity.api";

/**
 * The one place activity `type` values are turned into a display label and a
 * row tint. Keeps formatting out of the page/column components.
 */
const TYPE_PRESENTATION: Record<string, { label: string; rowClass?: string }> = {
  work_progress: { label: "Work", rowClass: "bg-status-info/10 hover:bg-status-info/20" },
  survey: { label: "Survey", rowClass: "bg-status-purple/10 hover:bg-status-purple/20" },
  dpr: { label: "DPR", rowClass: "bg-status-warning/10 hover:bg-status-warning/20" },
  expense: { label: "Expense", rowClass: "bg-status-success/10 hover:bg-status-success/20" },
  complaint: { label: "Complaint", rowClass: "bg-destructive/10 hover:bg-destructive/15" },
  customer: { label: "Customer" },
  system: { label: "System" },
};

export function activityTypeLabel(type: string): string {
  return TYPE_PRESENTATION[type]?.label ?? type;
}

export function activityRowClass(row: RecentActivityRow): string | undefined {
  return TYPE_PRESENTATION[row.type]?.rowClass;
}

/**
 * "Admin User" or "Admin User (for Supervisor A)" when an expense was logged
 * on behalf of someone. "—" only means a genuine system/no-actor event -
 * once actor.name is set it's shown even after the account is hard-deleted
 * (actor.deleted marks that case), never re-collapsed to "Unknown"/"—".
 */
export function activityActorLabel(row: RecentActivityRow): string {
  const actorName = row.actor?.name;
  const actor = actorName ? (row.actor?.deleted ? `${actorName} (Deleted)` : actorName) : "—";
  if (row.onBehalfOf?.name && row.onBehalfOf.name !== actorName) {
    return `${actor} (for ${row.onBehalfOf.name})`;
  }
  return actor;
}

export function activityCustomerLabel(row: RecentActivityRow): string {
  if (!row.customer) return "—";
  const { name, trBpNumber } = row.customer;
  return trBpNumber ? `${name} (${trBpNumber})` : name;
}
