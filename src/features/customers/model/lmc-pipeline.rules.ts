import type { LmcOverallStatus, LmcPipeSizeRecord, LmcPipeStatus, LmcPipelineWork } from "../types/customer.types";
import type { LmcCivilWork, LmcPipeEditableFields } from "./lmc-pipeline.types";

export function deriveLmcOverallStatus(records: LmcPipeSizeRecord[]): LmcOverallStatus {
  const applicableRecords = records.filter(
    (record) => deriveLmcPipeCurrentStage(record) !== "Not Required",
  );

  if (!applicableRecords.length) return "Not Started";
  if (
    applicableRecords.some(
      (record) => deriveLmcPipeCurrentStage(record) === "On Hold",
    )
  )
    return "On Hold";
  if (
    applicableRecords.every(
      (record) => deriveLmcPipeCurrentStage(record) === "Purging Completed",
    )
  )
    return "Completed";
  if (
    applicableRecords.every(
      (record) => deriveLmcPipeCurrentStage(record) === "Not Started",
    )
  )
    return "Not Started";

  return "In Progress";
}

export function deriveLmcPipeCurrentStage(record: LmcPipeSizeRecord): LmcPipeStatus {
  if (
    record.layingStatus === "Not Required" &&
    record.testingStatus === "Not Required" &&
    record.purgingStatus === "Not Required"
  ) {
    return "Not Required";
  }

  if (
    record.layingStatus === "On Hold" ||
    record.testingStatus === "On Hold" ||
    record.purgingStatus === "On Hold"
  ) {
    return "On Hold";
  }

  if (record.purgingStatus === "Purging Completed") return "Purging Completed";
  if (record.testingStatus === "Testing Completed") return "Testing Completed";
  if (record.testingStatus === "Testing Pending") return "Testing Pending";
  if (record.layingStatus === "Laying Completed") return "Laying Completed";
  if (
    record.layingStatus === "In Progress" ||
    record.testingStatus === "In Progress" ||
    record.purgingStatus === "In Progress"
  ) {
    return "In Progress";
  }

  return "Not Started";
}

export function pickCivilFields(values: LmcPipelineWork): LmcCivilWork {
  return {
    fourMetresUnderGc: values.fourMetresUnderGc,
    fourMetresAboveGc: values.fourMetresAboveGc,
    tfHalfInch: values.tfHalfInch,
    tfOneInch: values.tfOneInch,
    pcc: values.pcc,
    rccNalaCrossing: values.rccNalaCrossing,
    paverBlocks: values.paverBlocks,
    malua: values.malua,
    hardRock: values.hardRock,
  };
}

export function pickPipeEditableFields(record: LmcPipeSizeRecord): Omit<LmcPipeEditableFields, "evidence"> {
  return {
    lengthMetres: record.lengthMetres,
    layingDate: record.layingDate,
    testingDate: record.testingDate,
    purgingDate: record.purgingDate,
    layingStatus: record.layingStatus,
    testingStatus: record.testingStatus,
    purgingStatus: record.purgingStatus,
    jointFittingDetails: record.jointFittingDetails,
    remarks: record.remarks,
  };
}
