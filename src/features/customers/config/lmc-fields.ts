import type { LmcPipeSize, LmcPipeStatus } from "../types/customer.types";
import type { FieldDefinition } from "./customer-fields";
import type { LmcCivilWork, LmcPipeEditableFields } from "../model/lmc-pipeline.types";

export const lmcPipeSizeOptions = [
  "20 mm",
  "32 mm",
  "63 mm",
  "90 mm",
  "125 mm",
  "Other",
] as const;

export const lmcPipeStatusOptions = [
  "Not Started",
  "In Progress",
  "Laying Completed",
  "Testing Pending",
  "Testing Completed",
  "Purging Completed",
  "Not Required",
  "On Hold",
] as const satisfies readonly LmcPipeStatus[];

export const lmcPipelineFields: FieldDefinition<LmcCivilWork>[] = [
  { key: "fourMetresUnderGc", label: "4 Metres Under GC", input: "number" },
  { key: "fourMetresAboveGc", label: "4 Metres Above GC", input: "number" },
  { key: "tfHalfInch", label: "TF 1/2 inch", input: "number" },
  { key: "tfOneInch", label: "TF 1 inch", input: "number" },
  { key: "pcc", label: "PCC", input: "number" },
  { key: "rccNalaCrossing", label: "RCC / Nala Crossing", input: "number" },
  { key: "paverBlocks", label: "Paver Blocks", input: "number" },
  { key: "malua", label: "Malua", input: "number" },
  { key: "hardRock", label: "Hard Rock", input: "number" },
  {
    key: "approvalStatus",
    label: "Approval Status",
    input: "select",
    options: ["draft", "submitted", "approved", "rejected"],
  },
  { key: "approvalComments", label: "Approval Comments", input: "textarea" },
];

export const lmcPipeRecordFields: FieldDefinition<LmcPipeEditableFields>[] = [
  { key: "lengthMetres", label: "Length in Metres", input: "number" },
  { key: "layingDate", label: "Laying Date", input: "date" },
  { key: "testingDate", label: "Testing Date", input: "date" },
  { key: "purgingDate", label: "Purging Date", input: "date" },
  {
    key: "layingStatus",
    label: "Laying Status",
    input: "select",
    options: lmcPipeStatusOptions,
  },
  {
    key: "testingStatus",
    label: "Testing Status",
    input: "select",
    options: lmcPipeStatusOptions,
  },
  {
    key: "purgingStatus",
    label: "Purging Status",
    input: "select",
    options: lmcPipeStatusOptions,
  },
  {
    key: "jointFittingDetails",
    label: "Joint / Fitting Details",
    input: "textarea",
  },
  { key: "remarks", label: "Remarks", input: "textarea" },
  { key: "evidence", label: "Evidence Files" },
];

export type { LmcPipeSize };
