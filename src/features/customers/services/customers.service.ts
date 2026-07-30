import { apiRequest } from "@/lib/api-client";
import type { MasterSheetColumnValueType } from "@/features/management/masters.config";
import { getActiveMasterSheetColumns } from "@/features/management/masters.config";
import type {
  BillingCompletionStatus,
  CommissioningConversionDetails,
  Customer,
  CustomerConnectionDetails,
  CustomerDocument,
  CustomerFormValues,
  CustomerStatus,
  CustomerSurvey,
  CustomerSurveyApprovalStatus,
  CustomerSurveyWorkableStatus,
  FittingsAccessories,
  GiMeasurements,
  ImportPreviewRow,
  LmcOverallStatus,
  LmcPipeSizeRecord,
  LmcPipeSize,
  LmcPipeStatus,
  LmcPipelineWork,
  MdpeFittings,
  ValvesRegulators,
} from "../types/customer.types";

export type FieldDefinition<T> = {
  key: keyof T;
  label: string;
  input?: "text" | "number" | "date" | "textarea" | "select" | "boolean";
  options?: readonly string[];
  readOnly?: boolean;
};

export type CustomerMasterSheetColumn = {
  key: string;
  label: string;
  group: string;
  width?: number;
  sticky?: boolean;
  valueType?: MasterSheetColumnValueType;
  required?: boolean;
  dropdownOptions?: string[];
};

export type CustomerMasterSheetRow = {
  id: string;
  customerId: string;
  values: Record<string, string>;
};

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
>;

export const connectionTypeOptions = ["Domestic", "Commercial", "Industrial"] as const;
export const customerStatusOptions = [
  "Draft",
  "Pending",
  "Active",
  "Inactive",
  "On Hold",
  "Completed",
  "Archived",
] as const satisfies readonly CustomerStatus[];
export const paymentStatusOptions = ["Pending", "In Review", "Approved", "Rejected", "Completed"] as const;
export const surveyWorkableStatusOptions = ["Workable", "Partially Workable", "Not Workable"] as const satisfies readonly CustomerSurveyWorkableStatus[];
export const surveyApprovalStatusOptions = ["Draft", "Submitted", "In Review", "Approved", "Sent Back", "Rejected"] as const satisfies readonly CustomerSurveyApprovalStatus[];
export const surveyConditionStatusOptions = ["Workable", "Partially Workable", "Not Workable", "Approved", "Rejected", "Pending"] as const;
export const customerDocumentCategories = [
  "Customer Photo",
  "ID / Address Proof",
  "Meter Photo",
  "GI Report",
  "GC Report",
  "Conversion Report",
  "LMC / Site Evidence",
  "Payment Receipt",
  "Other",
];
export const yesNoOptions = ["Yes", "No"] as const;
export const lmcPipeSizeOptions = ["20 mm", "32 mm", "63 mm", "90 mm", "125 mm", "Other"] as const;
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

export const customerConnectionFields: FieldDefinition<CustomerConnectionDetails>[] = [
  { key: "customerName", label: "Customer Name" },
  { key: "mobileNo", label: "Mobile Number" },
  { key: "trBpNo", label: "BP / TR Number" },
  { key: "fullAddress", label: "Address", input: "textarea" },
  { key: "connectionType", label: "Connection Type", input: "select", options: connectionTypeOptions },
  { key: "houseType", label: "House Type" },
  { key: "scheme", label: "Scheme" },
  { key: "plumberName", label: "Assigned Plumber" },
  { key: "supervisorName", label: "Assigned Supervisor" },
  { key: "jobCardDone", label: "Job Card Done", input: "select", options: yesNoOptions },
  { key: "reportNoGi", label: "GI Report Number", readOnly: true },
  { key: "reportNoGc", label: "GC Report Number", readOnly: true },
  { key: "reportNoConversion", label: "Conversion Report Number", readOnly: true },
];

export const giMeasurementFields: FieldDefinition<GiMeasurements>[] = [
  { key: "tfToRegulator", label: "TF to Regulator", input: "number" },
  { key: "inlet", label: "Inlet", input: "number" },
  { key: "outlet", label: "Outlet", input: "number" },
  { key: "totalGiPipeHalfInch", label: "Total GI Pipe 1/2 inch", input: "number" },
  { key: "giPipeThreeQuarterInch", label: "GI Pipe 3/4 inch", input: "number" },
  { key: "giPipeOneInch", label: "GI Pipe 1 inch", input: "number" },
  { key: "giPipeOneAndHalfInch", label: "1.5 inch GI Pipe Measurement", input: "number" },
  { key: "giPipeTwoInch", label: "2 inch GI Pipe Measurement", input: "number" },
];

export const isolationValveFields: FieldDefinition<ValvesRegulators>[] = [
  { key: "isolationValveHalfInch", label: "Isolation Valve 1/2 inch", input: "number" },
  { key: "isolationValveThreeQuarterInch", label: "Isolation Valve 3/4 inch", input: "number" },
  { key: "isolationValveOneInch", label: "Isolation Valve 1 inch", input: "number" },
  { key: "isolationValveOneAndHalfInch", label: "Isolation Valve 1.5 inch", input: "number" },
  { key: "isolationValveTwoInch", label: "Isolation Valve 2 inch", input: "number" },
  { key: "applianceValveHalfInch", label: "Appliance Valve 1/2 inch", input: "number" },
  { key: "regulator6BarTo100Mbar", label: "Regulator 6 Bar-100 mBar", input: "number" },
  { key: "regulator6BarTo21Mbar", label: "Regulator 6 Bar-21 mBar", input: "number" },
  { key: "regulator100MbarTo21Mbar", label: "Regulator 100 mBar-21 mBar", input: "number" },
  { key: "warningPlate", label: "Warning Plate", input: "number" },
];

