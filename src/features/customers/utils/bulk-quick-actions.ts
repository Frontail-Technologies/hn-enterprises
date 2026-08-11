import { isBulkBooleanField } from "../components/bulk/BulkFieldControl";
import type { CustomerBulkChanges, CustomerBulkFieldKey, CustomerBulkQuickField } from "../types/customer-bulk.types";
import type { useBulkFieldOptions } from "../hooks/useBulkFieldOptions";

export type BulkQuickAction = {
  field: CustomerBulkQuickField;
  /** Label shown in the Assign▾/Update▾ dropdown menu item. */
  menuLabel: string;
  /** Dialog title, e.g. "Assign Supervisor". */
  title: string;
  /** Action-specific submit button label (§ Button Label - not a generic "Apply"). */
  actionLabel: (count: number) => string;
  /** Optional caption shown under the field control (e.g. "replaces the existing value"). */
  note?: string;
};

// One config entry per Assign▾ / Update▾ menu item - each opens the SAME
// compact BulkQuickFieldDialog, just parametrized differently, instead of
// 14 near-duplicate dialog components. Both the toolbar (for menu items)
// and CustomersList (for the dialog's title/button text) read from this.
export const BULK_ASSIGN_ACTIONS: BulkQuickAction[] = [
  {
    field: "supervisorId",
    menuLabel: "Supervisor",
    title: "Assign Supervisor",
    actionLabel: (count) => `Assign to ${count} Customer${count === 1 ? "" : "s"}`,
    note: "Existing supervisor values will be replaced.",
  },
  {
    field: "plumberId",
    menuLabel: "Plumber",
    title: "Assign Plumber",
    actionLabel: (count) => `Assign to ${count} Customer${count === 1 ? "" : "s"}`,
    note: "Existing plumber values will be replaced.",
  },
  {
    field: "projectSite",
    menuLabel: "Project / Site",
    title: "Move Customers",
    actionLabel: (count) => `Move ${count} Customer${count === 1 ? "" : "s"}`,
    note: "Existing project/site assignments will be replaced.",
  },
];

export const BULK_UPDATE_ACTIONS: BulkQuickAction[] = [
  {
    field: "paymentStatus",
    menuLabel: "Payment Status",
    title: "Update Payment Status",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
  {
    field: "paymentMode",
    menuLabel: "Payment Mode",
    title: "Update Payment Mode",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
  {
    field: "scheme",
    menuLabel: "Scheme",
    title: "Update Scheme",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
  {
    field: "connectionType",
    menuLabel: "Connection Type",
    title: "Update Connection Type",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
  {
    field: "houseType",
    menuLabel: "House Type",
    title: "Update House Type",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
  {
    field: "status",
    menuLabel: "Customer Status",
    title: "Update Customer Status",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
  {
    field: "jmrDone",
    menuLabel: "JMR Done",
    title: "Update JMR Done",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
  {
    field: "jmrSubmittedInPbg",
    menuLabel: "JMR Submitted in PBG",
    title: "Update JMR Submitted in PBG",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
  {
    field: "giBillDone",
    menuLabel: "GI Bill Done",
    title: "Update GI Bill Done",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
  {
    field: "gcBillDone",
    menuLabel: "GC Bill Done",
    title: "Update GC Bill Done",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
  {
    field: "conversionBillDone",
    menuLabel: "Conversion Bill Done",
    title: "Update Conversion Bill Done",
    actionLabel: (count) => `Update ${count} Customer${count === 1 ? "" : "s"}`,
  },
];

export const BULK_QUICK_ACTIONS: BulkQuickAction[] = [...BULK_ASSIGN_ACTIONS, ...BULK_UPDATE_ACTIONS];

// Field-specific success toasts (§ Toast) instead of a generic "updated" -
// reads straight off the typed `changes` payload rather than parsing the
// human-readable summary strings, so it stays correct if the display
// formatting ever changes.
export function buildBulkQuickSuccessMessage(
  action: BulkQuickAction,
  changes: CustomerBulkChanges,
  count: number,
  fieldOptions: ReturnType<typeof useBulkFieldOptions>,
): string {
  const plural = count === 1 ? "" : "s";

  if (action.field === "supervisorId") {
    return changes.supervisorId === null
      ? `${count} customer${plural} unassigned from their supervisor.`
      : `${count} customer${plural} assigned to ${
          fieldOptions.supervisors.find((supervisor) => supervisor.id === changes.supervisorId)?.name ??
          "the selected supervisor"
        }.`;
  }

  if (action.field === "plumberId") {
    return changes.plumberId === null
      ? `${count} customer${plural} unassigned from their plumber.`
      : `${count} customer${plural} assigned to ${
          fieldOptions.plumbers.find((plumber) => plumber.id === changes.plumberId)?.name ?? "the selected plumber"
        }.`;
  }

  if (action.field === "projectSite") {
    return `${count} customer${plural} moved.`;
  }

  if (isBulkBooleanField(action.field as CustomerBulkFieldKey)) {
    const value = changes[action.field as keyof CustomerBulkChanges];
    return `${count} customer${plural} marked ${action.menuLabel}${value === false ? ": No" : ""}.`;
  }

  return `${count} customer${plural} updated (${action.menuLabel}).`;
}
