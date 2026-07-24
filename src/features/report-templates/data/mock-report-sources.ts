// GC Uploads, JMR and Testing/Pressure no longer exist as standalone features in this
// app, but the report-template PDFs still need a handful of representative fields from
// each to fill in their tables. This file is the report-templates feature's own small,
// self-contained mock source for that data instead of depending on removed modules.

export type MockPressureTest = {
  id: string;
  testDate: string;
  pressureRange: string;
  duration: string;
  pressureDrop: string;
  remarks: string;
  result: string;
};

const pressureTests: MockPressureTest[] = [
  {
    id: "tp-002",
    testDate: "2025-02-18",
    pressureRange: "2.5 - 3.0 Kg/cm2",
    duration: "30 mins",
    pressureDrop: "0.05 Kg/cm2",
    remarks: "No leakage observed during the test duration.",
    result: "Pass",
  },
];

export function getPressureTestById(id: string) {
  return pressureTests.find((item) => item.id === id) ?? pressureTests[0];
}

export const pressureReadings: Array<{ time: string; pressure: string }> = [
  { time: "10:00 AM", pressure: "3.00 Kg/cm2" },
  { time: "10:15 AM", pressure: "2.98 Kg/cm2" },
  { time: "10:30 AM", pressure: "2.97 Kg/cm2" },
  { time: "10:45 AM", pressure: "2.96 Kg/cm2" },
  { time: "11:00 AM", pressure: "2.95 Kg/cm2" },
];

export type MockJmrRecord = {
  id: string;
  remarks: string;
};

const jmrRecords: MockJmrRecord[] = [
  {
    id: "jmr-002",
    remarks: "Joint meter reading verified and signed by the customer.",
  },
];

export function getJmrById(id: string) {
  return jmrRecords.find((item) => item.id === id) ?? jmrRecords[0];
}

export type MockGcUpload = {
  id: string;
  remarks: string;
};

const gcUploads: MockGcUpload[] = [
  {
    id: "gcu-002",
    remarks: "GC laying completed as per approved drawing.",
  },
];

export function getGcUploadById(id: string) {
  return gcUploads.find((item) => item.id === id) ?? gcUploads[0];
}

export const gcChecklistItems: Array<{
  label: string;
  required: boolean;
  status: string;
  remarks: string;
}> = [
  { label: "Trench depth as per approved drawing", required: true, status: "Completed", remarks: "Verified on site." },
  { label: "Pipe bedding and warning tape laid", required: true, status: "Completed", remarks: "As per SOP." },
  { label: "Joint fusion records available", required: true, status: "Completed", remarks: "Attached." },
  { label: "Backfilling completed", required: false, status: "Completed", remarks: "No issues observed." },
];

export const gcEvidenceItems: Array<{
  title: string;
  type: string;
  fileName: string;
  status: string;
}> = [
  { title: "Trench Photo", type: "Photo", fileName: "trench-01.jpg", status: "Uploaded" },
  { title: "Pipe Laying Photo", type: "Photo", fileName: "laying-02.jpg", status: "Uploaded" },
  { title: "Fusion Joint Record", type: "Document", fileName: "fusion-log.pdf", status: "Uploaded" },
];