export const fittingAccessoryFields: FieldDefinition<FittingsAccessories>[] = [
  { key: "clampHalfInch", label: "Clamp 1/2 inch", input: "number" },
  { key: "clamp3InchToHalfInch", label: "Clamp 3 inch-1/2 inch", input: "number" },
  { key: "elbowHalfInch", label: "Elbow 1/2 inch", input: "number" },
  { key: "mfElbowHalfInch", label: "M/F Elbow 1/2 inch", input: "number" },
  { key: "socketHalfInch", label: "Socket 1/2 inch", input: "number" },
  { key: "teeHalfInch", label: "Tee 1/2 inch", input: "number" },
  { key: "nipple2Inch", label: "Nipple 2 inch", input: "number" },
  { key: "nipple3Inch", label: "Nipple 3 inch", input: "number" },
  { key: "nipple4Inch", label: "Nipple 4 inch", input: "number" },
  { key: "reducerElbowThreeQuarterToHalfInch", label: "Reducer Elbow 3/4 inch-1/2 inch", input: "number" },
  { key: "threeQuarterInchTo3Inch", label: "3/4 inch-3 inch", input: "number" },
  { key: "unionHalfInch", label: "Union 1/2 inch", input: "number" },
  { key: "plugHalfInch", label: "Plug 1/2 inch", input: "number" },
  { key: "fittingsOneAndHalfInchQuantity", label: "1.5 inch Fittings Quantity", input: "number" },
  { key: "fittingsTwoInchQuantity", label: "2 inch Fittings Quantity", input: "number" },
  { key: "extraGiAbove10Metres", label: "Extra GI Above 10 Metres", input: "number" },
];

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
];

export type LmcPipeEditableFields = Omit<LmcPipeSizeRecord, "id" | "pipeSize">;

export const lmcPipeRecordFields: FieldDefinition<LmcPipeEditableFields>[] = [
  { key: "lengthMetres", label: "Length in Metres", input: "number" },
  { key: "layingDate", label: "Laying Date", input: "date" },
  { key: "testingDate", label: "Testing Date", input: "date" },
  { key: "purgingDate", label: "Purging Date", input: "date" },
  { key: "layingStatus", label: "Laying Status", input: "select", options: lmcPipeStatusOptions },
  { key: "testingStatus", label: "Testing Status", input: "select", options: lmcPipeStatusOptions },
  { key: "purgingStatus", label: "Purging Status", input: "select", options: lmcPipeStatusOptions },
  { key: "jointFittingDetails", label: "Joint / Fitting Details", input: "textarea" },
  { key: "remarks", label: "Remarks", input: "textarea" },
  { key: "evidence", label: "Evidence Files" },
];

export const mdpeFittingFields: FieldDefinition<MdpeFittings>[] = [
  { key: "saddle90To32Mm", label: "Saddle 90-32 mm", input: "number" },
  { key: "saddle90Mm", label: "90 mm Saddle", input: "number" },
  { key: "saddle63To32Mm", label: "Saddle 63-32 mm", input: "number" },
  { key: "saddle32To20Mm", label: "Saddle 32-20 mm", input: "number" },
  { key: "tee90Mm", label: "90 mm Tee", input: "number" },
  { key: "tee32Mm", label: "Tee 32 mm", input: "number" },
  { key: "tee20Mm", label: "Tee 20 mm", input: "number" },
  { key: "reducerCoupler90To63Mm", label: "90-63 mm Reducer Coupler", input: "number" },
  { key: "reducerCoupler63To32Mm", label: "Reducer Coupler 63-32 mm", input: "number" },
  { key: "reducerCoupler32To20Mm", label: "Reducer Coupler 32-20 mm", input: "number" },
  { key: "coupler90Mm", label: "90 mm Coupler", input: "number" },
  { key: "coupler32Mm", label: "Coupler 32 mm", input: "number" },
  { key: "coupler20Mm", label: "Coupler 20 mm", input: "number" },
  { key: "endCap90Mm", label: "90 mm End Cap", input: "number" },
];

export const commissioningConversionFields: FieldDefinition<CommissioningConversionDetails>[] = [
  { key: "meterNo", label: "Meter No." },
  { key: "installationDate", label: "Installation Date", input: "date" },
  { key: "commissioningDate", label: "Commissioning Date", input: "date" },
  { key: "conversionDate", label: "Conversion Date", input: "date" },
  { key: "regulatorPressure", label: "Regulator Pressure" },
  { key: "regulatorNo", label: "Regulator No." },
  { key: "meterType", label: "Meter Type" },
  { key: "meterReading", label: "Meter Reading" },
  { key: "nonConversionRemark", label: "Non-Conversion Remark", input: "textarea" },
];

export const billingCompletionFields: FieldDefinition<BillingCompletionStatus>[] = [
  { key: "paymentStatus", label: "Payment Status", input: "select", options: paymentStatusOptions },
  { key: "paymentMode", label: "Payment Mode" },
  { key: "initialAmount", label: "Initial Amount", input: "number" },
  { key: "jmrDone", label: "JMR Done", input: "boolean" },
  { key: "jmrSubmittedInPbg", label: "JMR Submitted in PBG", input: "boolean" },
  { key: "giBillDone", label: "GI Bill Done", input: "boolean" },
  { key: "gcBillDone", label: "GC Bill Done", input: "boolean" },
  { key: "conversionBillDone", label: "Conversion Bill Done", input: "boolean" },
  { key: "remark", label: "Remark", input: "textarea" },
];

