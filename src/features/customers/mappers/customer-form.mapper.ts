import {
  appendEvidenceArray,
  type ImagePreviewItem,
} from "@/components/shared/ImageUploadPreview";
import { LMC_SIZE_TO_BACKEND, LMC_STATUS_TO_BACKEND, STATUS_TO_BACKEND } from "./customer.mapper";
import type { CustomerDocument, CustomerFormValues, LmcPipeSizeRecord } from "../types/customer.types";

export function mapFormValuesToBody(values: CustomerFormValues) {
  return {
    projectId: values.projectId,
    siteId: values.siteId || undefined,
    trBpNumber: values.customerConnection.trBpNo,
    mobileNumber: values.customerConnection.mobileNo || undefined,
    customerName: values.customerConnection.customerName,
    fullAddress: values.customerConnection.fullAddress || undefined,
    city: values.city || undefined,
    connectionType: values.customerConnection.connectionType,
    houseType: values.customerConnection.houseType || undefined,
    scheme: values.customerConnection.scheme || undefined,
    plumberId: values.customerConnection.plumberId || undefined,
    giReportNumber: values.customerConnection.reportNoGi || undefined,
    gcReportNumber: values.customerConnection.reportNoGc || undefined,
    conversionReportNumber: values.customerConnection.reportNoConversion || undefined,
    status: STATUS_TO_BACKEND[values.status],
    survey: values.survey,
    giMeasurements: values.giMeasurements,
    valvesRegulators: values.valvesRegulators,
    fittingsAccessories: values.fittingsAccessories,
    lmcPipelineWork: {
      fourMetresUnderGc: values.lmcPipelineWork.fourMetresUnderGc,
      fourMetresAboveGc: values.lmcPipelineWork.fourMetresAboveGc,
      tfHalfInch: values.lmcPipelineWork.tfHalfInch,
      tfOneInch: values.lmcPipelineWork.tfOneInch,
      pcc: values.lmcPipelineWork.pcc,
      rccNalaCrossing: values.lmcPipelineWork.rccNalaCrossing,
      paverBlocks: values.lmcPipelineWork.paverBlocks,
      malua: values.lmcPipelineWork.malua,
      hardRock: values.lmcPipelineWork.hardRock,
      approvalStatus: values.lmcPipelineWork.approvalStatus,
      approvalComments: values.lmcPipelineWork.approvalComments,
    },
    mdpeFittings: values.mdpeFittings,
    commissioningConversion: values.commissioningConversion,
    customFields: values.customFields,
    billingCompletion: {
      ...values.billingCompletion,
      jobCardDone: values.customerConnection.jobCardDone,
    },
  };
}

export function buildLmcPipeRecordFormData(record: LmcPipeSizeRecord): FormData {
  const formData = new FormData();
  formData.append("pipeSize", LMC_SIZE_TO_BACKEND[record.pipeSize] ?? "other");
  if (record.lengthMetres) formData.append("lengthMetres", record.lengthMetres);
  if (record.layingDate) formData.append("layingDate", record.layingDate);
  if (record.testingDate) formData.append("testingDate", record.testingDate);
  if (record.purgingDate) formData.append("purgingDate", record.purgingDate);
  formData.append("layingStatus", LMC_STATUS_TO_BACKEND[record.layingStatus] ?? "not_started");
  formData.append("testingStatus", LMC_STATUS_TO_BACKEND[record.testingStatus] ?? "not_started");
  formData.append("purgingStatus", LMC_STATUS_TO_BACKEND[record.purgingStatus] ?? "not_started");
  if (record.jointFittingDetails) formData.append("jointFittingDetails", record.jointFittingDetails);
  if (record.remarks) formData.append("remarks", record.remarks);
  appendEvidenceArray(formData, "evidence", record.evidence as unknown as ImagePreviewItem[]);
  return formData;
}

export function buildCustomerFormData(values: CustomerFormValues): FormData {
  const body = mapFormValuesToBody(values);
  const formData = new FormData();
  const surveyEvidence = (values.survey?.evidence ?? []) as unknown as ImagePreviewItem[];

  Object.entries(body).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "survey" && typeof value === "object") {
      formData.append(
        "survey",
        JSON.stringify({
          ...value,
          evidence: surveyEvidence
            .filter((item) => item.fileUrl && !item.file)
            .map((item) => ({
              id: item.id,
              label: item.label,
              fileName: item.fileName,
              fileUrl: item.fileUrl,
            })),
        }),
      );
      return;
    }

    formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
  });

  surveyEvidence
    .filter((item) => item.file)
    .forEach((item) => {
      formData.append("files", item.file!, item.fileName);
    });

  return formData;
}

/**
 * Metadata-only pipe-record payload for the atomic customer+pipe-records save
 * endpoint. New evidence *files* on a pipe record cannot travel through this
 * JSON-encoded array field (the backend's per-record file resolution expects
 * real multipart file parts, not JSON) - callers still upload those through
 * the existing single-record `PUT /customers/:id/lmc-pipes` endpoint for the
 * (rare) records that have brand-new evidence files staged.
 */
export function mapPipeRecordToBackendInput(record: LmcPipeSizeRecord) {
  return {
    pipeSize: LMC_SIZE_TO_BACKEND[record.pipeSize] ?? "other",
    lengthMetres: record.lengthMetres || undefined,
    layingDate: record.layingDate || undefined,
    testingDate: record.testingDate || undefined,
    purgingDate: record.purgingDate || undefined,
    layingStatus: LMC_STATUS_TO_BACKEND[record.layingStatus] ?? "not_started",
    testingStatus: LMC_STATUS_TO_BACKEND[record.testingStatus] ?? "not_started",
    purgingStatus: LMC_STATUS_TO_BACKEND[record.purgingStatus] ?? "not_started",
    jointFittingDetails: record.jointFittingDetails || undefined,
    remarks: record.remarks || undefined,
    evidence: record.evidence
      .filter((item) => !item.file)
      .map((item) => ({ id: item.id, label: item.label, fileName: item.fileName, fileUrl: item.fileUrl })),
  };
}

export function buildCustomerWithPipeRecordsFormData(
  values: CustomerFormValues,
  pipeRecords: LmcPipeSizeRecord[],
): FormData {
  const formData = buildCustomerFormData(values);
  formData.append("pipeRecords", JSON.stringify(pipeRecords.map(mapPipeRecordToBackendInput)));
  return formData;
}

export function buildDocumentFormData(doc: CustomerDocument): FormData {
  const formData = new FormData();
  formData.append("documentType", doc.type || doc.category);
  if (doc.category) formData.append("category", doc.category);
  if (doc.referenceNumber) formData.append("referenceNumber", doc.referenceNumber);
  if (doc.issueDate) formData.append("issueDate", doc.issueDate);
  if (doc.expiryDate) formData.append("expiryDate", doc.expiryDate);
  const amount = doc.amount ? Number(doc.amount.replace(/[^0-9.]/g, "")) : undefined;
  if (amount) formData.append("amount", String(amount));
  if (doc.remarks) formData.append("remarks", doc.remarks);

  if (doc.file) {
    formData.append("file", doc.file, doc.fileName || doc.file.name);
  } else {
    formData.append("fileUrl", doc.fileUrl || "");
    formData.append("fileName", doc.fileName || "document");
  }

  return formData;
}
