import type {
  PressureEvidence,
  PressureHistoryItem,
  PressureReading,
  PressureTestRecord,
  PressureTestStatus,
} from "../types/testing-pressure.types";

export const pressureStatuses: PressureTestStatus[] = [
  "Pending",
  "In Review",
  "Approved",
  "Sent Back",
  "Rejected",
  "Completed",
];

export const pressureTests: PressureTestRecord[] = [
  {
    id: "tp-001",
    testNo: "TP-2025-00144",
    customerName: "Meena Sharma",
    bpTrNumber: "TR-553901",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block B",
    supervisor: "Kavita Joshi",
    testDate: "2025-02-18 10:00",
    testType: "Domestic pressure observation",
    pressureRange: "100 - 110 mbar",
    pressureDrop: "0 mbar",
    duration: "45 minutes",
    result: "Passed",
    status: "Approved",
    updatedDate: "2025-02-18 11:05",
    remarks: "Pressure remained stable throughout observation.",
  },
  {
    id: "tp-002",
    testNo: "TP-2025-00143",
    customerName: "Rajesh Kumar",
    bpTrNumber: "BP-100245",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block A",
    supervisor: "Amit Rathore",
    testDate: "2025-02-18 09:20",
    testType: "Regulator pressure test",
    pressureRange: "95 - 105 mbar",
    pressureDrop: "2 mbar",
    duration: "30 minutes",
    result: "Pending",
    status: "In Review",
    updatedDate: "2025-02-18 10:20",
    remarks: "Reviewer to confirm second reading image.",
  },
  {
    id: "tp-003",
    testNo: "TP-2025-00142",
    customerName: "Green Mart Store",
    bpTrNumber: "BP-220118",
    projectName: "Green City Phase 1",
    siteArea: "Commercial Block",
    supervisor: "Neha Verma",
    testDate: "2025-02-17 16:10",
    testType: "Commercial pressure observation",
    pressureRange: "120 - 130 mbar",
    pressureDrop: "12 mbar",
    duration: "60 minutes",
    result: "Failed",
    status: "Sent Back",
    updatedDate: "2025-02-17 17:30",
    remarks: "Observed drop after 40 minutes. Re-test required.",
  },
];

export const pressureReadings: PressureReading[] = [
  {
    id: "r-001",
    time: "10:00 AM",
    pressure: "108 mbar",
    temperature: "26 C",
    observation: "Initial pressure stable",
    recordedBy: "Kavita Joshi",
  },
  {
    id: "r-002",
    time: "10:15 AM",
    pressure: "107 mbar",
    temperature: "26 C",
    observation: "No visible drop",
    recordedBy: "Kavita Joshi",
  },
  {
    id: "r-003",
    time: "10:45 AM",
    pressure: "108 mbar",
    temperature: "27 C",
    observation: "Final reading accepted",
    recordedBy: "Kavita Joshi",
  },
];

export const pressureEvidence: PressureEvidence[] = [
  {
    id: "pe-001",
    title: "Gauge reading photo",
    fileName: "gauge-reading-tr-553901.jpg",
    type: "Image",
    uploadedBy: "Kavita Joshi",
    uploadedOn: "2025-02-18 10:47",
    status: "Approved",
  },
  {
    id: "pe-002",
    title: "Pressure observation PDF",
    fileName: "pressure-observation-tr-553901.pdf",
    type: "PDF",
    uploadedBy: "Kavita Joshi",
    uploadedOn: "2025-02-18 11:02",
    status: "Approved",
  },
];

export const pressureHistory: PressureHistoryItem[] = [
  {
    id: "ph-001",
    action: "Result submitted",
    actor: "Kavita Joshi",
    dateTime: "2025-02-18 11:05",
    remarks: "Final pressure reading accepted.",
    status: "Approved",
  },
  {
    id: "ph-002",
    action: "Reading added",
    actor: "Kavita Joshi",
    dateTime: "2025-02-18 10:45",
    remarks: "Final observation captured with no pressure drop.",
    status: "In Review",
  },
];

export function getPressureTestById(id: string) {
  return pressureTests.find((record) => record.id === id) ?? pressureTests[0];
}

export const pressureProjectOptions = Array.from(
  new Set(pressureTests.map((record) => record.projectName)),
).map((project) => ({ label: project, value: project }));

export const pressureSupervisorOptions = Array.from(
  new Set(pressureTests.map((record) => record.supervisor)),
).map((supervisor) => ({ label: supervisor, value: supervisor }));
