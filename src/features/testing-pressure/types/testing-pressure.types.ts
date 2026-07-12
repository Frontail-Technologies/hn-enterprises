export type PressureTestStatus =
  | "Pending"
  | "In Review"
  | "Approved"
  | "Sent Back"
  | "Rejected"
  | "Completed";

export type PressureTestRecord = {
  id: string;
  testNo: string;
  customerName: string;
  bpTrNumber: string;
  projectName: string;
  siteArea: string;
  supervisor: string;
  testDate: string;
  testType: string;
  pressureRange: string;
  pressureDrop: string;
  duration: string;
  result: "Passed" | "Failed" | "Pending";
  status: PressureTestStatus;
  updatedDate: string;
  remarks: string;
};

export type PressureReading = {
  id: string;
  time: string;
  pressure: string;
  temperature: string;
  observation: string;
  recordedBy: string;
};

export type PressureEvidence = {
  id: string;
  title: string;
  fileName: string;
  type: "Image" | "PDF";
  uploadedBy: string;
  uploadedOn: string;
  status: PressureTestStatus;
};

export type PressureHistoryItem = {
  id: string;
  action: string;
  actor: string;
  dateTime: string;
  remarks: string;
  status: PressureTestStatus;
};
