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

export type CustomerBulkQuickField = CustomerBulkFieldKey | "projectSite";