const baseCustomerMasterSheetColumns: CustomerMasterSheetColumn[] = [
  { key: "reportNoGi", label: "Report No-GI", group: "Reports", width: 150, sticky: true },
  { key: "reportNoGc", label: "Report No-GC", group: "Reports", width: 150, sticky: true },
  { key: "reportNoConversion", label: "Report No-Conversion", group: "Reports", width: 180, sticky: true },
  { key: "trBpNo", label: "TR No.", group: "Customer", width: 150, sticky: true },
  { key: "customerName", label: "Customer Name", group: "Customer", width: 190 },
  { key: "mobileNo", label: "Mobile No.", group: "Customer", width: 130 },
  { key: "fullAddress", label: "Full Address", group: "Customer", width: 260 },
  { key: "projectName", label: "Project", group: "Project", width: 190 },
  { key: "siteArea", label: "Site / Area", group: "Project", width: 170 },
  { key: "city", label: "City", group: "Project", width: 120 },
  { key: "paymentStatus", label: "Payment Status", group: "Payment", width: 140 },
  { key: "paymentMode", label: "Payment Mode", group: "Payment", width: 130 },
  { key: "initialAmount", label: "Initial Amount", group: "Payment", width: 140 },
  { key: "scheme", label: "Scheme", group: "Customer", width: 130 },
  { key: "surveyDate", label: "Survey Date", group: "Survey", width: 130 },
  { key: "workableStatus", label: "Workable Status", group: "Survey", width: 150 },
  { key: "surveyRemarks", label: "Survey Remarks", group: "Survey", width: 220 },
  { key: "plumberName", label: "Plumber Name", group: "Assignment", width: 150 },
  { key: "supervisorName", label: "Supervisor Name", group: "Assignment", width: 160 },
  { key: "meterNo", label: "Meter No.", group: "Meter", width: 140 },
  { key: "installationDate", label: "Installation Date", group: "Meter", width: 150 },
  { key: "jobCardDone", label: "Job Card Done", group: "Customer", width: 140 },
  { key: "connectionType", label: "Connection Type", group: "Customer", width: 150 },
  { key: "houseType", label: "House Type", group: "Customer", width: 140 },
  { key: "tfToRegulator", label: "TF to Regulator GI Measurement", group: "GI", width: 210 },
  { key: "inlet", label: "Inlet GI Measurement", group: "GI", width: 180 },
  { key: "outlet", label: "Outlet GI Measurement", group: "GI", width: 180 },
  { key: "totalGiPipeHalfInch", label: "Total GI Pipe 1/2 inch", group: "GI", width: 180 },
  { key: "giPipeThreeQuarterInch", label: "GI Pipe 3/4 inch", group: "GI", width: 160 },
  { key: "giPipeOneInch", label: "GI Pipe 1 inch", group: "GI", width: 140 },
  { key: "giPipeOneAndHalfInch", label: "GI Pipe 1.5 inch Welded", group: "GI", width: 190 },
  { key: "giPipeTwoInch", label: "GI Pipe 2 inch Welded", group: "GI", width: 180 },
  { key: "isolationValveHalfInch", label: "Isolation Valve 1/2 inch", group: "Valves", width: 190 },
  { key: "isolationValveThreeQuarterInch", label: "Isolation Valve 3/4 inch", group: "Valves", width: 190 },
  { key: "isolationValveOneInch", label: "Isolation Valve 1 inch", group: "Valves", width: 170 },
  { key: "isolationValveOneAndHalfInch", label: "Isolation Valve 1.5 inch", group: "Valves", width: 180 },
  { key: "isolationValveTwoInch", label: "Isolation Valve 2 inch", group: "Valves", width: 170 },
  { key: "applianceValveHalfInch", label: "Appliance Valve 1/2 inch", group: "Valves", width: 190 },
  { key: "regulator6BarTo100Mbar", label: "Regulator 6Bar-100mBar", group: "Regulators", width: 190 },
  { key: "regulator6BarTo21Mbar", label: "Regulator 6Bar-21mBar", group: "Regulators", width: 180 },
  { key: "regulator100MbarTo21Mbar", label: "Regulator 100mBar-21mBar", group: "Regulators", width: 200 },
  { key: "warningPlate", label: "Warning Plate", group: "Regulators", width: 140 },
  { key: "clampHalfInch", label: "Clamp 1/2 inch", group: "Fittings", width: 140 },
  { key: "clamp3InchToHalfInch", label: "Clamp 3 inch-1/2 inch", group: "Fittings", width: 180 },
  { key: "elbowHalfInch", label: "Elbow 1/2 inch", group: "Fittings", width: 140 },
  { key: "mfElbowHalfInch", label: "M/F Elbow 1/2 inch", group: "Fittings", width: 160 },
  { key: "socketHalfInch", label: "Socket 1/2 inch", group: "Fittings", width: 150 },
  { key: "teeHalfInch", label: "Tee 1/2 inch", group: "Fittings", width: 130 },
  { key: "nipple2Inch", label: "Nipple 2 inch", group: "Fittings", width: 130 },
  { key: "nipple3Inch", label: "Nipple 3 inch", group: "Fittings", width: 130 },
  { key: "nipple4Inch", label: "Nipple 4 inch", group: "Fittings", width: 130 },
  { key: "reducerElbowThreeQuarterToHalfInch", label: "Reducer Elbow 3/4-1/2 inch", group: "Fittings", width: 210 },
  { key: "threeQuarterInchTo3Inch", label: "3/4 inch-3 inch", group: "Fittings", width: 150 },
  { key: "unionHalfInch", label: "Union 1/2 inch", group: "Fittings", width: 140 },
  { key: "plugHalfInch", label: "Plug 1/2 inch", group: "Fittings", width: 130 },
  { key: "extraGiAbove10Metres", label: "Extra GI Above 10 Metres", group: "Fittings", width: 200 },
  { key: "pipe20Length", label: "20 mm Pipe Length", group: "LMC", width: 160 },
  { key: "pipe20LayingDate", label: "20 mm Laying Date", group: "LMC", width: 160 },
  { key: "pipe20TestingDate", label: "20 mm Testing Date", group: "LMC", width: 160 },
  { key: "pipe20PurgingDate", label: "20 mm Purging Date", group: "LMC", width: 160 },
  { key: "pipe32Length", label: "32 mm Pipe Length", group: "LMC", width: 160 },
  { key: "pipe63Length", label: "63 mm Pipe Length", group: "LMC", width: 160 },
  { key: "pipe90Length", label: "90 mm Pipe Length", group: "LMC", width: 160 },
  { key: "pipe125Length", label: "125 mm Pipe Length", group: "LMC", width: 170 },
  { key: "fourMetresUnderGc", label: "4 Metres Under GC", group: "LMC", width: 160 },
  { key: "fourMetresAboveGc", label: "4 Metres Above GC", group: "LMC", width: 160 },
  { key: "tfHalfInch", label: "TF 1/2 inch", group: "LMC", width: 130 },
  { key: "tfOneInch", label: "TF 1 inch", group: "LMC", width: 120 },
  { key: "pcc", label: "PCC", group: "Civil", width: 100 },
  { key: "rccNalaCrossing", label: "RCC / Nala Crossing", group: "Civil", width: 170 },
  { key: "paverBlocks", label: "Paver Blocks", group: "Civil", width: 140 },
  { key: "malua", label: "Malua", group: "Civil", width: 110 },
  { key: "hardRock", label: "Hard Rock", group: "Civil", width: 120 },
  { key: "saddle90To32Mm", label: "Saddle 90-32 mm", group: "MDPE", width: 150 },
  { key: "saddle63To32Mm", label: "Saddle 63-32 mm", group: "MDPE", width: 150 },
  { key: "saddle32To20Mm", label: "Saddle 32-20 mm", group: "MDPE", width: 150 },
  { key: "tee32Mm", label: "Tee 32 mm", group: "MDPE", width: 120 },
  { key: "tee20Mm", label: "Tee 20 mm", group: "MDPE", width: 120 },
  { key: "reducerCoupler63To32Mm", label: "Reducer Coupler 63-32 mm", group: "MDPE", width: 210 },
  { key: "reducerCoupler32To20Mm", label: "Reducer Coupler 32-20 mm", group: "MDPE", width: 210 },
  { key: "coupler32Mm", label: "Coupler 32 mm", group: "MDPE", width: 140 },
  { key: "coupler20Mm", label: "Coupler 20 mm", group: "MDPE", width: 140 },
  { key: "coupler90Mm", label: "90 mm Coupler", group: "MDPE", width: 140 },
  { key: "reducerCoupler90To63Mm", label: "90-63 mm Reducer Coupler", group: "MDPE", width: 210 },
  { key: "tee90Mm", label: "90 mm Tee", group: "MDPE", width: 120 },
  { key: "endCap90Mm", label: "90 mm End Cap", group: "MDPE", width: 140 },
  { key: "commissioningDate", label: "Commissioning Date", group: "Commissioning", width: 160 },
  { key: "conversionDate", label: "Conversion Date", group: "Commissioning", width: 150 },
  { key: "regulatorPressure", label: "Regulator Pressure", group: "Commissioning", width: 160 },
  { key: "regulatorNo", label: "Regulator No.", group: "Commissioning", width: 140 },
  { key: "meterType", label: "Meter Type", group: "Commissioning", width: 130 },
  { key: "meterReading", label: "Meter Reading", group: "Commissioning", width: 140 },
  { key: "nonConversionRemark", label: "Non Conversion Remark", group: "Commissioning", width: 220 },
  { key: "jmrDone", label: "JMR Done", group: "Billing", width: 120 },
  { key: "jmrSubmittedInPbg", label: "JMR Submitted in PBG", group: "Billing", width: 180 },
  { key: "giBillDone", label: "GI Bill Done", group: "Billing", width: 130 },
  { key: "gcBillDone", label: "GC Bill Done", group: "Billing", width: 130 },
  { key: "conversionBillDone", label: "Conversion Bill Done", group: "Billing", width: 170 },
  { key: "billingRemark", label: "Remark", group: "Billing", width: 220 },
];

