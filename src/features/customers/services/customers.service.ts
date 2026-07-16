import type { MasterSheetColumnValueType } from "@/features/management/masters.config";
import { getActiveMasterSheetColumns } from "@/features/management/masters.config";
import type {
  BillingCompletionStatus,
  CommissioningConversionDetails,
  Customer,
  CustomerActivity,
  CustomerConnectionDetails,
  CustomerDocument,
  CustomerGiDetails,
  CustomerStatus,
  CustomerSurvey,
  FittingsAccessories,
  GiMeasurements,
  ImportPreviewRow,
  LmcOverallStatus,
  LmcPipeSizeRecord,
  LmcPipeSize,
  LmcPipeStatus,
  LmcPipelineWork,
  MdpeFittings,
  UploadedImage,
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
export const customerStatusOptions = ["Draft", "Active", "On Hold", "Completed", "Archived"] as const;
export const paymentStatusOptions = ["Pending", "In Review", "Approved", "Rejected", "Completed"] as const;
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
  { key: "customerName", label: "Customer Name", group: "Customer", width: 190, sticky: true },
  { key: "trBpNo", label: "BP / TR No.", group: "Customer", width: 150, sticky: true },
  { key: "reportNoGi", label: "Report No. - GI", group: "Reports", width: 150 },
  { key: "reportNoGc", label: "Report No. - GC", group: "Reports", width: 150 },
  { key: "reportNoConversion", label: "Report No. - Conversion", group: "Reports", width: 180 },
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

const emptyGiMeasurements: GiMeasurements = {
  tfToRegulator: "",
  inlet: "",
  outlet: "",
  totalGiPipeHalfInch: "",
  giPipeThreeQuarterInch: "",
  giPipeOneInch: "",
  giPipeOneAndHalfInch: "",
  giPipeTwoInch: "",
};

const emptyValvesRegulators: ValvesRegulators = {
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

const emptyFittingsAccessories: FittingsAccessories = {
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

function emptyPipeSizeRecord(pipeSize: LmcPipeSize): LmcPipeSizeRecord {
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

function image(id: string, label: string): UploadedImage {
  return {
    id,
    label,
    fileName: `${id}.jpg`,
    previewUrl: "",
    uploadedOn: "2025-02-15",
  };
}

function document(args: Partial<CustomerDocument> & Pick<CustomerDocument, "id" | "type" | "category" | "fileName">): CustomerDocument {
  return {
    referenceNumber: "",
    issueDate: "",
    expiryDate: "",
    amount: "",
    remarks: "",
    uploadedOn: "2025-02-15",
    uploadedBy: "Demo Admin",
    status: "Pending",
    ...args,
  };
}

function survey(args: CustomerSurvey): CustomerSurvey {
  return args;
}

function surveyPhoto(id: string, label: string, caption: string): CustomerSurvey["photos"][number] {
  return {
    id,
    label,
    caption,
    fileName: `${id}.jpg`,
  };
}

function surveyRevision(
  id: string,
  revisionNumber: string,
  status: CustomerSurvey["approvalStatus"],
  submittedBy: string,
  date: string,
  notes: string,
): CustomerSurvey["revisions"][number] {
  return { id, revisionNumber, status, submittedBy, date, notes };
}

function createCustomer(args: {
  id: string;
  status: CustomerStatus;
  projectId: string;
  projectName: string;
  siteArea: string;
  city: string;
  createdDate: string;
  connection: Partial<CustomerConnectionDetails> & Pick<CustomerConnectionDetails, "customerName" | "mobileNo" | "trBpNo">;
  gi?: Partial<GiMeasurements>;
  valves?: Partial<ValvesRegulators>;
  fittings?: Partial<FittingsAccessories>;
  lmc?: Partial<LmcPipelineWork>;
  mdpe?: Partial<MdpeFittings>;
  commissioning?: Partial<CommissioningConversionDetails>;
  billing?: Partial<BillingCompletionStatus>;
  survey?: CustomerSurvey;
  media?: UploadedImage[];
  documents?: CustomerDocument[];
}): Customer {
  const lmcPipelineWork = mergeLmcPipelineWork(args.lmc);
  return {
    id: args.id,
    status: args.status,
    projectId: args.projectId,
    projectName: args.projectName,
    siteArea: args.siteArea,
    city: args.city,
    createdDate: args.createdDate,
    customerConnection: { ...emptyCustomerConnection, ...args.connection },
    giMeasurements: { ...emptyGiMeasurements, ...args.gi },
    valvesRegulators: { ...emptyValvesRegulators, ...args.valves },
    fittingsAccessories: { ...emptyFittingsAccessories, ...args.fittings },
    lmcPipelineWork,
    mdpeFittings: { ...emptyMdpeFittings, ...args.mdpe },
    commissioningConversion: { ...emptyCommissioningConversion, ...args.commissioning },
    billingCompletion: { ...emptyBillingCompletion, ...args.billing },
    survey: args.survey,
    media: args.media ?? [],
    documents: args.documents ?? [],
  };
}

function mergeLmcPipelineWork(value?: Partial<LmcPipelineWork>): LmcPipelineWork {
  const recordsBySize = new Map((value?.pipeRecords ?? []).map((record) => [record.pipeSize, record]));

  return {
    ...emptyLmcPipelineWork,
    ...value,
    pipeRecords: lmcPipeSizeOptions.map((pipeSize) => ({
      ...emptyPipeSizeRecord(pipeSize),
      ...recordsBySize.get(pipeSize),
      id: recordsBySize.get(pipeSize)?.id ?? `pipe-${pipeSize.toLowerCase().replace(/\s+/g, "-")}`,
      pipeSize,
    })),
  };
}

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

export const customerMasterSheetDemoRows: CustomerMasterSheetRow[] = [
  masterSheetDemoRow("demo-797", {
    reportNoGi: "IND-PKG-HN-797",
    trBpNo: "T23D007585",
    mobileNo: "9864054318",
    customerName: "HIMANGSHU DUTTA",
    fullAddress: "GANESH MANDIR PATH NOONMATI",
    plumberName: "HASIB",
    supervisorName: "HASIB",
    meterNo: "24020796",
    installationDate: "01.05.2026",
    jobCardDone: "HASIB",
    connectionType: "GC",
    houseType: "INDIVIDUAL",
    tfToRegulator: "1.50",
    inlet: "1.90",
    outlet: "14.44",
    totalGiPipeHalfInch: "17.84",
    giPipeThreeQuarterInch: "0.10",
    giPipeOneInch: "0.00",
    isolationValveHalfInch: "3.00",
    isolationValveThreeQuarterInch: "0.00",
    isolationValveOneInch: "0.00",
    applianceValveHalfInch: "1.00",
    regulator6BarTo100Mbar: "0.00",
    regulator6BarTo21Mbar: "0.00",
    regulator100MbarTo21Mbar: "1.00",
    warningPlate: "1.00",
  }),
  masterSheetDemoRow("demo-798", {
    reportNoGi: "IND-PKG-HN-798",
    trBpNo: "T23D007588",
    mobileNo: "9508450514",
    customerName: "HIMANGSHU DUTTA",
    fullAddress: "GANESH MANDIR PATH NOONMATI",
    plumberName: "HASIB",
    supervisorName: "HASIB",
    meterNo: "24020794",
    installationDate: "01.05.2026",
    jobCardDone: "HASIB",
    connectionType: "TP",
    houseType: "FLAT",
    tfToRegulator: "0.00",
    inlet: "1.20",
    outlet: "8.86",
    totalGiPipeHalfInch: "10.06",
    giPipeThreeQuarterInch: "0.00",
    giPipeOneInch: "0.00",
    isolationValveHalfInch: "1.00",
    isolationValveThreeQuarterInch: "0.00",
    isolationValveOneInch: "0.00",
    applianceValveHalfInch: "1.00",
    regulator6BarTo100Mbar: "0.00",
    regulator6BarTo21Mbar: "0.00",
    regulator100MbarTo21Mbar: "1.00",
    warningPlate: "0.00",
  }),
  masterSheetDemoRow("demo-799", {
    reportNoGi: "IND-PKG-HN-799",
    trBpNo: "T23D005962",
    mobileNo: "6001987369",
    customerName: "MAHADEB PASOWAN",
    fullAddress: "05 NEW GUWAHATI RAILWAY COLONY BAMUNIMAIDAN RAILWAY COLONY ROAD",
    plumberName: "HASIB",
    supervisorName: "HASIB",
    meterNo: "23072974",
    installationDate: "01.05.2026",
    jobCardDone: "HASIB",
    connectionType: "GC",
    houseType: "INDIVIDUAL",
    tfToRegulator: "1.50",
    inlet: "1.90",
    outlet: "10.50",
    totalGiPipeHalfInch: "13.90",
    giPipeThreeQuarterInch: "0.10",
    giPipeOneInch: "0.00",
    isolationValveHalfInch: "1.00",
    isolationValveThreeQuarterInch: "0.00",
    isolationValveOneInch: "0.00",
    applianceValveHalfInch: "1.00",
    regulator6BarTo100Mbar: "0.00",
    regulator6BarTo21Mbar: "0.00",
    regulator100MbarTo21Mbar: "1.00",
    warningPlate: "1.00",
  }),
  masterSheetDemoRow("demo-800", {
    reportNoGi: "IND-PKG-HN-800",
    trBpNo: "T23D005969",
    mobileNo: "9101811360",
    customerName: "BHABANI TALUKDAR",
    fullAddress: "05 NEW GUWAHATI RAILWAY BAMUNIMAIDAN RAILWAY COLONY ROAD",
    plumberName: "HASIB",
    supervisorName: "HASIB",
    meterNo: "23072526",
    installationDate: "01.05.2026",
    jobCardDone: "HASIB",
    connectionType: "GC",
    houseType: "INDIVIDUAL",
    tfToRegulator: "1.50",
    inlet: "1.90",
    outlet: "6.46",
    totalGiPipeHalfInch: "9.86",
    giPipeThreeQuarterInch: "0.10",
    giPipeOneInch: "0.00",
    isolationValveHalfInch: "1.00",
    isolationValveThreeQuarterInch: "0.00",
    isolationValveOneInch: "0.00",
    applianceValveHalfInch: "1.00",
    regulator6BarTo100Mbar: "0.00",
    regulator6BarTo21Mbar: "0.00",
    regulator100MbarTo21Mbar: "1.00",
    warningPlate: "1.00",
  }),
  masterSheetDemoRow("demo-801", {
    reportNoGi: "IND-PKG-HN-801",
    trBpNo: "T23D010267",
    mobileNo: "8486231610",
    customerName: "ABHESH KUMAR THAKUR",
    fullAddress: "NEW GUWAHATI RAILWAY COLONY BAMUNIMAIDAN",
    plumberName: "HASIB",
    supervisorName: "HASIB",
    meterNo: "23072241",
    installationDate: "01.05.2026",
    jobCardDone: "HASIB",
    connectionType: "GC",
    houseType: "INDIVIDUAL",
    tfToRegulator: "1.50",
    inlet: "1.90",
    outlet: "17.89",
    totalGiPipeHalfInch: "21.29",
    giPipeThreeQuarterInch: "0.10",
    giPipeOneInch: "0.00",
    isolationValveHalfInch: "1.00",
    isolationValveThreeQuarterInch: "0.00",
    isolationValveOneInch: "0.00",
    applianceValveHalfInch: "1.00",
    regulator6BarTo100Mbar: "0.00",
    regulator6BarTo21Mbar: "0.00",
    regulator100MbarTo21Mbar: "1.00",
    warningPlate: "1.00",
  }),
  masterSheetDemoRow("demo-802", {
    reportNoGi: "IND-PKG-HN-802",
    trBpNo: "3106000096",
    mobileNo: "9101094721 / 9365675752",
    customerName: "ASWINI SARMA",
    fullAddress: "NEAR GATE HOSPITAL, ADARANI PATH, GEETA NAGAR",
    plumberName: "HASIB",
    supervisorName: "HASIB",
    meterNo: "23072474",
    installationDate: "01.05.2026",
    jobCardDone: "HASIB",
    connectionType: "GC",
    houseType: "INDIVIDUAL",
    tfToRegulator: "1.50",
    inlet: "1.90",
    outlet: "17.01",
    totalGiPipeHalfInch: "20.41",
    giPipeThreeQuarterInch: "0.10",
    giPipeOneInch: "0.00",
    isolationValveHalfInch: "1.00",
    isolationValveThreeQuarterInch: "0.00",
    isolationValveOneInch: "0.00",
    applianceValveHalfInch: "1.00",
    regulator6BarTo100Mbar: "0.00",
    regulator6BarTo21Mbar: "0.00",
    regulator100MbarTo21Mbar: "1.00",
    warningPlate: "1.00",
  }),
];

function masterSheetDemoRow(id: string, values: Record<string, string>): CustomerMasterSheetRow {
  return {
    id,
    customerId: id,
    values: {
      projectName: "Demo Master Sheet",
      siteArea: "Imported CSV Demo",
      city: "Guwahati",
      preferredPaymentType: "Cash",
      kycVerified: "No",
      lastPaymentDate: "",
      ...values,
    },
  };
}

function getPipeRecord(records: LmcPipeSizeRecord[], pipeSize: LmcPipeSize) {
  return records.find((record) => record.pipeSize === pipeSize);
}

function formatBoolean(value: boolean) {
  return value ? "Yes" : "No";
}

export const customers: Customer[] = [
  createCustomer({
    id: "cust-001",
    status: "Active",
    projectId: "shyam-nagar-cgd",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block A",
    city: "Jaipur",
    createdDate: "2025-01-24",
    connection: {
      reportNoGi: "GI-100245",
      reportNoGc: "GC-100245",
      reportNoConversion: "CONV-100245",
      trBpNo: "BP-100245",
      mobileNo: "9876543210",
      customerName: "Rajesh Kumar",
      fullAddress: "42, Shyam Nagar Block A, Jaipur",
      scheme: "Standard PNG",
      plumberName: "Group A",
      supervisorName: "Ramesh Kumar",
      jobCardDone: "Yes",
      connectionType: "Domestic",
      houseType: "Independent House",
    },
    gi: {
      tfToRegulator: "1.5",
      inlet: "3.2",
      outlet: "2.6",
      totalGiPipeHalfInch: "18.5",
      giPipeThreeQuarterInch: "2",
      giPipeOneInch: "0",
      giPipeOneAndHalfInch: "0",
      giPipeTwoInch: "0",
    },
    valves: {
      isolationValveHalfInch: "1",
      isolationValveThreeQuarterInch: "0",
      isolationValveOneInch: "0",
      isolationValveOneAndHalfInch: "0",
      isolationValveTwoInch: "0",
      applianceValveHalfInch: "1",
      regulator6BarTo21Mbar: "1",
      warningPlate: "1",
    },
    fittings: {
      clampHalfInch: "12",
      elbowHalfInch: "6",
      teeHalfInch: "1",
      unionHalfInch: "1",
      plugHalfInch: "1",
      fittingsOneAndHalfInchQuantity: "0",
      fittingsTwoInchQuantity: "0",
      extraGiAbove10Metres: "8.5",
    },
    lmc: {
      pipeRecords: [
      {
        id: "pipe-20-mm",
        pipeSize: "20 mm",
        lengthMetres: "18.5",
        layingDate: "2025-02-09",
        testingDate: "2025-02-12",
        purgingDate: "2025-02-12",
        layingStatus: "Laying Completed",
        testingStatus: "Testing Completed",
        purgingStatus: "Purging Completed",
        jointFittingDetails: "20 mm service line with standard MDPE joints.",
        remarks: "Domestic service line completed.",
        evidence: "lmc-trench.jpg",
      },
      {
        id: "pipe-32-mm",
        pipeSize: "32 mm",
        lengthMetres: "4.2",
        layingDate: "2025-02-09",
        testingDate: "2025-02-12",
        purgingDate: "2025-02-12",
        layingStatus: "Laying Completed",
        testingStatus: "Testing Completed",
        purgingStatus: "Purging Completed",
        jointFittingDetails: "32 mm transition near service tee.",
        remarks: "-",
        evidence: "joint-32mm.jpg",
      },
      {
        id: "pipe-63-mm",
        pipeSize: "63 mm",
        lengthMetres: "0",
        layingDate: "",
        testingDate: "",
        purgingDate: "",
        layingStatus: "Not Required",
        testingStatus: "Not Required",
        purgingStatus: "Not Required",
        jointFittingDetails: "-",
        remarks: "-",
        evidence: "-",
      },
      {
        id: "pipe-90-mm",
        pipeSize: "90 mm",
        lengthMetres: "0",
        layingDate: "",
        testingDate: "",
        purgingDate: "",
        layingStatus: "Not Required",
        testingStatus: "Not Required",
        purgingStatus: "Not Required",
        jointFittingDetails: "-",
        remarks: "-",
        evidence: "-",
      },
      ],
      fourMetresUnderGc: "4",
      fourMetresAboveGc: "2",
      tfHalfInch: "1",
      tfOneInch: "0",
      pcc: "3",
      rccNalaCrossing: "0",
      paverBlocks: "6",
      malua: "1",
      hardRock: "0",
    },
    mdpe: {
      saddle90To32Mm: "0",
      saddle90Mm: "0",
      saddle63To32Mm: "1",
      saddle32To20Mm: "1",
      tee90Mm: "0",
      tee32Mm: "1",
      tee20Mm: "2",
      reducerCoupler90To63Mm: "0",
      reducerCoupler63To32Mm: "0",
      reducerCoupler32To20Mm: "1",
      coupler90Mm: "0",
      coupler32Mm: "2",
      coupler20Mm: "3",
      endCap90Mm: "0",
    },
    commissioning: {
      meterNo: "MTR-77881",
      installationDate: "2025-02-08",
      commissioningDate: "2025-02-15",
      conversionDate: "",
      regulatorPressure: "21 mbar",
      regulatorNo: "REG-2219",
      meterType: "Smart Meter",
      meterReading: "128.4 SCM",
      nonConversionRemark: "Customer requested weekend conversion.",
    },
    billing: {
      paymentStatus: "Approved",
      paymentMode: "UPI",
      initialAmount: "3500",
      jmrDone: true,
      jmrSubmittedInPbg: true,
      giBillDone: true,
      gcBillDone: true,
      conversionBillDone: false,
      remark: "Conversion bill pending.",
    },
    survey: survey({
      id: "survey-001",
      surveyId: "SUR-100245",
      surveyDate: "2025-01-28",
      assignedSurveyor: "Vikas Saini",
      submittedBy: "Vikas Saini",
      submissionDate: "2025-01-28 16:40",
      latitude: 26.8951,
      longitude: 75.7684,
      captureAccuracy: "8 m",
      workableStatus: "Workable",
      approvalStatus: "Submitted",
      initialMeasurements: "Front wall meter point, 18.5 m estimated GI path, clear route to kitchen.",
      siteAccessibility: "Approved",
      meterPlacement: "Workable",
      pipelineRoute: "Workable",
      civilWorkRequired: "No",
      obstaclesRemarks: "No obstruction found.",
      notes: "Customer available after 10 AM. Meter can be placed on front wall.",
      reason: "",
      recommendedAction: "Proceed for GI planning.",
      expectedResolutionDate: "",
      approvalComments: "Pending supervisor approval.",
      photos: [
        surveyPhoto("site_front_bp_100245", "Site front photo", "Front elevation with meter approach."),
        surveyPhoto("meter_location_bp_100245", "Meter location photo", "Marked meter point near front wall."),
        surveyPhoto("pipeline_route_bp_100245", "Pipeline route photo", "Route is clear from riser to kitchen wall."),
        surveyPhoto("obstruction_bp_100245", "Obstruction photo", "No obstruction captured."),
      ],
      revisions: [
        surveyRevision("rev-1", "Revision 1", "Submitted", "Vikas Saini", "2025-01-28", "Initial survey submitted with workable route details."),
      ],
    }),
    media: [image("meter-location", "Meter Location"), image("lmc-trench", "LMC Trench")],
    documents: [
      document({
        id: "cust-001-doc-1",
        type: "Meter Photo",
        referenceNumber: "MTR-77881",
        category: "Meter Photo",
        issueDate: "2025-02-08",
        fileName: "meter_photo_bp_100245.jpg",
        uploadedOn: "2025-02-08",
        uploadedBy: "Vikas Saini",
        status: "Approved",
      }),
      document({
        id: "cust-001-doc-2",
        type: "GI Report",
        referenceNumber: "GI-100245",
        category: "GI Report",
        issueDate: "2025-02-08",
        amount: "18.5 m",
        fileName: "gi_report_bp_100245.pdf",
        uploadedOn: "2025-02-08",
        uploadedBy: "Ramesh Kumar",
        status: "Approved",
      }),
      document({
        id: "cust-001-doc-3",
        type: "LMC / Site Evidence",
        referenceNumber: "LMC-100245",
        category: "LMC / Site Evidence",
        issueDate: "2025-02-12",
        fileName: "lmc_trench_bp_100245.jpg",
        uploadedOn: "2025-02-12",
        uploadedBy: "Ramesh Kumar",
        status: "Submitted",
      }),
    ],
  }),
  createCustomer({
    id: "cust-002",
    status: "Active",
    projectId: "shyam-nagar-cgd",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block B",
    city: "Jaipur",
    createdDate: "2025-02-02",
    connection: {
      reportNoGi: "GI-553901",
      reportNoGc: "GC-553901",
      trBpNo: "TR-553901",
      mobileNo: "9823411122",
      customerName: "Meena Sharma",
      fullAddress: "11, New Sanganer Road, Shyam Nagar, Jaipur",
      scheme: "Deposit Waiver",
      plumberName: "Group B",
      supervisorName: "Kavita Joshi",
      jobCardDone: "No",
      connectionType: "Domestic",
      houseType: "Apartment",
    },
    gi: {
      tfToRegulator: "1",
      inlet: "2.4",
      outlet: "1.8",
      totalGiPipeHalfInch: "12",
      giPipeThreeQuarterInch: "0",
      giPipeOneInch: "0",
      giPipeOneAndHalfInch: "0",
      giPipeTwoInch: "0",
    },
    valves: {
      isolationValveHalfInch: "1",
      isolationValveThreeQuarterInch: "0",
      isolationValveOneInch: "0",
      isolationValveOneAndHalfInch: "0",
      isolationValveTwoInch: "0",
      applianceValveHalfInch: "1",
      regulator6BarTo21Mbar: "1",
      warningPlate: "1",
    },
    fittings: {
      clampHalfInch: "10",
      elbowHalfInch: "5",
      teeHalfInch: "1",
      fittingsOneAndHalfInchQuantity: "0",
      fittingsTwoInchQuantity: "0",
      extraGiAbove10Metres: "2",
    },
    lmc: {
      pipeRecords: [
      {
        id: "pipe-20-mm",
        pipeSize: "20 mm",
        lengthMetres: "12",
        layingDate: "2025-02-16",
        testingDate: "",
        purgingDate: "",
        layingStatus: "Laying Completed",
        testingStatus: "Testing Pending",
        purgingStatus: "Not Started",
        jointFittingDetails: "20 mm line laid up to meter point.",
        remarks: "Testing pending.",
        evidence: "front-photo.jpg",
      },
      {
        id: "pipe-90-mm",
        pipeSize: "90 mm",
        lengthMetres: "0",
        testingDate: "",
        purgingDate: "",
        layingStatus: "Not Required",
        testingStatus: "Not Required",
        purgingStatus: "Not Required",
        jointFittingDetails: "-",
        remarks: "-",
        evidence: "-",
        layingDate: "",
      },
      ],
      paverBlocks: "2",
    },
    mdpe: { saddle32To20Mm: "1", tee20Mm: "1", coupler20Mm: "2", coupler90Mm: "0", endCap90Mm: "0" },
    commissioning: { meterNo: "MTR-77892", installationDate: "2025-02-15", regulatorPressure: "21 mbar", regulatorNo: "REG-2231", meterType: "Mechanical", meterReading: "0 SCM" },
    billing: { paymentStatus: "Pending", paymentMode: "Cash", initialAmount: "1500", jmrDone: false, giBillDone: true, remark: "GC upload pending." },
    survey: survey({
      id: "survey-002",
      surveyId: "SUR-553901",
      surveyDate: "2025-02-04",
      assignedSurveyor: "Amit Rathore",
      submittedBy: "Amit Rathore",
      submissionDate: "2025-02-04 12:15",
      latitude: 26.8877,
      longitude: 75.7592,
      captureAccuracy: "12 m",
      workableStatus: "Partially Workable",
      approvalStatus: "Sent Back",
      initialMeasurements: "Apartment wall route measured; meter point requires clearance before final GI.",
      siteAccessibility: "Approved",
      meterPlacement: "Partially Workable",
      pipelineRoute: "Partially Workable",
      civilWorkRequired: "Yes",
      obstaclesRemarks: "Meter wall needs minor civil clearance.",
      notes: "Society guard approval required for work entry.",
      reason: "Meter placement needs confirmation.",
      recommendedAction: "Revisit with supervisor.",
      expectedResolutionDate: "2025-02-09",
      approvalComments: "Upload obstruction photo and revised meter placement.",
      photos: [
        surveyPhoto("site_front_tr_553901", "Site front photo", "Apartment entry and approach captured."),
        surveyPhoto("meter_location_tr_553901", "Meter location photo", "Meter wall needs civil clearance."),
        surveyPhoto("obstruction_tr_553901", "Obstruction photo", "Obstruction around proposed meter point."),
      ],
      revisions: [
        surveyRevision("rev-1", "Revision 1", "Submitted", "Amit Rathore", "2025-02-04", "Initial survey submitted with partial meter placement details."),
        surveyRevision("rev-2", "Revision 2", "Sent Back", "Kavita Joshi", "2025-02-06", "Sent back for obstruction photo and revised meter placement."),
      ],
    }),
    media: [image("front-photo", "Front Photo")],
    documents: [
      document({
        id: "cust-002-doc-1",
        type: "Customer Photo",
        category: "Customer Photo",
        issueDate: "2025-02-04",
        fileName: "site_front_tr_553901.jpg",
        uploadedOn: "2025-02-04",
        uploadedBy: "Amit Rathore",
        status: "Submitted",
      }),
      document({
        id: "cust-002-doc-2",
        type: "GC Report",
        referenceNumber: "GC-553901",
        category: "GC Report",
        issueDate: "2025-02-14",
        fileName: "gc_report_tr_553901.pdf",
        uploadedOn: "2025-02-14",
        uploadedBy: "Kavita Joshi",
        status: "In Review",
      }),
    ],
  }),
  createCustomer({
    id: "cust-003",
    status: "Active",
    projectId: "green-city-phase-1",
    projectName: "Green City Phase 1",
    siteArea: "Commercial Block",
    city: "Indore",
    createdDate: "2025-02-11",
    connection: {
      reportNoGi: "GI-220118",
      reportNoGc: "GC-220118",
      reportNoConversion: "CONV-220118",
      trBpNo: "BP-220118",
      mobileNo: "9810012200",
      customerName: "Green Mart Store",
      fullAddress: "Shop 8, Green City Phase 1, Indore",
      scheme: "Commercial Plan",
      plumberName: "Commercial Team",
      supervisorName: "Neha Verma",
      jobCardDone: "Yes",
      connectionType: "Commercial",
      houseType: "Retail Shop",
    },
    gi: {
      tfToRegulator: "2",
      inlet: "4",
      outlet: "3.5",
      totalGiPipeHalfInch: "8",
      giPipeThreeQuarterInch: "6",
      giPipeOneInch: "4",
      giPipeOneAndHalfInch: "2",
      giPipeTwoInch: "1",
    },
    valves: {
      isolationValveHalfInch: "2",
      isolationValveThreeQuarterInch: "1",
      isolationValveOneInch: "1",
      isolationValveOneAndHalfInch: "1",
      isolationValveTwoInch: "1",
      applianceValveHalfInch: "2",
      regulator6BarTo100Mbar: "1",
      regulator100MbarTo21Mbar: "1",
      warningPlate: "2",
    },
    fittings: {
      clampHalfInch: "18",
      clamp3InchToHalfInch: "4",
      elbowHalfInch: "8",
      teeHalfInch: "2",
      unionHalfInch: "2",
      fittingsOneAndHalfInchQuantity: "3",
      fittingsTwoInchQuantity: "2",
      extraGiAbove10Metres: "16",
    },
    lmc: {
      pipeRecords: [
      {
        id: "pipe-20-mm",
        pipeSize: "20 mm",
        lengthMetres: "26",
        layingDate: "2025-02-22",
        testingDate: "2025-02-26",
        purgingDate: "2025-02-26",
        layingStatus: "Laying Completed",
        testingStatus: "Testing Completed",
        purgingStatus: "Purging Completed",
        jointFittingDetails: "20 mm commercial branch complete.",
        remarks: "OK",
        evidence: "commercial-meter.jpg",
      },
      {
        id: "pipe-32-mm",
        pipeSize: "32 mm",
        lengthMetres: "8",
        layingDate: "2025-02-22",
        testingDate: "2025-02-26",
        purgingDate: "2025-02-26",
        layingStatus: "Laying Completed",
        testingStatus: "Testing Completed",
        purgingStatus: "Purging Completed",
        jointFittingDetails: "32 mm line with tee and couplers.",
        remarks: "OK",
        evidence: "gc-complete.jpg",
      },
      {
        id: "pipe-90-mm",
        pipeSize: "90 mm",
        lengthMetres: "2",
        layingDate: "2025-02-22",
        testingDate: "2025-02-26",
        purgingDate: "2025-02-26",
        layingStatus: "Laying Completed",
        testingStatus: "Testing Completed",
        purgingStatus: "Purging Completed",
        jointFittingDetails: "90 mm coupler and 90-63 reducer installed as per BOQ.",
        remarks: "Commercial BOQ item.",
        evidence: "90mm-joint.jpg",
      },
      ],
      pcc: "4",
    },
    mdpe: {
      saddle90Mm: "1",
      saddle63To32Mm: "1",
      tee90Mm: "1",
      tee32Mm: "2",
      reducerCoupler90To63Mm: "1",
      coupler90Mm: "1",
      coupler32Mm: "4",
      endCap90Mm: "1",
    },
    commissioning: {
      meterNo: "MTR-88021",
      installationDate: "2025-02-22",
      commissioningDate: "2025-03-01",
      conversionDate: "2025-03-04",
      regulatorPressure: "100 mbar",
      regulatorNo: "REG-3341",
      meterType: "Smart Meter",
      meterReading: "546.2 SCM",
    },
    billing: { paymentStatus: "Approved", paymentMode: "Bank Transfer", initialAmount: "12000", jmrDone: true, jmrSubmittedInPbg: true, giBillDone: true, gcBillDone: true, conversionBillDone: true, remark: "Completed." },
    survey: survey({
      id: "survey-003",
      surveyId: "SUR-220118",
      surveyDate: "2025-02-13",
      assignedSurveyor: "Pawan Jain",
      submittedBy: "Pawan Jain",
      submissionDate: "2025-02-13 17:30",
      latitude: 22.7196,
      longitude: 75.8577,
      captureAccuracy: "6 m",
      workableStatus: "Workable",
      approvalStatus: "Approved",
      initialMeasurements: "Commercial meter location marked; 26 m branch and 90 mm BOQ fitting noted.",
      siteAccessibility: "Approved",
      meterPlacement: "Workable",
      pipelineRoute: "Workable",
      civilWorkRequired: "No",
      obstaclesRemarks: "No obstruction.",
      notes: "Commercial meter location marked near back entry.",
      reason: "",
      recommendedAction: "Proceed to installation.",
      expectedResolutionDate: "",
      approvalComments: "Good to proceed.",
      photos: [
        surveyPhoto("commercial_site_front", "Site front photo", "Commercial block frontage captured."),
        surveyPhoto("commercial_meter_point", "Meter location photo", "Commercial meter point marked."),
        surveyPhoto("commercial_route", "Pipeline route photo", "Route approved for installation."),
        surveyPhoto("commercial_access", "Access photo", "Back entry access available."),
        surveyPhoto("commercial_obstruction", "Obstruction photo", "No obstruction around meter point."),
      ],
      revisions: [
        surveyRevision("rev-1", "Revision 1", "Approved", "Neha Verma", "2025-02-13", "Survey approved for GI and GC stages."),
      ],
    }),
    media: [image("commercial-meter", "Commercial Meter"), image("gc-complete", "GC Complete")],
    documents: [
      document({
        id: "cust-003-doc-1",
        type: "ID / Address Proof",
        referenceNumber: "ADDR-220118",
        category: "ID / Address Proof",
        issueDate: "2025-02-13",
        fileName: "address_proof_bp_220118.pdf",
        uploadedOn: "2025-02-13",
        uploadedBy: "Pawan Jain",
        status: "Approved",
      }),
      document({
        id: "cust-003-doc-2",
        type: "Conversion Report",
        referenceNumber: "CONV-220118",
        category: "Conversion Report",
        issueDate: "2025-03-01",
        fileName: "conversion_report_bp_220118.pdf",
        uploadedOn: "2025-03-01",
        uploadedBy: "Neha Verma",
        status: "Completed",
      }),
    ],
  }),
  createCustomer({
    id: "cust-004",
    status: "On Hold",
    projectId: "sunrise-enclave-cgd",
    projectName: "Sunrise Enclave CGD",
    siteArea: "Sunrise Enclave",
    city: "Udaipur",
    createdDate: "2025-03-02",
    connection: {
      trBpNo: "TR-783441",
      mobileNo: "9901122334",
      customerName: "Rafiq Khan",
      fullAddress: "7, Sunrise Enclave, Udaipur",
      scheme: "Standard PNG",
      plumberName: "Group C",
      supervisorName: "Priya Nair",
      jobCardDone: "No",
      connectionType: "Domestic",
      houseType: "Villa",
    },
    lmc: {
      pipeRecords: [
        {
          ...emptyPipeSizeRecord("20 mm"),
          layingDate: "2025-03-04",
          layingStatus: "On Hold",
          remarks: "Address verification pending.",
        },
      ],
    },
    commissioning: { nonConversionRemark: "Address verification pending." },
    billing: { paymentStatus: "In Review", paymentMode: "Cheque", initialAmount: "3500", remark: "Hold until verification is complete." },
    survey: survey({
      id: "survey-004",
      surveyId: "SUR-783441",
      surveyDate: "2025-03-04",
      assignedSurveyor: "Sameer Ali",
      submittedBy: "",
      submissionDate: "",
      latitude: 24.5854,
      longitude: 73.7125,
      captureAccuracy: "15 m",
      workableStatus: "Not Workable",
      approvalStatus: "Draft",
      initialMeasurements: "Alternate route required; boundary wall blocks proposed service route.",
      siteAccessibility: "Rejected",
      meterPlacement: "Not Workable",
      pipelineRoute: "Not Workable",
      civilWorkRequired: "Yes",
      obstaclesRemarks: "Boundary wall blocks proposed route.",
      notes: "Need alternate route after customer confirmation.",
      reason: "Pipeline route blocked.",
      recommendedAction: "Plan alternate route.",
      expectedResolutionDate: "2025-03-12",
      approvalComments: "",
      photos: [
        surveyPhoto("sunrise_front", "Site front photo", "Villa front and boundary wall captured."),
        surveyPhoto("sunrise_obstruction", "Obstruction photo", "Boundary wall blocking proposed route."),
      ],
      revisions: [],
    }),
  }),
];

export const customerDocuments: CustomerDocument[] = customers[0]?.documents ?? [];

export const customerWorkStages = [];

export const customerGiDetails: CustomerGiDetails = {
  customerId: "cust-001",
  inlet: "Kitchen wall inlet",
  outlet: "Meter outlet to appliance point",
  totalGi: "18.5 m",
  extraGi: "2.5 m",
  pipeSizes: "15MM, 20MM",
  valves: "2",
  regulators: "1",
  clamps: "14",
  elbows: "8",
  tees: "2",
  nipples: "6",
  installationDate: "2025-02-08",
  photos: ["Inlet point", "Meter wall", "Kitchen outlet"],
  relatedReport: "GI Report #GI-245",
};

export const customerActivity: CustomerActivity[] = [
  { id: "act-1", title: "Customer created", description: "Customer master record was created.", actor: "Demo Admin", dateTime: "2025-01-24 10:15", relatedRecord: "BP-100245" },
  { id: "act-2", title: "LMC updated", description: "LMC laying and MDPE fitting quantities were updated.", actor: "Ramesh Kumar", dateTime: "2025-02-12 16:40", relatedRecord: "LMC" },
];

export const importPreviewRows: ImportPreviewRow[] = [
  { id: "row-1", rowNumber: 2, customerName: "Anil Gupta", mobileNumber: "9876500011", bpTrNumber: "BP-991002", project: "Shyam Nagar CGD Project", area: "Shyam Nagar Block A", status: "Valid", errors: [] },
  { id: "row-2", rowNumber: 3, customerName: "Sunita Jain", mobileNumber: "98000", bpTrNumber: "", project: "Green City Phase 1", area: "Commercial Block", status: "Error", errors: ["Mobile number must be 10 digits", "BP / TR Number is required"] },
  { id: "row-3", rowNumber: 4, customerName: "Hotel Midtown", mobileNumber: "9811100220", bpTrNumber: "BP-991003", project: "Green City Phase 1", area: "Commercial Block", status: "Valid", errors: [] },
];

export function getCustomerById(id: string) {
  return customers.find((customer) => customer.id === id) ?? customers[0];
}

export function findCustomerById(id: string) {
  return customers.find((customer) => customer.id === id);
}

export const projectOptions = Array.from(
  new Map(customers.map((customer) => [customer.projectId, customer.projectName])),
).map(([value, label]) => ({ value, label }));

export const cityAreaOptions = Array.from(
  new Set(customers.map((customer) => `${customer.city} / ${customer.siteArea}`)),
);

export const siteOptionsByProject = customers.reduce<Record<string, string[]>>(
  (options, customer) => {
    options[customer.projectId] = Array.from(new Set([...(options[customer.projectId] ?? []), customer.siteArea]));
    return options;
  },
  {},
);

export const assignmentOptionsBySite = customers.reduce<Record<string, { supervisors: string[]; plumbers: string[]; fieldExecutives: string[] }>>(
  (options, customer) => {
    const current = options[customer.siteArea] ?? { supervisors: [], plumbers: [], fieldExecutives: [] };
    options[customer.siteArea] = {
      supervisors: Array.from(new Set([...current.supervisors, customer.customerConnection.supervisorName])),
      plumbers: Array.from(new Set([...current.plumbers, customer.customerConnection.plumberName])),
      fieldExecutives: current.fieldExecutives,
    };
    return options;
  },
  {},
);

export function getCustomerDisplay(customer: Customer) {
  return {
    name: customer.customerConnection.customerName,
    mobile: customer.customerConnection.mobileNo,
    trBpNo: customer.customerConnection.trBpNo,
    address: customer.customerConnection.fullAddress,
    meterNo: customer.commissioningConversion.meterNo,
    connectionType: customer.customerConnection.connectionType,
    supervisor: customer.customerConnection.supervisorName,
    plumber: customer.customerConnection.plumberName,
    paymentStatus: customer.billingCompletion.paymentStatus,
  };
}
