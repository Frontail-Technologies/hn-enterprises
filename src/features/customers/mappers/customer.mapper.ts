import { emptyCustomerConnection, emptyCustomerSurvey, emptyGiMeasurements, emptyValvesRegulators, emptyFittingsAccessories, emptyLmcPipelineWork, emptyMdpeFittings, emptyCommissioningConversion, emptyBillingCompletion, emptyPipeSizeRecord } from "../model/customer.defaults";
import { lmcPipeSizeOptions } from "../config/lmc-fields";
import { formatDate } from "../utils/format";
import type { CustomField, CustomFieldValueType } from "@/features/dynamic-fields/types";
import type {
  BillingCompletionStatus,
  CommissioningConversionDetails,
  Customer,
  CustomerConnectionDetails,
  CustomerCompletionAudit,
  CustomerDocument,
  CustomerNote,
  CustomerSectionCompletion,
  CustomerStatus,
  CustomerSurvey,
  FittingsAccessories,
  GiMeasurements,
  LmcEvidenceFile,
  LmcPipeSize,
  LmcPipeSizeRecord,
  LmcPipeStatus,
  LmcPipelineWork,
  MdpeFittings,
  ValvesRegulators,
} from "../types/customer.types";

export const STATUS_TO_BACKEND: Record<CustomerStatus, string> = {
  Draft: "draft",
  Pending: "pending",
  Active: "active",
  Inactive: "inactive",
  "On Hold": "on_hold",
  Completed: "completed",
  Archived: "archived",
};

const STATUS_TO_FRONTEND: Record<string, CustomerStatus> = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([frontend, backend]) => [
    backend,
    frontend as CustomerStatus,
  ]),
);

export const LMC_SIZE_TO_BACKEND: Record<LmcPipeSize, string> = {
  "20 mm": "20_mm",
  "32 mm": "32_mm",
  "63 mm": "63_mm",
  "90 mm": "90_mm",
  "125 mm": "125_mm",
  Other: "other",
};

const LMC_SIZE_TO_FRONTEND: Record<string, LmcPipeSize> = Object.fromEntries(
  Object.entries(LMC_SIZE_TO_BACKEND).map(([frontend, backend]) => [
    backend,
    frontend as LmcPipeSize,
  ]),
);

export const LMC_STATUS_TO_BACKEND: Record<LmcPipeStatus, string> = {
  "Not Started": "not_started",
  "In Progress": "in_progress",
  "Laying Completed": "laying_completed",
  "Testing Pending": "testing_pending",
  "Testing Completed": "testing_completed",
  "Purging Completed": "purging_completed",
  "Not Required": "not_required",
  "On Hold": "on_hold",
};

const LMC_STATUS_TO_FRONTEND: Record<string, LmcPipeStatus> = Object.fromEntries(
  Object.entries(LMC_STATUS_TO_BACKEND).map(([frontend, backend]) => [
    backend,
    frontend as LmcPipeStatus,
  ]),
);

export function toDateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

export function numOrEmpty(value: string | number | null | undefined) {
  return value == null || value === "" ? "" : String(value);
}

export type BackendCustomer = {
  id: string;
  projectId: string;
  siteId: string;
  trBpNumber: string;
  mobileNumber: string | null;
  customerName: string;
  fullAddress: string | null;
  city: string | null;
  connectionType: string | null;
  houseType: string | null;
  scheme: string | null;
  plumberId: string | null;
  plumberName: string | null;
  giReportNumber: string | null;
  gcReportNumber: string | null;
  conversionReportNumber: string | null;
  status: string;
  survey: Record<string, unknown> | null;
  giMeasurements: Record<string, unknown> | null;
  valvesRegulators: Record<string, unknown> | null;
  fittingsAccessories: Record<string, unknown> | null;
  lmcPipelineWork: Record<string, unknown> | null;
  mdpeFittings: Record<string, unknown> | null;
  commissioningConversion: Record<string, unknown> | null;
  billingCompletion: Record<string, unknown> | null;
  customFields: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  lmcPipeRecords?: BackendLmcPipeRecord[];
  documents?: BackendCustomerDocument[];
  project?: { id: string; name: string } | null;
  site?: { id: string; name: string } | null;
  sectionCompletion?: CustomerSectionCompletion;
  completionAudit?: CustomerCompletionAudit;
  latestComplaint?: {
    status: string;
    createdAt: string;
    resolvedAt: string | null;
    supervisorRemark: string | null;
  } | null;
};