export const customerMasterSheetColumns: CustomerMasterSheetColumn[] = [
  ...baseCustomerMasterSheetColumns,
  ...getActiveMasterSheetColumns().map((column) => ({
    key: column.key,
    label: column.label,
    group: column.group,
    width: column.width,
    valueType: column.valueType,
    required: column.required,
    dropdownOptions: column.dropdownOptions,
  })),
];

export const emptyGiMeasurements: GiMeasurements = {
  tfToRegulator: "",
  inlet: "",
  outlet: "",
  totalGiPipeHalfInch: "",
  giPipeThreeQuarterInch: "",
  giPipeOneInch: "",
  giPipeOneAndHalfInch: "",
  giPipeTwoInch: "",
};

export const emptyValvesRegulators: ValvesRegulators = {
  isolationValveHalfInch: "",
  isolationValveThreeQuarterInch: "",
  isolationValveOneInch: "",
  isolationValveOneAndHalfInch: "",
  isolationValveTwoInch: "",
  applianceValveHalfInch: "",
  regulator6BarTo100Mbar: "",
  regulator6BarTo21Mbar: "",
  regulator100MbarTo21Mbar: "",
  warningPlate: "",
};

export const emptyFittingsAccessories: FittingsAccessories = {
  clampHalfInch: "",
  clamp3InchToHalfInch: "",
  elbowHalfInch: "",
  mfElbowHalfInch: "",
  socketHalfInch: "",
  teeHalfInch: "",
  nipple2Inch: "",
  nipple3Inch: "",
  nipple4Inch: "",
  reducerElbowThreeQuarterToHalfInch: "",
  threeQuarterInchTo3Inch: "",
  unionHalfInch: "",
  plugHalfInch: "",
  fittingsOneAndHalfInchQuantity: "",
  fittingsTwoInchQuantity: "",
  extraGiAbove10Metres: "",
};

