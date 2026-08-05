import type { StatusValue } from "@/components/shared/StatusBadge";

export type ConnectionType = "Domestic" | "Commercial" | "Industrial";
export type CustomerStatus =
  | "Draft"
  | "Pending"
  | "Active"
  | "Inactive"
  | "On Hold"
  | "Completed"
  | "Archived";
export type CustomerSurveyWorkableStatus = "Workable" | "Partially Workable" | "Not Workable";
export type CustomerSurveyApprovalStatus =
  | "Draft"
  | "Submitted"
  | "In Review"
  | "Approved"
  | "Sent Back"
  | "Rejected";

export type UploadedImage = {
  id: string;
  label: string;
  fileName: string;
  previewUrl: string;
  uploadedOn: string;
  file?: File;
};

export type CustomerSurveyPhoto = {
  id: string;
  label: string;
  caption: string;
  fileName: string;
  fileUrl?: string;
  // Only set while editing on the web, before the file finishes uploading; never persisted.
  previewUrl?: string;
  status?: "staged" | "uploading" | "uploaded" | "error";
  file?: File;
};

export type CustomerSurveyRevision = {
  id: string;
  revisionNumber: string;
  status: CustomerSurveyApprovalStatus;
  submittedBy: string;
  date: string;
  notes: string;
};

export type CustomerSurvey = {
  id: string;
  surveyId: string;
  surveyDate: string;
  assignedSurveyor: string;
  submittedBy: string;
  submissionDate: string;
  latitude: number;
  longitude: number;
  captureAccuracy: string;
  workableStatus: CustomerSurveyWorkableStatus;
  approvalStatus: CustomerSurveyApprovalStatus;
  initialMeasurements: string;
  siteAccessibility: StatusValue;
  meterPlacement: StatusValue;
  pipelineRoute: StatusValue;
  civilWorkRequired: string;
  obstaclesRemarks: string;
  notes: string;
  reason: string;
  recommendedAction: string;
  expectedResolutionDate: string;
  approvalComments: string;
  evidence: CustomerSurveyPhoto[];
  revisions: CustomerSurveyRevision[];
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
  plumberId: string;
  plumberName: string;
  supervisorId: string;
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
  approvalStatus?: string;
  approvalComments?: string;
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
  approvalStatus?: string;
  approvalComments?: string;
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

export type LmcEvidenceFile = {
  id: string;
  label: string;
  fileName: string;
  fileUrl?: string;
  // Only set while editing on the web, before the file finishes uploading; never persisted.
  previewUrl?: string;
  status?: "staged" | "uploading" | "uploaded" | "error";
  file?: File;
};

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
  evidence: LmcEvidenceFile[];
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
  approvalStatus?: string;
  approvalComments?: string;
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
  siteId: string;
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
  survey?: CustomerSurvey;
  media: UploadedImage[];
  documents: CustomerDocument[];
};

export type CustomerFormValues = Omit<Customer, "id" | "createdDate">;

export type CustomerDocument = {
  id: string;
  type: string;
  referenceNumber: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  amount: string;
  fileName: string;
  fileUrl?: string;
  file?: File;
  remarks: string;
  uploadedOn: string;
  uploadedBy: string;
  status: StatusValue;
};
