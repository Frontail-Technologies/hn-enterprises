import type { StatusValue } from "@/components/shared/StatusBadge";

export type WorkableStatus = "Workable" | "Partially Workable" | "Not Workable";
export type SubmissionStatus =
  | "Draft"
  | "Submitted"
  | "In Review"
  | "Approved"
  | "Sent Back"
  | "Rejected";

export type Survey = {
  id: string;
  surveyId: string;
  customerId: string;
  customerName: string;
  mobileNumber: string;
  bpTrNumber: string;
  projectId: string;
  projectName: string;
  siteArea: string;
  supervisor: string;
  submittedBy: string;
  surveyDate: string;
  submissionDate: string;
  workableStatus: WorkableStatus;
  submissionStatus: SubmissionStatus;
  fullAddress: string;
  latitude: number;
  longitude: number;
  captureAccuracy: string;
  houseType: string;
  connectionType: string;
  siteAccessibility: StatusValue;
  meterPlacement: StatusValue;
  pipelineRoute: StatusValue;
  civilWorkRequired: string;
  obstructionDetails: string;
  notes: string;
  reason: string;
  recommendedAction: string;
  expectedResolutionDate: string;
  remarks: string;
  approvalComments: string;
  photoCount: number;
};

export type SurveyPhoto = {
  id: string;
  label: string;
  caption: string;
  fileName: string;
};

export type SurveyActivity = {
  id: string;
  title: string;
  actor: string;
  dateTime: string;
  description: string;
};

export type SurveyRevision = {
  id: string;
  revisionNumber: string;
  status: SubmissionStatus;
  submittedBy: string;
  date: string;
  notes: string;
};

export type SurveyFormValues = Omit<
  Survey,
  "id" | "surveyId" | "submissionDate" | "submittedBy" | "approvalComments" | "photoCount"
>;
