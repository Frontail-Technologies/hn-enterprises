export type PlanningTaskId =
  | "survey"
  | "gi"
  | "gc"
  | "laying"
  | "valve"
  | "pre"
  | "conversion"
  | "jmr"
  | "testing"
  | "route"
  | "commissioning";

export type PlanningTaskTemplate = {
  id: PlanningTaskId;
  label: string;
};

export type PlanTask = {
  id: PlanningTaskId;
  label: string;
  qty: string;
  worker: string;
};

export type SitePlan = {
  id: string;
  customerId: string;
  customerName: string;
  customerTrBpNo: string;
  projectId: string;
  siteId: string;
  siteLabel: string;
  supervisorId: string;
  supervisorName: string;
  tasks: PlanTask[];
};

export type EvidenceFile = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  capturedAt?: string;
};

export type DprTask = {
  id: PlanningTaskId;
  label: string;
  plannedQty: string;
  completedQty: string;
  worker: string;
  delayReason: string;
};

export type DprRecord = {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  customerTrBpNo: string;
  projectId: string;
  siteId: string;
  siteLabel: string;
  supervisorId: string;
  supervisorName: string;
  status: "Draft" | "Submitted" | "Approved";
  evidence: EvidenceFile[];
  remarks: string;
  tasks: DprTask[];
};

export type PlanningEntryRow = {
  supervisorId: string;
  supervisorName: string;
  customerId: string;
  customerName: string;
  customerTrBpNo: string;
  projectId: string;
  siteId: string;
  siteArea: string;
  planFiled: boolean;
  planTasks: PlanTask[];
  dprStatus: "Not Filed" | "Draft" | "Submitted" | "Approved";
  dprRemarks: string;
};
