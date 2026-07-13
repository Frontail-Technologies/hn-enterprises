import type { StatusValue } from "@/components/shared/StatusBadge";

export type ConnectionType = "Domestic" | "Commercial" | "Industrial";
export type CustomerStatus = "Draft" | "Active" | "On Hold" | "Completed" | "Archived";

export type UploadedImage = {
  id: string;
  label: string;
  fileName: string;
  previewUrl: string;
  uploadedOn: string;
};

export type CustomerConnectionDetails = {
  reportNoGi: string;
  reportNoGc: string;
  reportNoConversion: string;
  trBpNo: string;
  mobileNo: string;
  customerName: string;
  fullAddress: string;
  scheme: string;
  plumberName: string;
  supervisorName: string;
  jobCardDone: string;
  connectionType: ConnectionType;
  houseType: string;
};

export type GiMeasurements = {
  tfToRegulator: string;
  inlet: string;
  outlet: string;
  totalGiPipeHalfInch: string;
  giPipeThreeQuarterInch: string;
  giPipeOneInch: string;
  giPipeOneAndHalfInch: string;
  giPipeTwoInch: string;
};

export type ValvesRegulators = {
  isolationValveHalfInch: string;
  isolationValveThreeQuarterInch: string;
  isolationValveOneInch: string;
  isolationValveOneAndHalfInch: string;
  isolationValveTwoInch: string;
  applianceValveHalfInch: string;
  regulator6BarTo100Mbar: string;
  regulator6BarTo21Mbar: string;
  regulator100MbarTo21Mbar: string;
  warningPlate: string;
};

export type FittingsAccessories = {
  clampHalfInch: string;
  clamp3InchToHalfInch: string;
  elbowHalfInch: string;
  mfElbowHalfInch: string;
  socketHalfInch: string;
  teeHalfInch: string;
  nipple2Inch: string;
  nipple3Inch: string;
  nipple4Inch: string;
  reducerElbowThreeQuarterToHalfInch: string;
  threeQuarterInchTo3Inch: string;
  unionHalfInch: string;
  plugHalfInch: string;
  fittingsOneAndHalfInchQuantity: string;
  fittingsTwoInchQuantity: string;
  extraGiAbove10Metres: string;
};

export type LmcPipelineWork = {
  pipeRecords: LmcPipeSizeRecord[];
  fourMetresUnderGc: string;
  fourMetresAboveGc: string;
  tfHalfInch: string;
  tfOneInch: string;
  pcc: string;
  rccNalaCrossing: string;
  paverBlocks: string;
  malua: string;
  hardRock: string;
};

export type LmcPipeSize = "20 mm" | "32 mm" | "63 mm" | "90 mm" | "125 mm" | "Other";

export type LmcPipeStatus =
  | "Not Started"
  | "In Progress"
  | "Laying Completed"
  | "Testing Pending"
  | "Testing Completed"
  | "Purging Completed"
  | "Not Required"
  | "On Hold";

export type LmcOverallStatus = "Not Started" | "In Progress" | "Completed" | "On Hold";

export type LmcPipeSizeRecord = {
  id: string;
  pipeSize: LmcPipeSize;
  lengthMetres: string;
  layingDate: string;
  testingDate: string;
  purgingDate: string;
  layingStatus: LmcPipeStatus;
  testingStatus: LmcPipeStatus;
  purgingStatus: LmcPipeStatus;
  jointFittingDetails: string;
  remarks: string;
  evidence: string;
};

export type MdpeFittings = {
  saddle90To32Mm: string;
  saddle90Mm: string;
  saddle63To32Mm: string;
  saddle32To20Mm: string;
  tee90Mm: string;
  tee32Mm: string;
  tee20Mm: string;
  reducerCoupler90To63Mm: string;
  reducerCoupler63To32Mm: string;
  reducerCoupler32To20Mm: string;
  coupler90Mm: string;
  coupler32Mm: string;
  coupler20Mm: string;
  endCap90Mm: string;
};

export type CommissioningConversionDetails = {
  meterNo: string;
  installationDate: string;
  commissioningDate: string;
  conversionDate: string;
  regulatorPressure: string;
  regulatorNo: string;
  meterType: string;
  meterReading: string;
  nonConversionRemark: string;
};

export type BillingCompletionStatus = {
  paymentStatus: StatusValue;
  paymentMode: string;
  initialAmount: string;
  jmrDone: boolean;
  jmrSubmittedInPbg: boolean;
  giBillDone: boolean;
  gcBillDone: boolean;
  conversionBillDone: boolean;
  remark: string;
};

export type Customer = {
  id: string;
  status: CustomerStatus;
  projectId: string;
  projectName: string;
  siteArea: string;
  city: string;
  createdDate: string;
  customerConnection: CustomerConnectionDetails;
  giMeasurements: GiMeasurements;
  valvesRegulators: ValvesRegulators;
  fittingsAccessories: FittingsAccessories;
  lmcPipelineWork: LmcPipelineWork;
  mdpeFittings: MdpeFittings;
  commissioningConversion: CommissioningConversionDetails;
  billingCompletion: BillingCompletionStatus;
  media: UploadedImage[];
};

export type CustomerFormValues = Omit<Customer, "id" | "createdDate">;

export type CustomerDocument = {
  id: string;
  title: string;
  category: string;
  fileName: string;
  uploadedOn: string;
  status: StatusValue;
};

export type CustomerWorkStageRecord = {
  id: string;
  stage: string;
  status: StatusValue;
  date: string;
  updatedBy: string;
  relatedRecord: string;
  href: string;
};

export type CustomerGiDetails = {
  customerId: string;
  inlet: string;
  outlet: string;
  totalGi: string;
  extraGi: string;
  pipeSizes: string;
  valves: string;
  regulators: string;
  clamps: string;
  elbows: string;
  tees: string;
  nipples: string;
  installationDate: string;
  photos: string[];
  relatedReport: string;
};

export type CustomerActivity = {
  id: string;
  title: string;
  description: string;
  actor: string;
  dateTime: string;
  relatedRecord: string;
};

export type ImportPreviewRow = {
  id: string;
  rowNumber: number;
  customerName: string;
  mobileNumber: string;
  bpTrNumber: string;
  project: string;
  area: string;
  status: "Valid" | "Error";
  errors: string[];
};