export const emptyCustomerConnection: CustomerConnectionDetails = {
  reportNoGi: "",
  reportNoGc: "",
  reportNoConversion: "",
  trBpNo: "",
  mobileNo: "",
  customerName: "",
  fullAddress: "",
  scheme: "",
  plumberName: "",
  supervisorName: "",
  jobCardDone: "",
  connectionType: "Domestic",
  houseType: "",
};

export const emptyCustomerSurvey: CustomerSurvey = {
  id: "survey-draft",
  surveyId: "",
  surveyDate: "",
  assignedSurveyor: "",
  submittedBy: "",
  submissionDate: "",
  latitude: 0,
  longitude: 0,
  captureAccuracy: "",
  workableStatus: "Workable",
  approvalStatus: "Draft",
  initialMeasurements: "",
  siteAccessibility: "Pending",
  meterPlacement: "Pending",
  pipelineRoute: "Pending",
  civilWorkRequired: "No",
  obstaclesRemarks: "",
  notes: "",
  reason: "",
  recommendedAction: "",
  expectedResolutionDate: "",
  approvalComments: "",
  photos: [],
  revisions: [],
};

export function emptyPipeSizeRecord(pipeSize: LmcPipeSize): LmcPipeSizeRecord {
  return {
    id: `pipe-${pipeSize.toLowerCase().replace(/\s+/g, "-")}`,
    pipeSize,
    lengthMetres: "",
    layingDate: "",
    testingDate: "",
    purgingDate: "",
    layingStatus: "Not Started",
    testingStatus: "Not Started",
    purgingStatus: "Not Started",
    jointFittingDetails: "",
    remarks: "",
    evidence: "",
  };
}

export const emptyLmcPipelineWork: LmcPipelineWork = {
  pipeRecords: lmcPipeSizeOptions.map((size) => emptyPipeSizeRecord(size)),
  fourMetresUnderGc: "",
  fourMetresAboveGc: "",
  tfHalfInch: "",
  tfOneInch: "",
  pcc: "",
  rccNalaCrossing: "",
  paverBlocks: "",
  malua: "",
  hardRock: "",
};

export const emptyMdpeFittings: MdpeFittings = {
  saddle90To32Mm: "",
  saddle90Mm: "",
  saddle63To32Mm: "",
  saddle32To20Mm: "",
  tee90Mm: "",
  tee32Mm: "",
  tee20Mm: "",
  reducerCoupler90To63Mm: "",
  reducerCoupler63To32Mm: "",
  reducerCoupler32To20Mm: "",
  coupler90Mm: "",
  coupler32Mm: "",
  coupler20Mm: "",
  endCap90Mm: "",
};

export const emptyCommissioningConversion: CommissioningConversionDetails = {
  meterNo: "",
  installationDate: "",
  commissioningDate: "",
  conversionDate: "",
  regulatorPressure: "",
  regulatorNo: "",
  meterType: "",
  meterReading: "",
  nonConversionRemark: "",
};

export const emptyBillingCompletion: BillingCompletionStatus = {
  paymentStatus: "Pending",
  paymentMode: "",
  initialAmount: "",
  jmrDone: false,
  jmrSubmittedInPbg: false,
  giBillDone: false,
  gcBillDone: false,
  conversionBillDone: false,
  remark: "",
};

export const defaultCustomerFormValues: CustomerFormValues = {
  status: "Draft",
  projectId: "",
  siteId: "",
  projectName: "",
  siteArea: "",
  city: "",
  customerConnection: emptyCustomerConnection,
  giMeasurements: emptyGiMeasurements,
  valvesRegulators: emptyValvesRegulators,
  fittingsAccessories: emptyFittingsAccessories,
  lmcPipelineWork: emptyLmcPipelineWork,
  mdpeFittings: emptyMdpeFittings,
  commissioningConversion: emptyCommissioningConversion,
  billingCompletion: emptyBillingCompletion,
  survey: undefined,
  media: [],
  documents: [],
};

