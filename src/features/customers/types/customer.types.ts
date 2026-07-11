import type { StatusValue } from "@/components/shared/StatusBadge";

export type ConnectionType = "Domestic" | "Commercial" | "Industrial";

export type CustomerStage =
  | "Lead"
  | "Survey"
  | "Plumbing / GI"
  | "GC"
  | "Commissioning"
  | "Conversion"
  | "Completed";

export type CustomerStatus = "Draft" | "Active" | "On Hold" | "Completed" | "Archived";

export type Customer = {
  id: string;
  name: string;
  mobileNumber: string;
  fullAddress: string;
  projectId: string;
  projectName: string;
  siteArea: string;
  city: string;
  latitude: string;
  longitude: string;
  bpTrNumber: string;
  connectionType: ConnectionType;
  houseType: string;
  scheme: string;
  paymentStatus: StatusValue;
  paymentMode: string;
  initialAmount: string;
  supervisor: string;
  plumberGroup: string;
  fieldExecutive: string;
  meterNumber: string;
  meterType: string;
  regulatorNumber: string;
  regulatorPressure: string;
  currentStage: CustomerStage;
  status: CustomerStatus;
  createdDate: string;
  surveyDate: string;
  installationDate: string;
  testingDate: string;
  commissioningDate: string;
  conversionDate: string;
  meterReading: string;
  nonConversionRemarks: string;
  giBillDone: boolean;
  gcBillDone: boolean;
  conversionBillDone: boolean;
};

export type CustomerFormValues = Omit<Customer, "id" | "projectName" | "createdDate">;

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