export type BackendLmcPipeRecord = {
  id: string;
  pipeSize: string;
  lengthMetres: string | null;
  layingDate: string | null;
  testingDate: string | null;
  purgingDate: string | null;
  layingStatus: string;
  testingStatus: string;
  purgingStatus: string;
  jointFittingDetails: string | null;
  remarks: string | null;
  evidence: Record<string, unknown>[] | null;
};

export type BackendCustomerDocument = {
  id: string;
  documentType: string;
  category: string | null;
  referenceNumber: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  amount: string | null;
  fileUrl: string;
  fileName: string;
  status: string;
  remarks: string | null;
  uploadedAt: string;
};

export type BackendCustomerNote = {
  id: string;
  note: string;
  createdAt: string;
  author: { id: string; name: string } | null;
  /** Immutable snapshot - falls back to this when the author has been hard-deleted (author above is then null). */
  authorName: string | null;
};

export function mapNote(raw: BackendCustomerNote): CustomerNote {
  return {
    id: raw.id,
    note: raw.note,
    createdAt: raw.createdAt,
    authorName: raw.author?.name ?? raw.authorName ?? null,
  };
}

export function mapEvidenceFile(item: Record<string, unknown>, index: number): LmcEvidenceFile {
  const fileName = String(item.fileName ?? item.label ?? "");
  return {
    id:
      typeof item.id === "string" && item.id
        ? item.id
        : `evidence-${index}-${fileName}`,
    label:
      typeof item.label === "string" && item.label
        ? item.label
        : fileName.replace(/\.[^.]+$/, ""),
    fileName,
    fileUrl: typeof item.fileUrl === "string" ? item.fileUrl : undefined,
  };
}

export function mapPipeRecord(raw: BackendLmcPipeRecord): LmcPipeSizeRecord {
  return {
    id: raw.id,
    pipeSize: LMC_SIZE_TO_FRONTEND[raw.pipeSize] ?? "Other",
    lengthMetres: numOrEmpty(raw.lengthMetres),
    layingDate: toDateOnly(raw.layingDate),
    testingDate: toDateOnly(raw.testingDate),
    purgingDate: toDateOnly(raw.purgingDate),
    layingStatus: LMC_STATUS_TO_FRONTEND[raw.layingStatus] ?? "Not Started",
    testingStatus: LMC_STATUS_TO_FRONTEND[raw.testingStatus] ?? "Not Started",
    purgingStatus: LMC_STATUS_TO_FRONTEND[raw.purgingStatus] ?? "Not Started",
    jointFittingDetails: raw.jointFittingDetails ?? "",
    remarks: raw.remarks ?? "",
    evidence: raw.evidence?.length ? raw.evidence.map(mapEvidenceFile) : [],
  };
}

export function mapPipeRecords(records: BackendLmcPipeRecord[] | undefined): LmcPipeSizeRecord[] {
  const bySize = new Map(
    (records ?? []).map((record) => [
      LMC_SIZE_TO_FRONTEND[record.pipeSize] ?? "Other",
      record,
    ]),
  );
  return lmcPipeSizeOptions.map((size) =>
    bySize.has(size) ? mapPipeRecord(bySize.get(size)!) : emptyPipeSizeRecord(size),
  );
}

export function mapDocument(raw: BackendCustomerDocument): CustomerDocument {
  return {
    id: raw.id,
    type: raw.documentType,
    referenceNumber: raw.referenceNumber ?? "",
    category: raw.category ?? raw.documentType,
    issueDate: toDateOnly(raw.issueDate),
    expiryDate: toDateOnly(raw.expiryDate),
    amount: numOrEmpty(raw.amount),
    fileName: raw.fileName,
    fileUrl: raw.fileUrl,
    remarks: raw.remarks ?? "",
    uploadedOn: toDateOnly(raw.uploadedAt),
    uploadedBy: "",
    status: raw.status as CustomerDocument["status"],
  };
}

