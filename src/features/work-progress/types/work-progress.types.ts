import type { StatusValue } from "@/components/shared/StatusBadge";

export type WorkStage =
  | "Survey"
  | "Workable"
  | "Plumbing / GI"
  | "GC"
  | "Commissioning"
  | "Conversion";

export type WorkProgressStatus =
  | "Not Started"
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Sent Back"
  | "On Hold";

export type WorkProgressRecord = {
  id: string;
  customerId: string;
  customerName: string;
  mobileNumber: string;
  bpTrNumber: string;
  projectId: string;
  projectName: string;
  siteArea: string;
  supervisor: string;
  currentStage: WorkStage;
  expectedNextStage: WorkStage;
  nextRequiredAction: string;
  stageDate: string;
  ageDays: number;
  evidenceCount: number;
  lastUpdated: string;
  updatedBy: string;
  status: WorkProgressStatus;
};

export type WorkStageDetail = {
  id: string;
  stage: WorkStage;
  status: StatusValue;
  completionDate: string;
  updatedBy: string;
  remarks: string;
  relatedRecord: string;
  relatedHref: string;
  readOnly: boolean;
};

export type WorkProgressPhoto = {
  id: string;
  title: string;
  fileName: string;
  date: string;
};

export type WorkProgressHistory = {
  id: string;
  title: string;
  actor: string;
  dateTime: string;
  remarks: string;
};
