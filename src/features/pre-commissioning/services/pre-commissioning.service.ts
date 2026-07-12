import type {
  PreCommissioningChecklistItem,
  PreCommissioningEvidence,
  PreCommissioningHistoryItem,
  PreCommissioningRecord,
  PreCommissioningStatus,
} from "../types/pre-commissioning.types";

export const preCommissioningStatuses: PreCommissioningStatus[] = [
  "Pending",
  "In Review",
  "Approved",
  "Sent Back",
  "Rejected",
  "Completed",
];

export const preCommissioningRecords: PreCommissioningRecord[] = [
  {
    id: "pc-001",
    referenceNo: "PC-2025-00128",
    customerId: "cust-001",
    customerName: "Rajesh Kumar",
    bpTrNumber: "BP-100245",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block A",
    checklistDone: 7,
    checklistTotal: 8,
    assignedPerson: "Amit Rathore",
    status: "In Review",
    updatedDate: "2025-02-18 11:30",
    safetyVerification: "Ventilation and access clearance verified.",
    installationVerification: "Meter, regulator and appliance isolation checked.",
    fieldObservation: "Minor label correction required before commissioning.",
    remarks: "Ready for final review after label correction.",
  },
  {
    id: "pc-002",
    referenceNo: "PC-2025-00127",
    customerId: "cust-002",
    customerName: "Meena Sharma",
    bpTrNumber: "TR-553901",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block B",
    checklistDone: 8,
    checklistTotal: 8,
    assignedPerson: "Vikas Saini",
    status: "Approved",
    updatedDate: "2025-02-17 15:10",
    safetyVerification: "All safety points verified.",
    installationVerification: "Installation accepted for commissioning.",
    fieldObservation: "No pending observations.",
    remarks: "Approved for commissioning.",
  },
  {
    id: "pc-003",
    referenceNo: "PC-2025-00126",
    customerId: "cust-003",
    customerName: "Green Mart Store",
    bpTrNumber: "BP-220118",
    projectName: "Green City Phase 1",
    siteArea: "Commercial Block",
    checklistDone: 5,
    checklistTotal: 8,
    assignedPerson: "Neha Verma",
    status: "Sent Back",
    updatedDate: "2025-02-15 10:05",
    safetyVerification: "Fire clearance photo missing.",
    installationVerification: "Regulator pressure verification pending.",
    fieldObservation: "Upload corrected pressure photo.",
    remarks: "Sent back for missing evidence.",
  },
];

export const preCommissioningChecklist: PreCommissioningChecklistItem[] = [
  {
    id: "pc-check-1",
    label: "Meter installation verified",
    category: "Installation",
    status: "Approved",
    required: true,
    remarks: "Meter position accepted",
  },
  {
    id: "pc-check-2",
    label: "Regulator pressure verified",
    category: "Safety",
    status: "In Review",
    required: true,
    remarks: "Awaiting final reading confirmation",
  },
  {
    id: "pc-check-3",
    label: "Appliance isolation checked",
    category: "Safety",
    status: "Approved",
    required: true,
    remarks: "Isolation valve accessible",
  },
  {
    id: "pc-check-4",
    label: "Ventilation clearance verified",
    category: "Safety",
    status: "Approved",
    required: true,
    remarks: "Clearance available",
  },
  {
    id: "pc-check-5",
    label: "Warning labels placed",
    category: "Readiness",
    status: "Sent Back",
    required: true,
    remarks: "Label alignment needs correction",
  },
];

export const preCommissioningEvidence: PreCommissioningEvidence[] = [
  {
    id: "pc-ev-1",
    title: "Meter readiness photo",
    fileName: "meter-readiness-bp-100245.jpg",
    type: "Image",
    status: "Approved",
    uploadedBy: "Amit Rathore",
    uploadedOn: "2025-02-18 10:40",
  },
  {
    id: "pc-ev-2",
    title: "Regulator pressure reading",
    fileName: "regulator-pressure-bp-100245.jpg",
    type: "Image",
    status: "In Review",
    uploadedBy: "Amit Rathore",
    uploadedOn: "2025-02-18 10:48",
  },
  {
    id: "pc-ev-3",
    title: "Safety verification report",
    fileName: "safety-verification-bp-100245.pdf",
    type: "PDF",
    status: "Approved",
    uploadedBy: "Amit Rathore",
    uploadedOn: "2025-02-18 11:05",
  },
];

export const preCommissioningHistory: PreCommissioningHistoryItem[] = [
  {
    id: "pc-hist-1",
    action: "Status updated",
    actor: "Demo Admin",
    dateTime: "2025-02-18 11:30",
    remarks: "Moved to review after evidence upload.",
    status: "In Review",
  },
  {
    id: "pc-hist-2",
    action: "Checklist updated",
    actor: "Amit Rathore",
    dateTime: "2025-02-18 10:55",
    remarks: "Safety and installation checks completed.",
    status: "Pending",
  },
  {
    id: "pc-hist-3",
    action: "Evidence uploaded",
    actor: "Amit Rathore",
    dateTime: "2025-02-18 10:40",
    remarks: "Meter readiness evidence added.",
    status: "Pending",
  },
];

export function getPreCommissioningById(id: string) {
  return (
    preCommissioningRecords.find((record) => record.id === id) ??
    preCommissioningRecords[0]
  );
}

export const preCommissioningProjectOptions = Array.from(
  new Set(preCommissioningRecords.map((record) => record.projectName)),
).map((project) => ({ label: project, value: project }));

export const preCommissioningAssignedOptions = Array.from(
  new Set(preCommissioningRecords.map((record) => record.assignedPerson)),
).map((person) => ({ label: person, value: person }));
