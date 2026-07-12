import type { StatusValue } from "@/components/shared/StatusBadge";

export type GcUploadStatus =
  | "Draft"
  | "Pending"
  | "In Review"
  | "Approved"
  | "Rejected"
  | "Sent Back";

export type EvidenceType = "Image" | "PDF" | "Document";

export type GcUploadRecord = {
  id: string;
  submissionId: string;
  customerId: string;
  customerName: string;
  bpTrNumber: string;
  mobileNumber: string;
  projectId: string;
  projectName: string;
  siteArea: string;
  siteAddress: string;
  gcCategory: string;
  pipelineType: string;
  submittedBy: string;
  submittedOn: string;
  reviewer: string;
  reviewedOn: string;
  fileCount: number;
  checklistDone: number;
  checklistTotal: number;
  remarks: string;
  status: GcUploadStatus;
};

export type GcChecklistItem = {
  id: string;
  label: string;
  type: EvidenceType;
  status: StatusValue | "Missing";
  required: boolean;
  remarks: string;
};

export type GcEvidenceItem = {
  id: string;
  title: string;
  type: EvidenceType;
  fileName: string;
  uploadedBy: string;
  uploadedOn: string;
  status: StatusValue;
};

export type GcReviewComment = {
  id: string;
  actor: string;
  role: string;
  dateTime: string;
  comment: string;
  status: GcUploadStatus;
};
