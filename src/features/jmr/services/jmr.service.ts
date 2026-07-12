import type {
  JmrAttachment,
  JmrMeasurementRow,
  JmrRecord,
  JmrRevisionItem,
  JmrStatus,
} from "../types/jmr.types";

export const jmrStatuses: JmrStatus[] = [
  "Pending",
  "In Review",
  "Approved",
  "Sent Back",
  "Rejected",
  "Completed",
];

export const jmrRecords: JmrRecord[] = [
  {
    id: "jmr-001",
    reportNo: "JMR-2025-00120",
    reportType: "JMR",
    customerName: "Meena Sharma",
    bpTrNumber: "TR-553901",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block B",
    submittedBy: "Vikas Saini",
    submittedDate: "2025-02-18 13:20",
    status: "In Review",
    meterPhoto: "meter-photo-tr-553901.jpg",
    pdfName: "jmr-tr-553901.pdf",
    workPackage: "GI + Meter installation / WP-SN-B-018",
    executedQuantity: "18.5 m",
    approvedQuantity: "17.8 m",
    fimStatus: "Approved",
    conjunctionStatus: "In Review",
    lmcStatus: "Pending",
    remarks: "JMR quantities submitted with meter photo and FIM.",
  },
  {
    id: "jmr-002",
    reportNo: "JMR-2025-00119",
    reportType: "JMR",
    customerName: "Rajesh Kumar",
    bpTrNumber: "BP-100245",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block A",
    submittedBy: "Amit Rathore",
    submittedDate: "2025-02-17 16:10",
    status: "Approved",
    meterPhoto: "meter-photo-bp-100245.jpg",
    pdfName: "jmr-bp-100245.pdf",
    workPackage: "GC correction / WP-SN-A-012",
    executedQuantity: "12.0 m",
    approvedQuantity: "12.0 m",
    fimStatus: "Approved",
    conjunctionStatus: "Approved",
    lmcStatus: "Approved",
    remarks: "Approved for billing cycle.",
  },
  {
    id: "jmr-003",
    reportNo: "FR-2025-00088",
    reportType: "Field Report",
    customerName: "Green Mart Store",
    bpTrNumber: "BP-220118",
    projectName: "Green City Phase 1",
    siteArea: "Commercial Block",
    submittedBy: "Neha Verma",
    submittedDate: "2025-02-16 10:40",
    status: "Sent Back",
    meterPhoto: "meter-photo-bp-220118.jpg",
    pdfName: "field-report-bp-220118.pdf",
    workPackage: "Commercial meter bank / WP-GC-C-004",
    executedQuantity: "28.0 m",
    approvedQuantity: "Pending",
    fimStatus: "Sent Back",
    conjunctionStatus: "Pending",
    lmcStatus: "Pending",
    remarks: "Meter image needs clearer serial number visibility.",
  },
];

export const jmrAttachments: JmrAttachment[] = [
  {
    id: "att-001",
    title: "Meter Photo",
    category: "Meter Photo",
    fileName: "meter-photo-tr-553901.jpg",
    uploadedBy: "Vikas Saini",
    uploadedOn: "2025-02-18 13:08",
    status: "In Review",
  },
  {
    id: "att-002",
    title: "JMR PDF",
    category: "JMR PDF",
    fileName: "jmr-tr-553901.pdf",
    uploadedBy: "Vikas Saini",
    uploadedOn: "2025-02-18 13:20",
    status: "In Review",
  },
  {
    id: "att-003",
    title: "FIM Upload",
    category: "FIM",
    fileName: "fim-tr-553901.pdf",
    uploadedBy: "Vikas Saini",
    uploadedOn: "2025-02-18 13:25",
    status: "Approved",
  },
];

export const jmrMeasurements: JmrMeasurementRow[] = [
  {
    id: "jm-001",
    item: "20MM GI pipe",
    unit: "m",
    executed: "12.5",
    approved: "12.0",
    remarks: "Minor deduction after site check",
  },
  {
    id: "jm-002",
    item: "Meter installation",
    unit: "nos",
    executed: "1",
    approved: "1",
    remarks: "Accepted",
  },
  {
    id: "jm-003",
    item: "Clamp and fittings",
    unit: "set",
    executed: "1",
    approved: "1",
    remarks: "Accepted",
  },
];

export const jmrRevisions: JmrRevisionItem[] = [
  {
    id: "jr-001",
    revision: "Revision 2",
    actor: "Demo Admin",
    dateTime: "2025-02-18 15:30",
    remarks: "Approved quantity adjusted for GI pipe length.",
    status: "In Review",
  },
  {
    id: "jr-002",
    revision: "Revision 1",
    actor: "Vikas Saini",
    dateTime: "2025-02-18 13:20",
    remarks: "Initial JMR submitted with meter photo and PDF.",
    status: "Pending",
  },
];

export function getJmrById(id: string) {
  return jmrRecords.find((record) => record.id === id) ?? jmrRecords[0];
}

export const jmrProjectOptions = Array.from(
  new Set(jmrRecords.map((record) => record.projectName)),
).map((project) => ({ label: project, value: project }));
