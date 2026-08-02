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
