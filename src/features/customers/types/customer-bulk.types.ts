// Mirrors the backend's allowlisted bulk-update field set (customers-bulk.schema.ts).
// Identity fields (name/mobile/address/TR & report/meter numbers), unique
// report/meter identifiers, and individual technical measurements are
// deliberately absent - a bulk op can never touch them.
export type CustomerBulkChanges = {
  supervisorId?: string | null;
  plumberId?: string | null;
  projectId?: string;
  siteId?: string | null;
  scheme?: string;
  connectionType?: string;
  houseType?: string;
  status?: string;
  paymentStatus?: string;
  paymentMode?: string;
  initialAmount?: string;
  jmrDone?: boolean;
  jmrSubmittedInPbg?: boolean;
  giBillDone?: boolean;
  gcBillDone?: boolean;
  conversionBillDone?: boolean;
};

export type CustomerBulkResult = { count: number };

// Every field a bulk operation may touch, in one place - both the general
// BulkEditDialog (checkbox-gated, many at once) and the compact
// BulkQuickFieldDialog (single field, opened from the toolbar's Assign/
// Update menus) render off this same key set so there's exactly one
// definition of "what's bulk-editable" to keep in sync with the backend
// allowlist.
export type CustomerBulkFieldKey =
  | "supervisorId"
  | "plumberId"
  | "projectId"
  | "siteId"
  | "scheme"
  | "connectionType"
  | "houseType"
  | "status"
  | "paymentStatus"
  | "paymentMode"
  | "initialAmount"
  | "jmrDone"
  | "jmrSubmittedInPbg"
  | "giBillDone"
  | "gcBillDone"
  | "conversionBillDone";

// UI-only composite: "Project / Site" is edited as one logical group (the
// site picker depends on the chosen project) even though it maps to two
// separate payload keys.
export type CustomerBulkQuickField = CustomerBulkFieldKey | "projectSite";
