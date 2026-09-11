import type { LmcPipelineWork, LmcPipeSizeRecord } from "../types/customer.types";

export type LmcCivilWork = Pick<
  LmcPipelineWork,
  | "fourMetresUnderGc"
  | "fourMetresAboveGc"
  | "tfHalfInch"
  | "tfOneInch"
  | "pcc"
  | "rccNalaCrossing"
  | "paverBlocks"
  | "malua"
  | "hardRock"
  | "approvalStatus"
  | "approvalComments"
>;

export type LmcPipeEditableFields = Omit<LmcPipeSizeRecord, "id" | "pipeSize">;
