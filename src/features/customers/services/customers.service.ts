import type {
  BillingCompletionStatus,
  CommissioningConversionDetails,
  Customer,
  CustomerActivity,
  CustomerConnectionDetails,
  CustomerDocument,
  CustomerGiDetails,
  CustomerStatus,
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
  media?: UploadedImage[];
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
    media: args.media ?? [],
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
    media: [image("meter-location", "Meter Location"), image("lmc-trench", "LMC Trench")],
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
    media: [image("front-photo", "Front Photo")],
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
    media: [image("commercial-meter", "Commercial Meter"), image("gc-complete", "GC Complete")],
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
  }),
];

export const customerDocuments: CustomerDocument[] = [
  { id: "doc-1", title: "Survey photos", category: "Survey", fileName: "survey_rajesh_kumar.zip", uploadedOn: "2025-01-28", status: "Approved" },
  { id: "doc-2", title: "GC image / PDF", category: "GC", fileName: "gc_bp_100245.pdf", uploadedOn: "2025-02-12", status: "Submitted" },
  { id: "doc-3", title: "Pressure observation report", category: "Testing", fileName: "pressure_bp_100245.pdf", uploadedOn: "2025-02-14", status: "In Review" },
  { id: "doc-4", title: "JMR upload", category: "JMR", fileName: "jmr_bp_100245.pdf", uploadedOn: "2025-02-16", status: "Pending" },
];

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
