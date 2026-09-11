import { STATUS_TO_BACKEND } from "../mappers/customer.mapper";
import { BULK_CLEAR_VALUE, BULK_YES_VALUE, isBulkBooleanField } from "../components/bulk/BulkFieldControl";
import type { CustomerBulkChanges, CustomerBulkFieldKey } from "../types/customer-bulk.types";
import type { useBulkFieldOptions } from "../hooks/useBulkFieldOptions";

type BulkFieldOptions = ReturnType<typeof useBulkFieldOptions>;

export const BULK_FIELD_LABELS: Record<CustomerBulkFieldKey, string> = {
  plumberId: "Plumber",
  projectId: "Project",
  siteId: "Site / Area",
  scheme: "Scheme",
  connectionType: "Connection Type",
  houseType: "House Type",
  status: "Customer Status",
  paymentStatus: "Payment Status",
  paymentMode: "Payment Mode",
  initialAmount: "Initial Amount",
  jmrDone: "JMR Done",
  jmrSubmittedInPbg: "JMR Submitted in PBG",
  giBillDone: "GI Bill Done",
  gcBillDone: "GC Bill Done",
  conversionBillDone: "Conversion Bill Done",
};

export function isBulkFieldValueSet(rawValue: string) {
  return rawValue.trim().length > 0;
}

export function bulkFieldToChange(
  field: CustomerBulkFieldKey,
  rawValue: string,
): Partial<CustomerBulkChanges> | null {
  if (!isBulkFieldValueSet(rawValue)) return null;

  if (isBulkBooleanField(field)) {
    return { [field]: rawValue === BULK_YES_VALUE } as Partial<CustomerBulkChanges>;
  }

  switch (field) {
    case "plumberId":
      return { plumberId: rawValue === BULK_CLEAR_VALUE ? null : rawValue };
    case "siteId":
      return { siteId: rawValue === BULK_CLEAR_VALUE ? null : rawValue };
    case "projectId":
      return { projectId: rawValue };
    case "scheme":
      return { scheme: rawValue };
    case "connectionType":
      return { connectionType: rawValue };
    case "houseType":
      return { houseType: rawValue };
    case "status":
      return { status: STATUS_TO_BACKEND[rawValue as keyof typeof STATUS_TO_BACKEND] ?? rawValue };
    case "paymentStatus":
      return { paymentStatus: rawValue };
    case "paymentMode":
      return { paymentMode: rawValue };
    case "initialAmount":
      return { initialAmount: rawValue };
    default:
      return null;
  }
}

export function bulkFieldDisplayValue(
  field: CustomerBulkFieldKey,
  rawValue: string,
  fieldOptions: BulkFieldOptions,
  siteName?: string,
): string {
  if (!isBulkFieldValueSet(rawValue)) return "";
  if (rawValue === BULK_CLEAR_VALUE) return "Cleared";
  if (isBulkBooleanField(field)) return rawValue === BULK_YES_VALUE ? "Yes" : "No";

  switch (field) {
    case "plumberId":
      return fieldOptions.plumbers.find((plumber) => plumber.id === rawValue)?.name ?? rawValue;
    case "projectId":
      return fieldOptions.projects.find((project) => project.id === rawValue)?.name ?? rawValue;
    case "siteId":
      return siteName ?? rawValue;
    default:
      return rawValue;
  }
}