export function deriveLmcOverallStatus(records: LmcPipeSizeRecord[]): LmcOverallStatus {
  const applicableRecords = records.filter((record) => deriveLmcPipeCurrentStage(record) !== "Not Required");

  if (!applicableRecords.length) return "Not Started";
  if (applicableRecords.some((record) => deriveLmcPipeCurrentStage(record) === "On Hold")) return "On Hold";
  if (applicableRecords.every((record) => deriveLmcPipeCurrentStage(record) === "Purging Completed")) return "Completed";
  if (applicableRecords.every((record) => deriveLmcPipeCurrentStage(record) === "Not Started")) return "Not Started";

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

export function getCustomerMasterSheetRows(sourceCustomers: Customer[]): CustomerMasterSheetRow[] {
  return sourceCustomers.map((customer) => {
    const connection = customer.customerConnection;
    const gi = customer.giMeasurements;
    const valves = customer.valvesRegulators;
    const fittings = customer.fittingsAccessories;
    const lmc = customer.lmcPipelineWork;
    const mdpe = customer.mdpeFittings;
    const commissioning = customer.commissioningConversion;
    const billing = customer.billingCompletion;
    const pipe20 = getPipeRecord(lmc.pipeRecords, "20 mm");
    const pipe32 = getPipeRecord(lmc.pipeRecords, "32 mm");
    const pipe63 = getPipeRecord(lmc.pipeRecords, "63 mm");
    const pipe90 = getPipeRecord(lmc.pipeRecords, "90 mm");
    const pipe125 = getPipeRecord(lmc.pipeRecords, "125 mm");

    return {
      id: customer.id,
      customerId: customer.id,
      values: {
        customerName: connection.customerName,
        trBpNo: connection.trBpNo,
        reportNoGi: connection.reportNoGi,
        reportNoGc: connection.reportNoGc,
        reportNoConversion: connection.reportNoConversion,
        mobileNo: connection.mobileNo,
        fullAddress: connection.fullAddress,
        projectName: customer.projectName,
        siteArea: customer.siteArea,
        city: customer.city,
        paymentStatus: String(billing.paymentStatus),
        paymentMode: billing.paymentMode,
        initialAmount: billing.initialAmount,
        preferredPaymentType: billing.paymentMode,
        kycVerified: customer.documents?.some((document) => document.category === "ID / Address Proof" && document.status === "Approved") ? "Yes" : "No",
        lastPaymentDate: billing.paymentStatus === "Completed" ? commissioning.conversionDate : "",
        scheme: connection.scheme,
        surveyDate: customer.survey?.surveyDate ?? "",
        workableStatus: customer.survey?.workableStatus ?? "",
        surveyRemarks: customer.survey?.obstaclesRemarks ?? customer.survey?.notes ?? "",
        plumberName: connection.plumberName,
        supervisorName: connection.supervisorName,
        meterNo: commissioning.meterNo,
        installationDate: commissioning.installationDate,
        jobCardDone: connection.jobCardDone,
        connectionType: connection.connectionType,
        houseType: connection.houseType,
        tfToRegulator: gi.tfToRegulator,
        inlet: gi.inlet,
        outlet: gi.outlet,
        totalGiPipeHalfInch: gi.totalGiPipeHalfInch,
        giPipeThreeQuarterInch: gi.giPipeThreeQuarterInch,
        giPipeOneInch: gi.giPipeOneInch,
        giPipeOneAndHalfInch: gi.giPipeOneAndHalfInch,
        giPipeTwoInch: gi.giPipeTwoInch,
        isolationValveHalfInch: valves.isolationValveHalfInch,
        isolationValveThreeQuarterInch: valves.isolationValveThreeQuarterInch,
        isolationValveOneInch: valves.isolationValveOneInch,
        isolationValveOneAndHalfInch: valves.isolationValveOneAndHalfInch,
        isolationValveTwoInch: valves.isolationValveTwoInch,
        applianceValveHalfInch: valves.applianceValveHalfInch,
        regulator6BarTo100Mbar: valves.regulator6BarTo100Mbar,
        regulator6BarTo21Mbar: valves.regulator6BarTo21Mbar,
        regulator100MbarTo21Mbar: valves.regulator100MbarTo21Mbar,
        warningPlate: valves.warningPlate,
        clampHalfInch: fittings.clampHalfInch,
        clamp3InchToHalfInch: fittings.clamp3InchToHalfInch,
        elbowHalfInch: fittings.elbowHalfInch,
        mfElbowHalfInch: fittings.mfElbowHalfInch,
        socketHalfInch: fittings.socketHalfInch,
        teeHalfInch: fittings.teeHalfInch,
        nipple2Inch: fittings.nipple2Inch,
        nipple3Inch: fittings.nipple3Inch,
        nipple4Inch: fittings.nipple4Inch,
        reducerElbowThreeQuarterToHalfInch: fittings.reducerElbowThreeQuarterToHalfInch,
        threeQuarterInchTo3Inch: fittings.threeQuarterInchTo3Inch,
        unionHalfInch: fittings.unionHalfInch,
        plugHalfInch: fittings.plugHalfInch,
        extraGiAbove10Metres: fittings.extraGiAbove10Metres,
        pipe20Length: pipe20?.lengthMetres ?? "",
        pipe20LayingDate: pipe20?.layingDate ?? "",
        pipe20TestingDate: pipe20?.testingDate ?? "",
        pipe20PurgingDate: pipe20?.purgingDate ?? "",
        pipe32Length: pipe32?.lengthMetres ?? "",
        pipe63Length: pipe63?.lengthMetres ?? "",
        pipe90Length: pipe90?.lengthMetres ?? "",
        pipe125Length: pipe125?.lengthMetres ?? "",
        fourMetresUnderGc: lmc.fourMetresUnderGc,
        fourMetresAboveGc: lmc.fourMetresAboveGc,
        tfHalfInch: lmc.tfHalfInch,
        tfOneInch: lmc.tfOneInch,
        pcc: lmc.pcc,
        rccNalaCrossing: lmc.rccNalaCrossing,
        paverBlocks: lmc.paverBlocks,
        malua: lmc.malua,
        hardRock: lmc.hardRock,
        saddle90To32Mm: mdpe.saddle90To32Mm,
        saddle63To32Mm: mdpe.saddle63To32Mm,
        saddle32To20Mm: mdpe.saddle32To20Mm,
        tee32Mm: mdpe.tee32Mm,
        tee20Mm: mdpe.tee20Mm,
        reducerCoupler63To32Mm: mdpe.reducerCoupler63To32Mm,
        reducerCoupler32To20Mm: mdpe.reducerCoupler32To20Mm,
        coupler32Mm: mdpe.coupler32Mm,
        coupler20Mm: mdpe.coupler20Mm,
        coupler90Mm: mdpe.coupler90Mm,
        reducerCoupler90To63Mm: mdpe.reducerCoupler90To63Mm,
        tee90Mm: mdpe.tee90Mm,
        endCap90Mm: mdpe.endCap90Mm,
        commissioningDate: commissioning.commissioningDate,
        conversionDate: commissioning.conversionDate,
        regulatorPressure: commissioning.regulatorPressure,
        regulatorNo: commissioning.regulatorNo,
        meterType: commissioning.meterType,
        meterReading: commissioning.meterReading,
        nonConversionRemark: commissioning.nonConversionRemark,
        jmrDone: formatBoolean(billing.jmrDone),
        jmrSubmittedInPbg: formatBoolean(billing.jmrSubmittedInPbg),
        giBillDone: formatBoolean(billing.giBillDone),
        gcBillDone: formatBoolean(billing.gcBillDone),
        conversionBillDone: formatBoolean(billing.conversionBillDone),
        billingRemark: billing.remark,
      },
    };
  });
}

function getPipeRecord(records: LmcPipeSizeRecord[], pipeSize: LmcPipeSize) {
  return records.find((record) => record.pipeSize === pipeSize);
}

function formatBoolean(value: boolean) {
  return value ? "Yes" : "No";
}

export const importPreviewRows: ImportPreviewRow[] = [
  { id: "row-1", rowNumber: 2, customerName: "Anil Gupta", mobileNumber: "9876500011", bpTrNumber: "BP-991002", project: "Shyam Nagar CGD Project", area: "Shyam Nagar Block A", status: "Valid", errors: [] },
  { id: "row-2", rowNumber: 3, customerName: "Sunita Jain", mobileNumber: "98000", bpTrNumber: "", project: "Green City Phase 1", area: "Commercial Block", status: "Error", errors: ["Mobile number must be 10 digits", "BP / TR Number is required"] },
  { id: "row-3", rowNumber: 4, customerName: "Hotel Midtown", mobileNumber: "9811100220", bpTrNumber: "BP-991003", project: "Green City Phase 1", area: "Commercial Block", status: "Valid", errors: [] },
];

// ---- Real backend API + adapters ----

const STATUS_TO_BACKEND: Record<CustomerStatus, string> = {
  Draft: "draft",
  Pending: "pending",
  Active: "active",
  Inactive: "inactive",
  "On Hold": "on_hold",
  Completed: "completed",
  Archived: "archived",
};

const STATUS_TO_FRONTEND: Record<string, CustomerStatus> = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([frontend, backend]) => [backend, frontend as CustomerStatus]),
);

