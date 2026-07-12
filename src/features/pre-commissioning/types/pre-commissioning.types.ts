import type { StatusValue } from "@/components/shared/StatusBadge";

export type PreCommissioningStatus =
  | "Pending"
  | "In Review"
  | "Approved"
  | "Sent Back"
  | "Rejected"
  | "Completed";

export type PreCommissioningRecord = {
  id: string;
  referenceNo: string;
  customerId: string;
  customerName: string;
  bpTrNumber: string;
  projectName: string;
  siteArea: string;
  checklistDone: number;
  checklistTotal: number;
  assignedPerson: string;
  status: PreCommissioningStatus;
  updatedDate: string;
  customerMobile?: string;
  evidenceCount?: number;
  purgingDate: string;
  purgingPressure: string;
  purgingDuration: string;
  purgingRemarks: string;
  locationSection: string;
  pipeLengths: string;
  valveChambers: string;
  safetyVerification: string;
  installationVerification: string;
  fieldObservation: string;
  remarks: string;
};

export type PreCommissioningChecklistItem = {
  id: string;
  label: string;
  category: string;
  status: StatusValue;
  required: boolean;
  remarks: string;
};

export type PreCommissioningEvidence = {
  id: string;
  title: string;
  fileName: string;
  type: "Image" | "PDF" | "Document";
  status: StatusValue;
  uploadedBy: string;
  uploadedOn: string;
  remarks?: string;
};

export type PreCommissioningHistoryItem = {
  id: string;
  action: string;
  actor: string;
  dateTime: string;
  remarks: string;
  status: PreCommissioningStatus;
};
