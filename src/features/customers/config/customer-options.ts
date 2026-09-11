import type {
  CustomerStatus,
  CustomerSurveyApprovalStatus,
  CustomerSurveyWorkableStatus,
} from "../types/customer.types";

export const connectionTypeOptions = [
  "Domestic",
  "Commercial",
  "Industrial",
] as const;

export const customerStatusOptions = [
  "Draft",
  "Pending",
  "Active",
  "Inactive",
  "On Hold",
  "Completed",
  "Archived",
] as const satisfies readonly CustomerStatus[];

export const paymentStatusOptions = [
  "Pending",
  "In Review",
  "Approved",
  "Rejected",
  "Completed",
] as const;

export const surveyWorkableStatusOptions = [
  "Workable",
  "Partially Workable",
  "Not Workable",
] as const satisfies readonly CustomerSurveyWorkableStatus[];

export const surveyApprovalStatusOptions = [
  "Draft",
  "Submitted",
  "In Review",
  "Approved",
  "Sent Back",
  "Rejected",
] as const satisfies readonly CustomerSurveyApprovalStatus[];

export const surveyConditionStatusOptions = [
  "Workable",
  "Partially Workable",
  "Not Workable",
  "Approved",
  "Rejected",
  "Pending",
] as const;

export const yesNoOptions = ["Yes", "No"] as const;