const LMC_SIZE_TO_BACKEND: Record<LmcPipeSize, string> = {
  "20 mm": "20_mm",
  "32 mm": "32_mm",
  "63 mm": "63_mm",
  "90 mm": "90_mm",
  "125 mm": "125_mm",
  Other: "other",
};

const LMC_SIZE_TO_FRONTEND: Record<string, LmcPipeSize> = Object.fromEntries(
  Object.entries(LMC_SIZE_TO_BACKEND).map(([frontend, backend]) => [backend, frontend as LmcPipeSize]),
);

const LMC_STATUS_TO_BACKEND: Record<LmcPipeStatus, string> = {
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
  Object.entries(LMC_STATUS_TO_BACKEND).map(([frontend, backend]) => [backend, frontend as LmcPipeStatus]),
);

function toDateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function numOrEmpty(value: string | number | null | undefined) {
  return value == null || value === "" ? "" : String(value);
}

type BackendCustomer = {
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
  plumberName: string | null;
  supervisorName: string | null;
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
  createdAt: string;
  lmcPipeRecords?: BackendLmcPipeRecord[];
  documents?: BackendCustomerDocument[];
};

type BackendLmcPipeRecord = {
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

type BackendCustomerDocument = {
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

function mapPipeRecord(raw: BackendLmcPipeRecord): LmcPipeSizeRecord {
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
    evidence: raw.evidence?.length ? raw.evidence.map((item) => String(item.fileName ?? item.label ?? "")).join(", ") : "",
  };
}

function mapPipeRecords(records: BackendLmcPipeRecord[] | undefined): LmcPipeSizeRecord[] {
  const bySize = new Map((records ?? []).map((record) => [LMC_SIZE_TO_FRONTEND[record.pipeSize] ?? "Other", record]));
  return lmcPipeSizeOptions.map((size) => (bySize.has(size) ? mapPipeRecord(bySize.get(size)!) : emptyPipeSizeRecord(size)));
}

function mapDocument(raw: BackendCustomerDocument): CustomerDocument {
  return {
    id: raw.id,
    type: raw.documentType,
    referenceNumber: raw.referenceNumber ?? "",
    category: raw.category ?? raw.documentType,
    issueDate: toDateOnly(raw.issueDate),
    expiryDate: toDateOnly(raw.expiryDate),
    amount: numOrEmpty(raw.amount),
    fileName: raw.fileName,
    remarks: raw.remarks ?? "",
    uploadedOn: toDateOnly(raw.uploadedAt),
    uploadedBy: "",
    status: raw.status as CustomerDocument["status"],
  };
}

function mapCustomer(raw: BackendCustomer, projectName?: string, siteArea?: string): Customer {
  return {
    id: raw.id,
    status: STATUS_TO_FRONTEND[raw.status] ?? "Draft",
    projectId: raw.projectId,
    siteId: raw.siteId,
    projectName: projectName ?? "",
    siteArea: siteArea ?? "",
    city: raw.city ?? "",
    createdDate: toDateOnly(raw.createdAt),
    customerConnection: {
      ...emptyCustomerConnection,
      trBpNo: raw.trBpNumber,
      mobileNo: raw.mobileNumber ?? "",
      customerName: raw.customerName,
      fullAddress: raw.fullAddress ?? "",
      connectionType: (raw.connectionType as CustomerConnectionDetails["connectionType"]) || "Domestic",
      houseType: raw.houseType ?? "",
      scheme: raw.scheme ?? "",
      plumberName: raw.plumberName ?? "",
      supervisorName: raw.supervisorName ?? "",
      reportNoGi: raw.giReportNumber ?? "",
      reportNoGc: raw.gcReportNumber ?? "",
      reportNoConversion: raw.conversionReportNumber ?? "",
      // master-import writes this into billingCompletion.jobCardDone, not a top-level column
      jobCardDone: String((raw.billingCompletion as Record<string, unknown> | null)?.jobCardDone ?? ""),
    },
    giMeasurements: { ...emptyGiMeasurements, ...(raw.giMeasurements as Partial<GiMeasurements> | null) },
    valvesRegulators: { ...emptyValvesRegulators, ...(raw.valvesRegulators as Partial<ValvesRegulators> | null) },
    fittingsAccessories: { ...emptyFittingsAccessories, ...(raw.fittingsAccessories as Partial<FittingsAccessories> | null) },
    lmcPipelineWork: {
      ...emptyLmcPipelineWork,
      ...(raw.lmcPipelineWork as Partial<LmcPipelineWork> | null),
      pipeRecords: mapPipeRecords(raw.lmcPipeRecords),
    },
    mdpeFittings: { ...emptyMdpeFittings, ...(raw.mdpeFittings as Partial<MdpeFittings> | null) },
    commissioningConversion: {
      ...emptyCommissioningConversion,
      ...(raw.commissioningConversion as Partial<CommissioningConversionDetails> | null),
    },
    billingCompletion: { ...emptyBillingCompletion, ...(raw.billingCompletion as Partial<BillingCompletionStatus> | null) },
    survey: raw.survey ? { ...emptyCustomerSurvey, ...(raw.survey as Partial<CustomerSurvey>) } : undefined,
    media: [],
    documents: (raw.documents ?? []).map(mapDocument),
  };
}

function mapFormValuesToBody(values: CustomerFormValues) {
  return {
    projectId: values.projectId,
    siteId: values.siteId,
    trBpNumber: values.customerConnection.trBpNo,
    mobileNumber: values.customerConnection.mobileNo || undefined,
    customerName: values.customerConnection.customerName,
    fullAddress: values.customerConnection.fullAddress || undefined,
    city: values.city || undefined,
    connectionType: values.customerConnection.connectionType,
    houseType: values.customerConnection.houseType || undefined,
    scheme: values.customerConnection.scheme || undefined,
    plumberName: values.customerConnection.plumberName || undefined,
    supervisorName: values.customerConnection.supervisorName || undefined,
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
    },
    mdpeFittings: values.mdpeFittings,
    commissioningConversion: values.commissioningConversion,
    // jobCardDone lives in the customerConnection tab in the UI, but master-import (and this
    // adapter's read side) stores it in billingCompletion - no top-level column for it.
    billingCompletion: { ...values.billingCompletion, jobCardDone: values.customerConnection.jobCardDone },
  };
}

