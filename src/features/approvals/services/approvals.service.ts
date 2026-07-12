export type ApprovalDecision = "Approve" | "Send Back" | "Reject";
export type ApprovalStatus = "Pending" | "Approved" | "Sent Back" | "Rejected";

export type ApprovalRecord = {
  id: string;
  module: "Surveys" | "GC Uploads" | "Pre-Commissioning" | "Testing / Pressure" | "JMR";
  referenceNo: string;
  title: string;
  submittedBy: string;
  submittedOn: string;
  priority: "Normal" | "High";
  status: ApprovalStatus;
  summary: string;
};

export type ApprovalHistoryItem = {
  id: string;
  referenceNo: string;
  action: string;
  actor: string;
  dateTime: string;
  remarks: string;
};

export const approvalRecords: ApprovalRecord[] = [
  {
    id: "ap-001",
    module: "GC Uploads",
    referenceNo: "GCU-2025-00056",
    title: "GC evidence review for Meena Sharma",
    submittedBy: "Vikas Saini",
    submittedOn: "2025-02-18 14:30",
    priority: "High",
    status: "Pending",
    summary: "Checklist complete, one image pending reviewer confirmation.",
  },
  {
    id: "ap-002",
    module: "Pre-Commissioning",
    referenceNo: "PC-2025-00128",
    title: "Pre-commissioning readiness review",
    submittedBy: "Amit Rathore",
    submittedOn: "2025-02-18 11:30",
    priority: "Normal",
    status: "Pending",
    summary: "Purging details and safety evidence submitted for final review.",
  },
  {
    id: "ap-003",
    module: "JMR",
    referenceNo: "JMR-2025-00120",
    title: "JMR quantity approval",
    submittedBy: "Vikas Saini",
    submittedOn: "2025-02-18 13:20",
    priority: "Normal",
    status: "Pending",
    summary: "JMR PDF, meter photo and FIM attached.",
  },
  {
    id: "ap-004",
    module: "Testing / Pressure",
    referenceNo: "TP-2025-00143",
    title: "Pressure observation result review",
    submittedBy: "Amit Rathore",
    submittedOn: "2025-02-18 10:20",
    priority: "High",
    status: "Pending",
    summary: "Second gauge photo requires reviewer decision.",
  },
];

export const approvalHistory: ApprovalHistoryItem[] = [
  {
    id: "ah-001",
    referenceNo: "GCU-2025-00055",
    action: "Approved",
    actor: "Demo Admin",
    dateTime: "2025-02-17 18:10",
    remarks: "Evidence accepted for billing workflow.",
  },
  {
    id: "ah-002",
    referenceNo: "FR-2025-00088",
    action: "Sent Back",
    actor: "Demo Admin",
    dateTime: "2025-02-16 12:15",
    remarks: "Meter serial number photo was unclear.",
  },
];

export const approvalModuleOptions = Array.from(
  new Set(approvalRecords.map((record) => record.module)),
).map((module) => ({ label: module, value: module }));
