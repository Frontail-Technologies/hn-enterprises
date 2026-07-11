import type {
  WorkProgressHistory,
  WorkProgressPhoto,
  WorkProgressRecord,
  WorkProgressStatus,
  WorkStage,
  WorkStageDetail,
} from "../types/work-progress.types";

export const workStages: WorkStage[] = [
  "Survey",
  "Workable",
  "Plumbing / GI",
  "GC",
  "Commissioning",
  "Conversion",
];

export const workProgressStatuses: WorkProgressStatus[] = [
  "Not Started",
  "Pending",
  "In Progress",
  "Completed",
  "Sent Back",
  "On Hold",
];

export const workProgressRecords: WorkProgressRecord[] = [
  {
    id: "wp-001",
    customerId: "cust-001",
    customerName: "Rajesh Kumar",
    mobileNumber: "9876543210",
    bpTrNumber: "BP-100245",
    projectId: "shyam-nagar-cgd",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block A",
    supervisor: "Ramesh Kumar",
    currentStage: "Commissioning",
    expectedNextStage: "Conversion",
    nextRequiredAction: "Schedule conversion visit",
    stageDate: "2025-02-15",
    ageDays: 4,
    evidenceCount: 3,
    lastUpdated: "2025-02-15",
    updatedBy: "Ramesh Kumar",
    status: "In Progress",
  },
  {
    id: "wp-002",
    customerId: "cust-002",
    customerName: "Meena Sharma",
    mobileNumber: "9823411122",
    bpTrNumber: "TR-553901",
    projectId: "shyam-nagar-cgd",
    projectName: "Shyam Nagar CGD Project",
    siteArea: "Shyam Nagar Block B",
    supervisor: "Kavita Joshi",
    currentStage: "GC",
    expectedNextStage: "GC",
    nextRequiredAction: "Resubmit GC evidence",
    stageDate: "2025-02-18",
    ageDays: 7,
    evidenceCount: 2,
    lastUpdated: "2025-02-18",
    updatedBy: "Amit Rathore",
    status: "Sent Back",
  },
  {
    id: "wp-003",
    customerId: "cust-003",
    customerName: "Green Mart Store",
    mobileNumber: "9810012200",
    bpTrNumber: "BP-220118",
    projectId: "green-city-phase-1",
    projectName: "Green City Phase 1",
    siteArea: "Commercial Block",
    supervisor: "Neha Verma",
    currentStage: "Conversion",
    expectedNextStage: "Conversion",
    nextRequiredAction: "No action pending",
    stageDate: "2025-03-04",
    ageDays: 1,
    evidenceCount: 5,
    lastUpdated: "2025-03-04",
    updatedBy: "Pawan Jain",
    status: "Completed",
  },
  {
    id: "wp-004",
    customerId: "cust-004",
    customerName: "Rafiq Khan",
    mobileNumber: "9901122334",
    bpTrNumber: "TR-783441",
    projectId: "sunrise-enclave-cgd",
    projectName: "Sunrise Enclave CGD",
    siteArea: "Sunrise Enclave",
    supervisor: "Priya Nair",
    currentStage: "Survey",
    expectedNextStage: "Workable",
    nextRequiredAction: "Resolve survey hold",
    stageDate: "2025-03-04",
    ageDays: 3,
    evidenceCount: 0,
    lastUpdated: "2025-03-04",
    updatedBy: "Sameer Ali",
    status: "On Hold",
  },
];

export const workStageDetails: WorkStageDetail[] = [
  {
    id: "stage-survey",
    stage: "Survey",
    status: "Completed",
    completionDate: "2025-01-28",
    updatedBy: "Vikas Saini",
    remarks: "Survey submitted from field visit.",
    relatedRecord: "SUR-100245",
    relatedHref: "/surveys/survey-001",
    readOnly: true,
  },
  {
    id: "stage-workable",
    stage: "Workable",
    status: "Workable",
    completionDate: "2025-01-29",
    updatedBy: "Ramesh Kumar",
    remarks: "Workable status inherited from approved survey.",
    relatedRecord: "Workable Check",
    relatedHref: "/surveys/survey-001",
    readOnly: true,
  },
  {
    id: "stage-gi",
    stage: "Plumbing / GI",
    status: "Completed",
    completionDate: "2025-02-08",
    updatedBy: "Group A",
    remarks: "GI installation completed with meter point marked.",
    relatedRecord: "GI Report #GI-245",
    relatedHref: "/customers/cust-001/gi-details",
    readOnly: false,
  },
  {
    id: "stage-gc",
    stage: "GC",
    status: "Submitted",
    completionDate: "2025-02-12",
    updatedBy: "Vikas Saini",
    remarks: "GC images submitted for approval.",
    relatedRecord: "GC Upload #GC-245",
    relatedHref: "/gc-uploads?customerId=cust-001",
    readOnly: false,
  },
  {
    id: "stage-commissioning",
    stage: "Commissioning",
    status: "In Progress",
    completionDate: "2025-02-15",
    updatedBy: "Ramesh Kumar",
    remarks: "Commissioning visit completed; conversion pending.",
    relatedRecord: "Commissioning #COM-245",
    relatedHref: "/pre-commissioning?customerId=cust-001",
    readOnly: false,
  },
  {
    id: "stage-conversion",
    stage: "Conversion",
    status: "Pending",
    completionDate: "",
    updatedBy: "Demo Admin",
    remarks: "Awaiting customer availability.",
    relatedRecord: "Conversion Pending",
    relatedHref: "/work-progress/wp-001/update",
    readOnly: false,
  },
];

export const workProgressPhotos: WorkProgressPhoto[] = [
  {
    id: "photo-1",
    title: "GI meter point",
    fileName: "gi_meter_point_bp_100245.jpg",
    date: "2025-02-08",
  },
  {
    id: "photo-2",
    title: "Pipeline route completion",
    fileName: "route_completion_bp_100245.jpg",
    date: "2025-02-12",
  },
  {
    id: "photo-3",
    title: "Commissioning reading",
    fileName: "commissioning_reading_bp_100245.jpg",
    date: "2025-02-15",
  },
];

export const workProgressHistory: WorkProgressHistory[] = [
  {
    id: "history-1",
    title: "Survey completed",
    actor: "Vikas Saini",
    dateTime: "2025-01-28 16:40",
    remarks: "Survey marked workable from field visit.",
  },
  {
    id: "history-2",
    title: "GI completed",
    actor: "Group A",
    dateTime: "2025-02-08 12:05",
    remarks: "18.5 m GI installation completed.",
  },
  {
    id: "history-3",
    title: "Commissioning updated",
    actor: "Ramesh Kumar",
    dateTime: "2025-02-15 17:30",
    remarks: "Commissioning update submitted with photos.",
  },
];

export function getWorkProgressById(id: string) {
  return workProgressRecords.find((record) => record.id === id) ?? workProgressRecords[0];
}

export const workProgressProjectOptions = Array.from(
  new Map(workProgressRecords.map((record) => [record.projectId, record.projectName])),
).map(([value, label]) => ({ value, label }));

export const workProgressSiteOptions = Array.from(
  new Set(workProgressRecords.map((record) => record.siteArea)),
);

export const workProgressSupervisorOptions = Array.from(
  new Set(workProgressRecords.map((record) => record.supervisor)),
);
