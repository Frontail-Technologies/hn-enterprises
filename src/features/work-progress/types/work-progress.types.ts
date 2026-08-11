export type WorkStage = "Survey" | "Workable" | "Plumbing / GI" | "GC" | "Commissioning" | "Conversion";
export type WorkProgressStatus = "Not Started" | "Pending" | "In Progress" | "Completed" | "Sent Back" | "On Hold";

export type WorkProgressUpdate = {
  id: string;
  customerId: string;
  customer: { id: string; name: string; trBpNumber: string; mobileNumber: string | null } | null;
  project: { id: string; name: string } | null;
  site: { id: string; name: string } | null;
  stage: WorkStage;
  status: WorkProgressStatus;
  nextRequiredAction: string;
  remarks: string;
  evidenceCount: number;
  createdAt: string;
  supervisor: { id: string; name: string } | null;
};

// One row per customer (their LATEST stage/status), not one row per update -
// backing the Work Queue (`GET /work-progress/queue`), which already
// supports projectId server-side.
export type WorkQueueRow = {
  id: string;
  customerName: string;
  trBpNumber: string;
  mobileNumber: string;
  project: { id: string; name: string } | null;
  site: { id: string; name: string } | null;
  stage: WorkStage;
  status: WorkProgressStatus;
  nextRequiredAction: string;
  evidenceCount: number;
  lastUpdated: string;
  supervisor: { id: string; name: string } | null;
};