function mapPipeRecordToBody(record: LmcPipeSizeRecord) {
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
      ? record.evidence.split(",").map((fileName) => ({ fileName: fileName.trim() }))
      : undefined,
  };
}

function mapDocumentToBody(doc: CustomerDocument) {
  return {
    documentType: doc.type || doc.category,
    category: doc.category || undefined,
    referenceNumber: doc.referenceNumber || undefined,
    issueDate: doc.issueDate || undefined,
    expiryDate: doc.expiryDate || undefined,
    amount: doc.amount ? Number(doc.amount.replace(/[^0-9.]/g, "")) || undefined : undefined,
    fileUrl: doc.fileName ? `uploads/${doc.fileName}` : "uploads/document",
    fileName: doc.fileName || "document",
    remarks: doc.remarks || undefined,
  };
}

export const customersApi = {
  async list(params: { search?: string; projectId?: string; siteId?: string; status?: CustomerStatus } = {}): Promise<Customer[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.search) query.set("search", params.search);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.siteId) query.set("siteId", params.siteId);
    if (params.status) query.set("status", STATUS_TO_BACKEND[params.status]);
    const rows = await apiRequest<BackendCustomer[]>(`/customers?${query.toString()}`);
    return rows.map((row) => mapCustomer(row));
  },

  async get(id: string): Promise<Customer> {
    const raw = await apiRequest<BackendCustomer>(`/customers/${id}`);
    return mapCustomer(raw);
  },

  async create(values: CustomerFormValues): Promise<Customer> {
    const raw = await apiRequest<BackendCustomer>("/customers", {
      method: "POST",
      body: JSON.stringify(mapFormValuesToBody(values)),
    });
    return mapCustomer(raw);
  },

  async update(id: string, values: CustomerFormValues): Promise<Customer> {
    const raw = await apiRequest<BackendCustomer>(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(mapFormValuesToBody(values)),
    });
    return mapCustomer(raw);
  },

  async upsertLmcPipeRecord(customerId: string, record: LmcPipeSizeRecord): Promise<LmcPipeSizeRecord> {
    const raw = await apiRequest<BackendLmcPipeRecord>(`/customers/${customerId}/lmc-pipes`, {
      method: "PUT",
      body: JSON.stringify(mapPipeRecordToBody(record)),
    });
    return mapPipeRecord(raw);
  },

  async listDocuments(customerId: string): Promise<CustomerDocument[]> {
    const rows = await apiRequest<BackendCustomerDocument[]>(`/customers/${customerId}/documents`);
    return rows.map(mapDocument);
  },

  async createDocument(customerId: string, doc: CustomerDocument): Promise<CustomerDocument> {
    const raw = await apiRequest<BackendCustomerDocument>(`/customers/${customerId}/documents`, {
      method: "POST",
      body: JSON.stringify(mapDocumentToBody(doc)),
    });
    return mapDocument(raw);
  },
};
