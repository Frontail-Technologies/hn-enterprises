export type JmrStatus = "Pending" | "In Review" | "Approved" | "Sent Back" | "Rejected" | "Completed";

export type JmrRecord = {
  id: string;
  reportNo: string;
  reportType: "JMR" | "Field Report";
  customerName: string;
  bpTrNumber: string;
  projectName: string;
  siteArea: string;
  submittedBy: string;
  submittedDate: string;
  status: JmrStatus;
  meterPhoto: string;
  pdfName: string;
  workPackage: string;
  executedQuantity: string;
  approvedQuantity: string;
  fimStatus: JmrStatus;
  conjunctionStatus: JmrStatus;
  lmcStatus: JmrStatus;
  remarks: string;
};

export type JmrAttachment = {
  id: string;
  title: string;
  category: "Meter Photo" | "JMR PDF" | "FIM" | "Conjunction" | "LMC";
  fileName: string;
  uploadedBy: string;
  uploadedOn: string;
  status: JmrStatus;
};

export type JmrMeasurementRow = {
  id: string;
  item: string;
  unit: string;
  executed: string;
  approved: string;
  remarks: string;
};

export type JmrRevisionItem = {
  id: string;
  revision: string;
  actor: string;
  dateTime: string;
  remarks: string;
  status: JmrStatus;
};