export function mapCustomer(raw: BackendCustomer): Customer {
  return {
    id: raw.id,
    status: STATUS_TO_FRONTEND[raw.status] ?? "Draft",
    projectId: raw.projectId,
    siteId: raw.siteId,
    projectName: raw.project?.name ?? "",
    siteArea: raw.site?.name ?? "",
    city: raw.city ?? "",
    createdDate: toDateOnly(raw.createdAt),
    updatedDate: toDateOnly(raw.updatedAt),
    customerConnection: {
      ...emptyCustomerConnection,
      trBpNo: raw.trBpNumber,
      mobileNo: raw.mobileNumber ?? "",
      customerName: raw.customerName,
      fullAddress: raw.fullAddress ?? "",
      connectionType:
        (raw.connectionType as CustomerConnectionDetails["connectionType"]) || "Domestic",
      houseType: raw.houseType ?? "",
      scheme: raw.scheme ?? "",
      plumberId: raw.plumberId ?? "",
      plumberName: raw.plumberName ?? "",
      reportNoGi: raw.giReportNumber ?? "",
      reportNoGc: raw.gcReportNumber ?? "",
      reportNoConversion: raw.conversionReportNumber ?? "",
      jobCardDone: String(
        (raw.billingCompletion as Record<string, unknown> | null)?.jobCardDone ?? "",
      ),
    },
    giMeasurements: {
      ...emptyGiMeasurements,
      ...(raw.giMeasurements as Partial<GiMeasurements> | null),
    },
    valvesRegulators: {
      ...emptyValvesRegulators,
      ...(raw.valvesRegulators as Partial<ValvesRegulators> | null),
    },
    fittingsAccessories: {
      ...emptyFittingsAccessories,
      ...(raw.fittingsAccessories as Partial<FittingsAccessories> | null),
    },
    lmcPipelineWork: {
      ...emptyLmcPipelineWork,
      ...(raw.lmcPipelineWork as Partial<LmcPipelineWork> | null),
      pipeRecords: mapPipeRecords(raw.lmcPipeRecords),
    },
    mdpeFittings: {
      ...emptyMdpeFittings,
      ...(raw.mdpeFittings as Partial<MdpeFittings> | null),
    },
    commissioningConversion: {
      ...emptyCommissioningConversion,
      ...(raw.commissioningConversion as Partial<CommissioningConversionDetails> | null),
    },
    billingCompletion: {
      ...emptyBillingCompletion,
      ...(raw.billingCompletion as Partial<BillingCompletionStatus> | null),
    },
    customFields: (raw.customFields as Record<string, string | boolean> | null) ?? {},
    survey: raw.survey
      ? { ...emptyCustomerSurvey, ...(raw.survey as Partial<CustomerSurvey>) }
      : undefined,
    media: [],
    documents: (raw.documents ?? []).map(mapDocument),
    sectionCompletion: raw.sectionCompletion,
    completionAudit: raw.completionAudit,
    latestComplaint: raw.latestComplaint,
  };
}

/**
 * Canonical read-only projection of dynamic custom fields (§13 of the
 * Checkpoint B brief): groups the active `CustomField[]` definitions the
 * current user may see, sorted for display, and formats a stored value per
 * its `valueType`. `CustomerCustomFieldsDetail` renders this; the editable
 * side of the same field definitions goes through
 * `customFieldsToFieldDefinitions` in `config/customer-fields.ts` instead,
 * since editable fields need an `input` kind rather than a display string.
 */
export function groupVisibleDynamicFields(fields: CustomField[], isAdmin: boolean): Record<string, CustomField[]> {
  const groups: Record<string, CustomField[]> = {};
  for (const field of fields) {
    if (!isAdmin && field.supervisorAccess === "Admin Only") continue;
    (groups[field.group] ??= []).push(field);
  }
  for (const key of Object.keys(groups)) {
    groups[key] = [...groups[key]].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return groups;
}

export function formatDynamicFieldValue(value: string | boolean | undefined, valueType: CustomFieldValueType): string {
  if (value === undefined || value === null || value === "") return "-";
  if (valueType === "Yes / No" || typeof value === "boolean") {
    return value === true || value === "true" ? "Yes" : "No";
  }
  if (valueType === "Date") return formatDate(String(value));
  return String(value);
}
